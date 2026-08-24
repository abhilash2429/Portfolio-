"use client";

import { useEffect } from "react";

/**
 * Strips the body-level classes that (main) layout relies on so the
 * space canvas owns 100% of the viewport with no page chrome.
 */
const FullscreenBody = () => {
  useEffect(() => {
    document.body.classList.add("space-fullscreen");
    return () => {
      document.body.classList.remove("space-fullscreen");
    };
  }, []);
  return null;
};

export default FullscreenBody;
