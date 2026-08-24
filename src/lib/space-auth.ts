import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Passcode auth for /space.
 * - SPACE_PASSCODE env var is the secret (set in Vercel dashboard).
 * - Successful auth mints a signed cookie valid for 30 days.
 * - Every /api/space route verifies this cookie before touching data.
 */

export const SPACE_COOKIE = "space_auth";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

const getPasscode = () => process.env.SPACE_PASSCODE ?? "";

const sign = (value: string) =>
  createHmac("sha256", getPasscode() || "dev-secret").update(value).digest("hex");

export const mintToken = () => {
  const issued = Date.now().toString();
  return `${issued}.${sign(issued)}`;
};

export const verifyToken = (token: string | undefined | null): boolean => {
  if (!token || !getPasscode()) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;

  // Constant-time signature comparison
  const expected = sign(issued);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_S * 1000;
};

export const isAuthed = async (): Promise<boolean> => {
  const store = await cookies();
  return verifyToken(store.get(SPACE_COOKIE)?.value);
};

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_S,
};
