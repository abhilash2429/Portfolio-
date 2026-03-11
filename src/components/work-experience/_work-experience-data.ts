import { createId } from "@paralleldrive/cuid2";

export type TWorkExperience = {
  id: string;
  company: string;
  website: string;
  role: string;
  description: string;
  stacks: string[];
};

const workExperiences: TWorkExperience[] = [
  {
    id: createId(),
    company: "Artrix-AI",
    website: "https://atrixai.works",
    role: "Co-Founder",
    description:
      "Building real time voice and chat agents, which would work Extraodinary on Indic Languages",
    stacks: [
      "Gemini AI SDK",
      "LangChain",
      "LangGraph",
      "Qdrant",
      "Python 3.11+",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "WebSockets",
      "Whisper",
      "Next.js 14",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ]
  },
];

export default workExperiences;
