// import llama3Tokenizer from "llama3-tokenizer-js";

export const cleanedText = (text: string) => {
  let newText = text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n")
    .substring(0, 100000);

  // console.log(llama3Tokenizer.encode(newText).length);

  return newText;
};

export async function fetchWithTimeout(
  url: string,
  options = {},
  timeout = 3000,
) {
  // Create an AbortController
  const controller = new AbortController();
  const { signal } = controller;

  // Set a timeout to abort the fetch
  const fetchTimeout = setTimeout(() => {
    controller.abort();
  }, timeout);

  // Start the fetch request with the abort signal
  return fetch(url, { ...options, signal })
    .then((response) => {
      clearTimeout(fetchTimeout); // Clear the timeout if the fetch completes in time
      return response;
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        throw new Error("Fetch request timed out");
      }
      throw error; // Re-throw other errors
    });
}

type suggestionType = {
  id: number;
  name: string;
  emoji: string;
};

export const suggestions: suggestionType[] = [
  {
    id: 1,
    name: "Build an AI Agent",
    emoji: "🤖",
  },
  {
    id: 2,
    name: "Deploy with Vercel",
    emoji: "🚀",
  },
  {
    id: 3,
    name: "Use the Replicate API",
    emoji: "🔄",
  },
  {
    id: 4,
    name: "Design a RAG Pipeline",
    emoji: "📊",
  },
];

export const getSystemPrompt = (
  finalResults: { fullContent: string }[],
  builderLevel: string,
) => {
  return `
  You are a professional mentor and guide for digital builders who is an expert at building systems, apps, AI agents, and technical workflows. Given a topic and the relevant information, guide the user through practical implementation at a ${builderLevel} level. Start by greeting the builder, providing a concise overview of the concept, and then offer a few clear paths forward (in markdown numbers). Maintain an engaging, action-oriented conversation and occasionally check their understanding with practical application questions after explaining key concepts. Keep your initial message brief and focused.

  Here is the reference information:

  <reference_info>
  ${"\n"}
  ${finalResults
    .slice(0, 7)
    .map(
      (result, index) => `## Resource #${index}:\n ${result.fullContent} \n\n`,
    )}
  </reference_info>

  Here's the builder level to calibrate for:

  <builder_level>
  ${builderLevel}
  </builder_level>

  Please format your response in clear, well-structured markdown. Focus on actionable steps, relevant tools, and practical implementation. Here is the topic to guide on:
    `;
};
