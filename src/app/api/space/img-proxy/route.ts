import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "~/lib/space-auth";

export const runtime = "nodejs";

/** GET: auth-gated proxy for external card images (avoids hotlink blocks). */
export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("url") ?? "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "Only http(s)" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; space-bot)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));

    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) throw new Error("not an image");

    return new NextResponse(new Uint8Array(await res.arrayBuffer()), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    // tiny transparent fallback so broken previews don't break layout
    const px = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    );
    return new NextResponse(new Uint8Array(px), {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  }
}
