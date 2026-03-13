import { createId } from "@paralleldrive/cuid2";
import { ChainGpt } from "~/assets/svg";

// Project cover images
import IntelliCredit from "~/assets/images/cover/IntelliCredit.png";
import DeepRead from "~/assets/images/cover/DeepRead.png";
import SumItUp from "~/assets/images/cover/SumItUp.png";
import AnonChat from "~/assets/images/cover/Anon-Chat.png";

const projects = [
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Intelli Credit`,
    description:
      "AI-powered corporate credit appraisal engine for Indian lending workflows.",
    deployedURL: "https://www.underdevelopment.com/",
    cover: IntelliCredit,
    stacks: ["XGBoost", "LangChain"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/IITH_Argus",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `DeepRead`,
    description:
      "AI system that turns machine learning research papers into implementation-ready technical briefings with a tool-calling Q&A agent.",
    deployedURL: "https://deep-read-seven.vercel.app/",
    cover: DeepRead,
    stacks: ["FastAPI", "Gemini", "LangChain", "Next.js", "Tailwind CSS", "PostgreSQL"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/DeepRead",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Anon-Chat`,
    description:
      "Anonymous chat application with end-to-end encryption and real-time messaging.",
    deployedURL: "https://anon-chat2.vercel.app/",
    cover: AnonChat,
    stacks: ["Websockets", "Next.js", "Tailwind CSS"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/Anon-Chat",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Sum-it-Up`,
    description:
      "Chrome extension that summarizes web pages, YouTube videos, and text",
    deployedURL: "https://github.com/abhilash2429/Sum-it-Up",
    cover: SumItUp,
    stacks: ["Chrome Extension", "Gemini", "Html , Css , JS"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/Sum-it-Up",
  },
];

export default projects;
export type TProject = (typeof projects)[0];
