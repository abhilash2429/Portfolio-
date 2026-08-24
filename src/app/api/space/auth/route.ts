import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_OPTS, SPACE_COOKIE, isAuthed, mintToken, verifyToken } from "~/lib/space-auth";

export const runtime = "nodejs";

/** GET: am I logged in? POST: login with passcode. DELETE: logout. */
export async function GET() {
  return NextResponse.json({ authed: await isAuthed() });
}

export async function POST(req: NextRequest) {
  const { passcode } = (await req.json()) as { passcode?: string };
  const expected = process.env.SPACE_PASSCODE ?? "";

  if (!expected) {
    return NextResponse.json(
      { error: "SPACE_PASSCODE is not configured on the server." },
      { status: 500 },
    );
  }

  if (!passcode || passcode !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const store = await cookies();
  store.set(SPACE_COOKIE, mintToken(), COOKIE_OPTS);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SPACE_COOKIE);
  return NextResponse.json({ ok: true });
}

// keep verifyToken referenced for type completeness
void verifyToken;
