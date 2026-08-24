"use client";

import { ReactNode, useEffect, useState } from "react";
import { introStore } from "./intro-store";

/**
 * Wraps the homepage sections and plays the staggered blur reveal
 * (fade + rise + blur-to-sharp, cascading delays) right after the
 * first-visit intro finishes — matching the original design's
 * `@keyframes up` language.
 *
 * On repeat visits (no intro) or reduced motion, content just shows.
 */
const REVEAL_DELAY_MS = 180; // let the intro's fade-out get going first

const IntroReveal = ({ children }: { children: ReactNode }) => {
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

    // Cover the case where the intro already finished before we mounted
    maybeReveal();
    return introStore.subscribe(maybeReveal);
  }, []);

  return (
    <div className={revealed ? "intro-reveal is-revealed" : "intro-reveal"}>
      {children}
    </div>
  );
};

export default IntroReveal;
