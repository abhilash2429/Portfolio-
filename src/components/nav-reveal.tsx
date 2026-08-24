"use client";

import { ReactNode, useEffect, useState } from "react";
import { introStore } from "./intro-store";

/**
 * Wraps the navbar and plays a blur drop-in (fade + fall + blur-to-sharp)
 * right after the first-visit intro finishes — the nav leads the cascade,
 * before the page sections rise in.
 *
 * On repeat visits (no intro) or reduced motion, it just shows.
 */
const REVEAL_DELAY_MS = 120;

const NavReveal = ({ children }: { children: ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!introStore.shouldPlay()) {
      setRevealed(true);
      return;
    }

    const maybeReveal = () => {
      if (!introStore.isActive()) {
        window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
      }
    };

    maybeReveal();
    return introStore.subscribe(maybeReveal);
  }, []);

  return (
    <div
      className={
        revealed ? "nav-intro-reveal is-revealed" : "nav-intro-reveal"
      }
    >
      {children}
    </div>
  );
};

export default NavReveal;
