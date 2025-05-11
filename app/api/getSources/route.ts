import { NextResponse } from "next/server";
import { z } from "zod";

let excludedSites = ["youtube.com"];
let searchEngine: "bing" | "serper" = "serper";

export async function POST(request: Request) {
  let { question } = await request.json();

  // Always create a general query but enhance it to find better results
  const finalQuestion = `${question}`;

  if (searchEngine === "bing") {
    const BING_API_KEY = process.env["BING_API_KEY"];
    if (!BING_API_KEY) {
      throw new Error("BING_API_KEY is required");
    }

    const params = new URLSearchParams({
      q: `${finalQuestion} ${excludedSites.map((site) => `-site:${site}`).join(" ")}`,
      mkt: "en-US",
      count: "6",
      safeSearch: "Strict",
    });

    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?${params}`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": BING_API_KEY,
        },
      },
    );

    const BingJSONSchema = z.object({
      webPages: z.object({
        value: z.array(z.object({ name: z.string(), url: z.string() })),
      }),
    });

    const rawJSON = await response.json();
    const data = BingJSONSchema.parse(rawJSON);

    let results = data.webPages.value.map((result) => ({
      name: result.name,
      url: result.url,
      isApi: isLikelyApi(result.name, result.url),
    }));

    return NextResponse.json(results);
    // TODO: Figure out a way to remove certain results like YT
  } else if (searchEngine === "serper") {
    const SERPER_API_KEY = process.env["SERPER_API_KEY"];
    if (!SERPER_API_KEY) {
      throw new Error("SERPER_API_KEY is required");
    }

    // Execute two searches - one general and one API-focused
    const [generalResponse, apiResponse] = await Promise.all([
      // General search
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: finalQuestion,
          num: 6,
        }),
      }),
      // API-specific search
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: `${question} API documentation developer`,
          num: 3,
        }),
      })
    ]);

    const generalJson = await generalResponse.json();
    const apiJson = await apiResponse.json();

    const SerperJSONSchema = z.object({
      organic: z.array(z.object({ title: z.string(), link: z.string() })),
    });

    const generalData = SerperJSONSchema.parse(generalJson);
    const apiData = SerperJSONSchema.parse(apiJson);

    // Process general results
    let generalResults = generalData.organic.map((result) => ({
      name: result.title,
      url: result.link,
      isApi: isLikelyApi(result.title, result.link),
    }));

    // Process API results
    let apiResults = apiData.organic.map((result) => ({
      name: result.title,
      url: result.link,
      isApi: true, // Force these results to be marked as APIs
    }));

    // Combine results, prioritizing APIs but maintaining a mix
    let combinedResults = [];
    
    // Deduplicate by URL
    const urlSet = new Set();
    
    // First add API results
    for (const result of apiResults) {
      if (!urlSet.has(result.url)) {
        urlSet.add(result.url);
        combinedResults.push(result);
      }
    }
    
    // Then add general results
    for (const result of generalResults) {
      if (!urlSet.has(result.url) && combinedResults.length < 9) {
        urlSet.add(result.url);
        combinedResults.push(result);
      }
    }

    return NextResponse.json(combinedResults);
  }
}

// Helper function to determine if a result likely references an API
function isLikelyApi(title: string, url: string): boolean {
  // Check for common API documentation domains
  const apiDomains = [
    "developers.", "developer.", "api.", "apis.", "docs.", 
    "documentation.", ".dev", "platform."
  ];
  
  // Check for API documentation paths
  const apiPaths = [
    "/api/", "/apis/", "/developers/", "/docs/api/", "/dev/", 
    "/documentation/api/", "/reference/", "/sdk/"
  ];
  
  // API-specific patterns that strongly indicate an actual API page
  const strongPatterns = [
    "/api/v1", "/api/v2", "/api/v3", "rest-api", "restful-api", 
    "graphql-api", "swagger", "openapi", "api-reference", 
    "api-documentation", "api-guide", "api-key"
  ];
  
  // Check domain first
  const lowerUrl = url.toLowerCase();
  
  // If it's clearly an API endpoint URL, it's not documentation
  if (lowerUrl.includes('api.') && 
      (lowerUrl.includes('/v1/') || 
       lowerUrl.includes('/v2/') || 
       lowerUrl.includes('/v3/'))) {
    return false;
  }
  
  // Look for strong indicators in the URL
  for (const pattern of strongPatterns) {
    if (lowerUrl.includes(pattern)) {
      return true;
    }
  }
  
  // Page title patterns that strongly indicate API docs
  const lowerTitle = title.toLowerCase();
  const titlePatterns = [
    "api reference", "api documentation", "developer api", 
    "rest api", "graphql api", "sdk reference", "api guide"
  ];
  
  for (const pattern of titlePatterns) {
    if (lowerTitle.includes(pattern)) {
      return true;
    }
  }
  
  // Check for common API domain patterns
  const domainMatch = apiDomains.some(domain => lowerUrl.includes(domain));
  
  // Check for common API path patterns
  const pathMatch = apiPaths.some(path => lowerUrl.includes(path));
  
  // Only consider it an API if both domain and path suggest it's API documentation
  if (domainMatch && pathMatch) {
    return true;
  }
  
  // More conservative check: if title has "API" as a standalone word (not part of another word)
  if (/\bapi\b/i.test(lowerTitle) && 
      (domainMatch || pathMatch || lowerTitle.includes("documentation") || 
       lowerTitle.includes("reference") || lowerTitle.includes("developer"))) {
    return true;
  }
  
  return false;
}
