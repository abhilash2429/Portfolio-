"use client";

import Image from "next/image";
import config from "~/config";
import { cn } from "~/lib/utils";
import { typo } from "./ui/typograpghy";
import codingImage from "~/assets/images/coding.png";

const AboutSection = () => {
  return (
    <section className="grid gap-8 sm:gap-4 md:grid-cols-3" aria-label="About">
      <div className="order-2 space-y-3 sm:order-1 md:col-span-2">
        <h1 className="font-serif text-2xl sm:text-3xl">Abhilash, 19</h1>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          Aspiring AI and Software Engineer working at the intersection of
          machine intelligence and software systems. I turn ideas into products
          that make me go crazy at 2 AM. Most of them start with a simple
          question — “Why?”
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          I have always been a big believer in technology. It impressed me from
          my early age — from iPods, Early Keypads to Android phones and now the present
          AI Revolution. I'm starting to love building things with AI, even when I
          don’t fully know how.
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          Constant learning, breaking things, and always working on something.
          I have a strong belief that all of this will get me somewhere.
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          And when I'm not building, I'm into financial markets, reading books,
          watching movies, or getting lost in random YouTube rabbit holes.
        </p>

        <p
          className={cn(
            typo({ variant: "paragraph", font: "sans" }),
            "sm:!mt-4"
          )}
        >
          <span className="text-foreground font-medium">Open to Work</span>:
          Internships , Full-Time, or Collabs.{" "}
          <a
            href={`mailto:${config.social.email}`}
            aria-label="Hire Me"
            className="el-focus-styles text-ring"
          >
            Let&apos;s talk.
          </a>
        </p>
      </div>

      <div className="relative order-1 block aspect-square sm:order-2 sm:hidden md:block md:h-[352px] md:w-[352px] md:self-center">
        <div className="absolute inset-0 -z-10 size-full rounded-md bg-gradient-to-br from-muted via-secondary to-background opacity-80" />
        <Image
          alt="Locked In"
          src={codingImage}
          placeholder="blur"
          className="size-full -rotate-3 transform rounded-md object-cover shadow-md dark:brightness-90 dark:contrast-125 dark:grayscale dark:saturate-0"
          priority
        />
      </div>
    </section>
  );
};

export default AboutSection;