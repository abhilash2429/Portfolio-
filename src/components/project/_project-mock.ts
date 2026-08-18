import { createId } from "@paralleldrive/cuid2";
import { StaticImageData } from "next/image";
import { ChainGpt } from "~/assets/svg";

// Project cover images
import Macky from "~/assets/images/cover/Macky.png";
import IntelliCredit from "~/assets/images/cover/IntelliCredit.png";
import DeepRead from "~/assets/images/cover/DeepRead.png";
import SumItUp from "~/assets/images/cover/SumItUp.png";
import AnonChat from "~/assets/images/cover/Anon-Chat.png";

export type TProject = {
  id: string;
  Icon?: any;
  title: string;
  description: string;
  deployedURL?: string;
  demoUrl?: string;
  cover: StaticImageData | string;
  stacks: string[];
  isRepo?: boolean;
  repoUrl?: string;
};

const projects: TProject[] = [
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Macky`,
    description:
      "macOS voice assistant in the screen notch with push-to-talk real-time streaming, background sub-agent orchestration, and MCP integrations.",
    deployedURL: "https://heymacky.vercel.app/",
    demoUrl: "https://youtu.be/SIRyFt7ISx0",
    cover: Macky,
    stacks: ["Swift", "GPT-Realtime-2", "Cloudflare Workers", "Azure AI Foundry", "MCP"],
    isRepo: false,
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `DeepRead`,
    description:
      "AI system that breaks down ML research papers with a 4-stage LangGraph pipeline and an SSE-streamed PyTorch code Q&A agent.",
    deployedURL: "https://deep-read-seven.vercel.app/",
    cover: DeepRead,
    stacks: ["LangGraph", "LangChain", "FastAPI", "Gemini", "PostgreSQL"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/DeepRead",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Anon-Chat`,
    description:
      "High-concurrency anonymous chat backend handling 1,000+ simultaneous connections on stateless Node.js WebSockets.",
    deployedURL: "https://anon-chat2.vercel.app/",
    cover: AnonChat,
    stacks: ["Node.js", "WebSockets", "Next.js", "TypeScript"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/Anon-Chat",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Intelli Credit`,
    description:
      "AI-powered corporate credit appraisal engine with distributed Celery pipelines and XGBoost risk scoring.",
    deployedURL: "https://intelli-credit-kappa.vercel.app/",
    cover: IntelliCredit,
    stacks: ["XGBoost", "LangChain", "Celery", "FastAPI"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/IITH_Argus",
  },
  {
    id: createId(),
    Icon: ChainGpt,
    title: `Sum-it-Up`,
    description:
      "Chrome extension that summarizes web pages, YouTube videos, and text using Gemini.",
    deployedURL: "https://github.com/abhilash2429/Sum-it-Up",
    cover: SumItUp,
    stacks: ["Chrome Extension", "Gemini", "JavaScript"],
    isRepo: true,
    repoUrl: "https://github.com/abhilash2429/Sum-it-Up",
  },
];

export default projects;
