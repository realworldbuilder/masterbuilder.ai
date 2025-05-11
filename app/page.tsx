"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sources from "@/components/Sources";
import { useState } from "react";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { getSystemPrompt } from "@/utils/utils";
import Chat from "@/components/Chat";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [topic, setTopic] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [sources, setSources] = useState<{ name: string; url: string; isApi?: boolean }[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [builderLevel, setBuilderLevel] = useState("Vibe Coder");

  const handleInitialChat = async () => {
    setShowResult(true);
    setLoading(true);
    setTopic(inputValue);
    setInputValue("");

    await handleSourcesAndChat(inputValue);

    setLoading(false);
  };

  const handleChat = async (messages?: { role: string; content: string }[]) => {
    setLoading(true);
    const chatRes = await fetch("/api/getChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!chatRes.ok) {
      throw new Error(chatRes.statusText);
    }

    // This data is a ReadableStream
    const data = chatRes.body;
    if (!data) {
      return;
    }
    let fullAnswer = "";

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          fullAnswer += text;
          // Update messages with each chunk
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + text },
              ];
            } else {
              return [...prev, { role: "assistant", content: text }];
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
    setLoading(false);
  };

  async function handleSourcesAndChat(question: string) {
    setIsLoadingSources(true);
    let sourcesResponse = await fetch("/api/getSources", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    let sources;
    if (sourcesResponse.ok) {
      sources = await sourcesResponse.json();

      setSources(sources);
    } else {
      setSources([]);
    }
    setIsLoadingSources(false);

    const parsedSourcesRes = await fetch("/api/getParsedSources", {
      method: "POST",
      body: JSON.stringify({ sources }),
    });
    let parsedSources;
    if (parsedSourcesRes.ok) {
      parsedSources = await parsedSourcesRes.json();
    }

    // Count how many API sources we found
    const apiSourceCount = sources.filter((source: {isApi?: boolean}) => source.isApi).length;

    // Create the enhanced system prompt that includes API information
    const initialMessage = [
      { 
        role: "system", 
        content: getEnhancedSystemPrompt(parsedSources, builderLevel, apiSourceCount)
      },
      { role: "user", content: `${question}` },
    ];
    setMessages(initialMessage);
    await handleChat(initialMessage);
  }

  return (
    <>
      <Header />

      <main
        className={`flex grow flex-col px-4 pb-4 ${showResult ? "overflow-hidden" : ""}`}
      >
        {showResult ? (
          <div className="mt-2 flex w-full grow flex-col justify-between overflow-hidden">
            <div className="flex w-full grow flex-col space-y-2 overflow-hidden">
              <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-4 overflow-hidden lg:flex-row lg:gap-10">
                <Chat
                  messages={messages}
                  disabled={loading}
                  promptValue={inputValue}
                  setPromptValue={setInputValue}
                  setMessages={setMessages}
                  handleChat={handleChat}
                  topic={topic}
                />
                <Sources sources={sources} isLoading={isLoadingSources} />
              </div>
            </div>
          </div>
        ) : (
          <Hero
            promptValue={inputValue}
            setPromptValue={setInputValue}
            handleChat={handleChat}
            builderLevel={builderLevel}
            setBuilderLevel={setBuilderLevel}
            handleInitialChat={handleInitialChat}
          />
        )}
      </main>
      {/* <Footer /> */}
    </>
  );
}

// Function to generate an enhanced system prompt that includes API information
function getEnhancedSystemPrompt(
  finalResults: { fullContent: string }[],
  builderLevel: string,
  apiSourceCount: number
) {
  return `
  You are a professional mentor and guide for digital builders who is an expert at building systems, apps, AI agents, and technical workflows. You are also knowledgeable about APIs and integrations. Given a topic and the relevant information, guide the user through practical implementation at a ${builderLevel} level.

  Start by greeting the builder, providing a concise overview of the concept, and then offer a few clear paths forward (in markdown numbers). Maintain an engaging, action-oriented conversation and occasionally check their understanding with practical application questions after explaining key concepts.

  ${apiSourceCount > 0 ? `
  Since there are relevant APIs for this topic, include a dedicated "Recommended APIs" section in your response. For each API that could help with this task:
  • Provide the name and a brief description
  • Explain its primary use cases
  • Note any key advantages
  • Mention pricing model if available in the sources
  ` : ''}

  Keep your initial message brief and focused, with an emphasis on practical implementation.

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

  Please format your response in clear, well-structured markdown. Focus on actionable steps, relevant tools, APIs, and practical implementation. 
  `;
}
