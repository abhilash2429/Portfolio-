import { createId } from "@paralleldrive/cuid2";
import { ChainGpt } from "~/assets/svg";

// Project cover images
import IntelliCredit from "~/assets/images/cover/IntelliCredit.png";
import DeepRead from "~/assets/images/cover/DeepRead.png";

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
];

export default projects;
export type TProject = (typeof projects)[0];
