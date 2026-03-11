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
        institution: "Gokaraju Rangaraju Institute of Engineering and Technology",
        website: "https://griet.ac.in/",
        degree: "Bachelor of Technology",
        description: "Computer Science and Engineering , Specializing in Artificial Intelligence and Machine Learning.",
        duration: "2024 - 2028",
    },
    {
        id: createId(),
        institution: "Excelllencia Junior College",
        website: "https://example.com/",
        degree: "InterMediate",
        description: "MPC",
        duration: "2022 - 2024",
    },
];

export default education;
