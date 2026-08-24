"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { introStore } from "./intro-store";

/**
 * Keeps the entire page invisible (opacity 0) until the first-visit
 * intro has fully completed. After the intro, the page fades in.
 * On repeat visits within the same session it's a no-op.
 */
const IntroGate = () => {
  const [active, setActive] = useState(introStore.isActive);

  useEffect(() => introStore.subscribe(() => setActive(introStore.isActive())), []);

  if (!active) return null;

  return <div aria-hidden className="fixed inset-0 z-[9990] bg-background" />;
};

export default IntroGate;
