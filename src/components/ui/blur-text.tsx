"use client";

import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

/**
 * BlurText — word-by-word blur reveal (react-bits / Magic UI style).
 * Splits text into words; each word fades + rises + de-blurs in a
 * staggered cascade when scrolled into view. Plays once.
 *
 * Theme-aware: uses foreground/muted tokens inherited from the parent,
 * works identically in light and dark UIs. Reduced-motion safe.
 */

type Props = {
  text: string;
  className?: string;
  /** Seconds before the cascade starts (extra beat after section enters) */
  delay?: number;
  /** Stagger between words, in seconds */
  stagger?: number;
};

const container = (delay: number, stagger: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const word = {
  hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const BlurText = ({ text, className, delay = 0, stagger = 0.06 }: Props) => {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={container(delay, stagger)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          variants={word}
          className="inline-block will-change-[opacity,transform,filter]"
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default BlurText;
