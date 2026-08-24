import { NextRequest, NextResponse } from "next/server";
import { spaceDocSchema, spaceItemSchema } from "~/schema";
import { isAuthed } from "~/lib/space-auth";
import { readSpace, writeSpace } from "~/lib/space-store";

export const runtime = "nodejs";

/** GET: the whole space doc. */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await (readSpace as () => Promise<string>)();
    const parsed = spaceDocSchema.safeParse(JSON.parse(raw));
    return NextResponse.json(parsed.success ? parsed.data : { items: [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load space" },
      { status: 500 },
    );
  }
}

/**
 * PUT: full-document save. The client sends its complete items array;
 * we validate and commit atomically.
 */
export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = spaceDocSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid space document", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Strip defaults noise + sort deterministically for tidy commits
  const items = parsed.data.items
    .map((it) => spaceItemSchema.parse(it))
    .sort((a, b) => a.createdAt - b.createdAt);

  try {
    await writeSpace(() => ({
      json: JSON.stringify({ items }, null, 2),
      commitMessage: `space: sync canvas (${items.length} items)`,
    }));
    return NextResponse.json({ ok: true, count: items.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save space" },
      { status: 500 },
    );
  }
}
