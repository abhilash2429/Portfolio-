"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const GitHubCalendar = dynamic(() => import("react-github-calendar"), {
  ssr: false,
});

const GitHubContributions = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="w-full">
      <GitHubCalendar
        username="abhilash2429"
        colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
        fontSize={12}
        blockSize={12}
        theme={{
          light: ["#ebedf0", "#999999", "#666666", "#333333", "#000000"],
          dark: ["#1b1b1b", "#333333", "#666666", "#999999", "#ffffff"],
        }}
      />
    </div>
  );
};

export default GitHubContributions;
