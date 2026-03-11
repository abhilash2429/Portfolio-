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
  SiKeras,
  SiTensorflow,
  SiNpm,
  SiC,
  SiPython,
  SiHtml5,
  SiArchlinux,
  SiMongodb,
  SiPytorch,
  SiGithub,
  SiGit,
  SiFastapi,
  SiNumpy,
  SiPandas,
} from "react-icons/si";

export type stacksProps = Record<
  string,
  {
    Icon: IconType;
    className: string;
  }
>;

export const BACKEND_STACKS: stacksProps = {
  // AI / Machine Learning
  Python: { Icon: SiPython, className: "" },
  PyTorch: { Icon: SiPytorch, className: "" },
  TensorFlow: { Icon: SiTensorflow, className: "" },
  Keras: { Icon: SiKeras, className: "" },
  "Scikit-learn": { Icon: BsRobot, className: "" },
  NumPy: { Icon: SiNumpy, className: "" },
  Pandas: { Icon: SiPandas, className: "" },

  // GenAI / Agents
  Gemini: { Icon: BsRobot, className: "" },
  LangChain: { Icon: BsRobot, className: "" },
  LangGraph: { Icon: BsRobot, className: "" },
  Qdrant: { Icon: BsRobot, className: "" },
  "Web Search APIs": { Icon: BsRobot, className: "" },

  // Backend / Data
  FastAPI: { Icon: SiFastapi, className: "" },
  SQL: { Icon: BiLogoPostgresql, className: "" },
  MongoDB: { Icon: SiMongodb, className: "" },

  // Development
  Git: { Icon: SiGit, className: "" },
  GitHub: { Icon: SiGithub, className: "" },
  npm: { Icon: SiNpm, className: "" },
};

export const FRONTEND_STACKS: stacksProps = {
  JavaScript: { Icon: SiJavascript, className: "" },
  TypeScript: { Icon: SiTypescript, className: "" },
  "Next.js": { Icon: SiNextdotjs, className: "" },
  "React.js": { Icon: SiReact, className: "" },
  TailwindCSS: { Icon: SiTailwindcss, className: "" },
  Bootstrap: { Icon: BsFillBootstrapFill, className: "" },
  CSS: { Icon: SiCss, className: "" },
  C: { Icon: SiC, className: "" },
  Python: { Icon: SiPython, className: "" },
  HTML: { Icon: SiHtml5, className: "" },
};