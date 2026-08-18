import { createId } from "@paralleldrive/cuid2";

export type TEducation = {
    id: string;
    institution: string;
    website: string;
    degree: string;
    description: string;
    duration: string;
};

const education: TEducation[] = [
    {
        id: createId(),
        institution: "GRIET, Hyderabad",
        website: "https://griet.ac.in/",
        degree: "B.Tech, CS & Engineering (AI & ML) — CGPA: 9.0",
        description: "Gokaraju Rangaraju Institute of Engineering and Technology. Specialization in Artificial Intelligence and Machine Learning.",
        duration: "2024 - 2028",
    },
    {
        id: createId(),
        institution: "Excellencia Junior College, Hyderabad",
        website: "https://excellencia.co.in/",
        degree: "Intermediate (MPC) — Percentage: 97.0%",
        description: "State Board Intermediate Education with Mathematics, Physics, and Chemistry.",
        duration: "2022 - 2024",
    },
];

export default education;
