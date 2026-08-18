import { BiLogoPostgresql } from "react-icons/bi";
import { BsFillBootstrapFill, BsRobot } from "react-icons/bs";
import { IconType } from "react-icons/lib";
import {
  SiCss,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiTensorflow,
  SiNpm,
  SiC,
  SiPython,
  SiHtml5,
  SiMongodb,
  SiPytorch,
  SiGithub,
  SiGit,
  SiFastapi,
  SiNumpy,
  SiPandas,
  SiNodedotjs,
  SiDocker,
  SiExpress,
  SiOpenai,
  SiPostgresql,
  SiSwift,
} from "react-icons/si";

export type stacksProps = Record<
  string,
  {
    Icon: IconType;
    className: string;
  }
>;

export const BACKEND_STACKS: stacksProps = {
  // Agentic AI & ML
  LangGraph: { Icon: BsRobot, className: "" },
  LangChain: { Icon: BsRobot, className: "" },
  "OpenAI Agents SDK": { Icon: SiOpenai, className: "" },
  "MCP": { Icon: BsRobot, className: "" },
  "Agentic RAG": { Icon: BsRobot, className: "" },
  PyTorch: { Icon: SiPytorch, className: "" },
  TensorFlow: { Icon: SiTensorflow, className: "" },
  "Scikit-learn": { Icon: BsRobot, className: "" },
  NumPy: { Icon: SiNumpy, className: "" },
  Pandas: { Icon: SiPandas, className: "" },

  // Backend & Distributed Systems
  "Node.js": { Icon: SiNodedotjs, className: "" },
  FastAPI: { Icon: SiFastapi, className: "" },
  "Express.js": { Icon: SiExpress, className: "" },
  WebSockets: { Icon: BsRobot, className: "" },
  Docker: { Icon: SiDocker, className: "" },

  // Databases
  PostgreSQL: { Icon: SiPostgresql, className: "" },
  MongoDB: { Icon: SiMongodb, className: "" },
  Qdrant: { Icon: BsRobot, className: "" },
};

export const FRONTEND_STACKS: stacksProps = {
  // Languages & Frontend
  Python: { Icon: SiPython, className: "" },
  TypeScript: { Icon: SiTypescript, className: "" },
  JavaScript: { Icon: SiJavascript, className: "" },
  C: { Icon: SiC, className: "" },
  SQL: { Icon: BiLogoPostgresql, className: "" },
  Swift: { Icon: SiSwift, className: "" },
  "Next.js": { Icon: SiNextdotjs, className: "" },
  React: { Icon: SiReact, className: "" },
  TailwindCSS: { Icon: SiTailwindcss, className: "" },
  GitHub: { Icon: SiGithub, className: "" },
  Git: { Icon: SiGit, className: "" },
};