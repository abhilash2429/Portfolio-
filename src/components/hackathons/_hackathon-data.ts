import { createId } from "@paralleldrive/cuid2";

export type THackathon = {
  id: string;
  title: string;
  role: string;
  date: string;
  link?: string;
  description: string[];
};

const hackathons: THackathon[] = [
  {
    id: createId(),
    title: "TCS AI Hackathon — TCS Technology Day",
    role: "Winner",
    date: "July 2026",
    link: "https://drive.google.com/file/d/10CNecnstq9_I7sGFySNo0rsbjeyZCStA/view?usp=sharing",
    description: [
      "Won first place as part of a 5-person team, beating roughly 30 competing teams (about 150 participants) in TCS's company-wide AI hackathon.",
      "Built an AI agent that ingests bulk customer feedback and turns it into structured output — complaint categories, sentiment trends, and actionable insights.",
    ],
  },
  {
    id: createId(),
    title: "Meta x PyTorch x OpenEnv x Scaler Hackathon",
    role: "Grand Finalist",
    date: "May 2026",
    link: "https://drive.google.com/file/d/1WuTUidWNzSoFeN349NXxyhVj-Tt4AKbd/view",
    description: [
      "Cleared Round 1 solo out of 52,000+ registrants (roughly the top 0.1%), building GitMergeEnv — an RL environment for git merge conflict resolution with three difficulty tiers, a deterministic grader, and reward shaping tuned toward better fixes.",
      "Advanced to the in-person Grand Finale in Bangalore with Oversight Arena, a five-worker pipeline that moves through requirement analysis, codegen, test generation, security review, and deploy approval, with two adversarial mechanics (hidden-flaw state & colluding-pair mode). Trained Qwen2.5-3B against it with GRPO.",
    ],
  },
  {
    id: createId(),
    title: "IIT Hyderabad Innovation Hackathon",
    role: "Finalist",
    date: "March 2026",
    link: "https://drive.google.com/file/d/12bqjwjR-m-M1cy7cO535n9wDSOPxa5L8/view",
    description: [
      "Built Intelli-Credit, an AI credit-appraisal engine with distributed Celery pipelines and XGBoost risk scoring; reached the finals among competing student teams.",
    ],
  },
];

export default hackathons;
