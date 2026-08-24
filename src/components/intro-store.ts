"use client";

/**
 * Tiny module-level store shared between IntroLoader (producer) and
 * IntroGate (consumer). The gate keeps the page invisible until the
 * intro has fully finished, so no UI flashes behind the overlay.
 */

type Listener = () => void;

let introActive = false;

const listeners = new Set<Listener>();

export const introStore = {
  isActive: () => introActive,
  shouldPlay: () => {
    if (typeof window === "undefined") return false;
    let played = false;
    try {
      played = sessionStorage.getItem("ab24-intro-played") === "1";
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !played && !reduced;
  },
  setActive(value: boolean) {
    if (introActive === value) return;
    introActive = value;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
