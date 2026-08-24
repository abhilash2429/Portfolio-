"use client";

import codingImage from "~/assets/images/coding.png";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { introStore } from "./intro-store";

/**
 * First-visit intro:
 * 1. "Hello" cycles through languages — fast but readable (~330ms each).
 * 2. "i'm ● Abhilash" holds for 2s.
 * 3. The whole stage fades away and the page appears exactly as a
 *    normal load would — no photo flight, no fancy handoff.
 *
 * The page stays hidden (IntroGate) until this finishes, so the UI never
 * flashes behind the overlay.
 *
 * Plays once per browser session (sessionStorage). Skipped entirely for
 * users who prefer reduced motion. Click anywhere to skip.
 */

type Phase = "idle" | "hello" | "name" | "exiting";

const HELLOS = [
  "Hello", // English
  "Hola", // Spanish
  "Bonjour", // French
  "Ciao", // Italian
  "Olá", // Portuguese
  "こんにちは", // Japanese
  "你好", // Chinese
  "Привет", // Russian
  "नमस्ते", // Hindi
  "నమస్తే", // Telugu
];

const HELLO_MS = 330; // per language — quick, still readable
const NAME_MS = 2000; // "i'm Abhilash" hold time
const EXIT_MS = 0.35; // seconds — final fade back to the normal page
const AVATAR_SIZE = 96; // px — circle size in the center stage
const STORAGE_KEY = "ab24-intro-played";

const IntroLoader = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    document.body.style.overflow = "";
    introStore.setActive(false);
    setPhase("idle");
  }, []);

  const beginExit = useCallback(() => setPhase("exiting"), []);

  const skip = useCallback(() => {
    if (phase === "idle") return;
    finish();
  }, [phase, finish]);

  // Start on first visit only
  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {}

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!played && !reduced) {
      introStore.setActive(true);
      document.body.style.overflow = "hidden";
      setPhase("hello");
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Cycle through the hellos
  useEffect(() => {
    if (phase !== "hello") return;
    const iv = setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= HELLOS.length) {
          clearInterval(iv);
          setPhase("name");
          return i;
        }
        return i + 1;
      });
    }, HELLO_MS);
    return () => clearInterval(iv);
  }, [phase]);

  // Hold the name, then hand off to the plain page
  useEffect(() => {
    if (phase !== "name") return;
    const t = setTimeout(beginExit, NAME_MS);
    return () => clearTimeout(t);
  }, [phase, beginExit]);

  if (phase === "idle") return null;

  return (
    <motion.div
      aria-label="Intro"
      onClick={finish}
      className="fixed inset-0 z-[9998] flex cursor-pointer items-center justify-center bg-background select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exiting" ? 0 : 1 }}
      transition={{
        duration: phase === "exiting" ? EXIT_MS : 0.25,
        ease: "easeOut",
      }}
      onAnimationComplete={
        phase === "exiting" ? finish : undefined
      }
    >
      {/* Soft radial tint — tuned for light UI, token-driven for dark */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,hsl(var(--muted))_0%,transparent_62%)] opacity-70 dark:opacity-40"
      />

      <div className="relative flex items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {phase === "hello" && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(5px)" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <span className="font-serif text-5xl tracking-tight text-foreground sm:text-7xl">
                {HELLOS[index]}
                <span aria-hidden className="ml-2 align-middle text-muted-foreground/60">
                  ·
                </span>
              </span>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div
              key="name-stage"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-3 sm:gap-5"
            >
              <span className="font-serif text-2xl italic text-muted-foreground sm:text-4xl">
                i&apos;m
              </span>

              <span
                className="block overflow-hidden rounded-full ring-1 ring-border shadow-md dark:ring-white/20"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  marginLeft: "-0.25rem",
                }}
              >
                <Image
                  src={codingImage}
                  alt="Abhilash"
                  priority
                  className="size-full object-cover object-top"
                />
              </span>

              <span className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-6xl">
                Abhilash
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase !== "exiting" && (
        <span className="absolute bottom-8 text-xs tracking-wide text-muted-foreground/70">
          click anywhere to skip
        </span>
      )}
    </motion.div>
  );
};

export default IntroLoader;
