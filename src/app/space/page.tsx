import type { Metadata } from "next";
import SpaceCanvas from "~/components/space/space-canvas";

export const metadata: Metadata = {
  title: " ",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * /space — fully hidden private canvas.
 * Lives OUTSIDE the (main) layout on purpose: no navbar, no footer,
 * no container — the entire viewport is the canvas. Not linked from
 * anywhere; only you know the URL + passcode.
 */
const SpacePage = () => {
  return <SpaceCanvas />;
};

export default SpacePage;
