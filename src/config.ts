import { ConfigProps } from "./types/config";

export const config = {
  appName: "ab24",
  appDesignation: "AI & Software Engineer",
  appDescription: `Hi, I'm Abhilash. I'm Pragmatic.`,

  domainName: "abhilash24.me",

  colors: {
    theme: "dark",
    main: "#000000",
  },

  social: {
    github: "https://github.com/abhilash2429",
    linkedin: "https://www.linkedin.com/in/abhilashreddy2429/",
    instagram: "",
    discord: "https://discordapp.com/users/abhilash_2429",
    email: "abhilashreddy2429@gmail.com",
    phone: "+916303467135",
    youtube: "",
    twitter: "",
    buymeacoffee: "https://buymeacoffee.com/abhilash2429",
    resume: "https://example.com/your-resume.pdf",
  },

  auth: {
    loginUrl: "/api/auth/signin",
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
