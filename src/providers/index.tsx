"use client";
import { ReactNode } from "react";

import BottomBlur from "~/components/bottom-blur";
import ScrollProgress from "~/components/scroll-progress";
import { TooltipProvider } from "~/components/ui/tooltip";
import TopLoader from "~/components/ui/top-loader";
import ThemeProvider from "~/components/ui/theme-provider";
import LenisProvider from "./lenis";
import ReactQueryProvider from "./react-query";
import { Toaster } from "~/components/ui/sonner";

const RootProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LenisProvider>
        <ReactQueryProvider>
          <TooltipProvider>
            <ScrollProgress />
            <TopLoader />
            {children}
            <BottomBlur />
            <Toaster />
          </TooltipProvider>
        </ReactQueryProvider>
      </LenisProvider>
    </ThemeProvider>
  );
};

export default RootProviders;
