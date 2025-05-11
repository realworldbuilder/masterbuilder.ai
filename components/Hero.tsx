import Image from "next/image";
import { FC } from "react";
import InitialInputArea from "./InitialInputArea";
import { suggestions } from "@/utils/utils";
import camelLogo from "../public/camel_whitebg.png";

type THeroProps = {
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  handleChat: (messages?: { role: string; content: string }[]) => void;
  builderLevel: string;
  setBuilderLevel: React.Dispatch<React.SetStateAction<string>>;
  handleInitialChat: () => void;
};

const Hero: FC<THeroProps> = ({
  promptValue,
  setPromptValue,
  handleChat,
  builderLevel,
  setBuilderLevel,
  handleInitialChat,
}) => {
  const handleClickSuggestion = (value: string) => {
    setPromptValue(value);
  };

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center sm:mt-36">
        <a
          className="mb-4 inline-flex h-7 shrink-0 items-center gap-[9px] rounded-[50px] border-[0.5px] border-solid border-[#E6E6E6] bg-[rgba(255,235,219,0.65)] bg-white px-5 py-4 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)]"
          href="https://togetherai.link/"
          target="_blank"
        >
          <Image
            src={camelLogo}
            alt="camel"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-center text-sm font-medium italic">
            Powered by <b>Llama 3.1</b> and <b>Together AI</b>
          </span>
        </a>
        <h3 className="mt-2 text-center text-xl font-medium text-gray-800 sm:text-2xl">
          Your Personal Mentor for the New Stack
        </h3>
        <p className="mt-4 text-balance text-center text-sm sm:text-base">
          From first script to full-scale systems — MasterBuilder helps you level up with curated tools, agent workflows, and battle-tested playbooks.
        </p>

        <ul className="mt-6 flex flex-col items-center space-y-2 text-sm sm:text-base">
          <li className="flex items-center">
            <span className="mr-2">1️⃣</span> Pick what you want to build.
          </li>
          <li className="flex items-center">
            <span className="mr-2">2️⃣</span> Choose your current level.
          </li>
          <li className="flex items-center">
            <span className="mr-2">3️⃣</span> Get a tailored guide — instantly.
          </li>
        </ul>

        <div className="mt-6 w-full pb-6">
          <InitialInputArea
            promptValue={promptValue}
            handleInitialChat={handleInitialChat}
            setPromptValue={setPromptValue}
            handleChat={handleChat}
            builderLevel={builderLevel}
            setBuilderLevel={setBuilderLevel}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pb-[30px] lg:flex-nowrap lg:justify-normal">
          {suggestions.map((item) => (
            <div
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-solid border-[#C1C1C1] px-4 py-2 transition hover:bg-[#FFF0E6]"
              onClick={() => handleClickSuggestion(item?.name)}
              key={item.id}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm font-medium leading-[normal] text-[#1B1B16]">
                {item.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-light leading-[normal] text-[#1B1B16]">
          Fully open source!{" "}
          <span className="text-sm font-medium text-primary underline">
            <a
              href="https://github.com/Nutlope/llamatutor"
              target="_blank"
              rel="noopener noreferrer"
            >
              Star it on github.
            </a>
          </span>
        </p>
      </div>
    </>
  );
};

export default Hero;
