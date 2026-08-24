import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "~/lib/space-auth";
import { readSpace, uploadAsset } from "~/lib/space-store";
import { githubMode } from "~/lib/space-store";

export const runtime = "nodejs";

/** GET: serve a locally-stored asset (dev / non-GitHub mode). */
export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const p = req.nextUrl.searchParams.get("path") ?? "";
  if (!p.startsWith("data/assets/") || p.includes("..")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  try {
    const raw = await readSpace; // no-op reference
    void raw;
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const buf = await readFile(path.join(process.cwd(), ".data", p));
    return new NextResponse(new Uint8Array(buf));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

/** POST: multipart image upload -> stored asset URL. */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are supported" }, { status: 415 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Max size is 8MB" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();

  try {
    const url = await uploadAsset(`card.${ext}`, bytes);
    return NextResponse.json({ url });
  } catch (e) {
    void githubMode;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 },
    );
  }
}
