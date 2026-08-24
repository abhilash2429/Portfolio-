"use client";

import NavList from "./nav-list";
import NavReveal from "~/components/nav-reveal";
import ThemeToggle from "~/components/ui/theme-toggle";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const Navbar = () => {
  const pathname = usePathname();
  const isBlogPost = pathname.startsWith("/blog/");

  return (
    <NavReveal>
      <nav
        className={cn(
          "z-50 mb-8 mt-8 flex justify-center",
          isBlogPost ? "static" : "sticky top-4"
        )}
        role="navigation"
      >
        <div className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-background/30 p-1 shadow-lg backdrop-blur-xl">
          <NavList />
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </nav>
    </NavReveal>
  );
};

export default Navbar;

