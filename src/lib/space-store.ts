/**
 * Space storage — GitHub-backed so it survives Vercel redeploys.
 *
 * - space.json (all cards) lives at data/space.json in the repo
 * - uploaded images are committed to data/assets/<id>.<ext>
 *
 * Requires GITHUB_TOKEN (a fine-grained PAT with Contents: read/write on
 * this repo) + SPACE_REPO (= "abhilash2429/Portfolio-") in env.
 * Falls back to a local .data/ directory when unset (local dev).
 */

const REPO = process.env.SPACE_REPO ?? "";
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const BRANCH = "main";
const DATA_PATH = "data/space.json";
const ASSET_DIR = "data/assets";

export const githubMode = Boolean(REPO && TOKEN);

// ---------- local fallback ----------

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), ".data");
const localFile = (p: string) => path.join(LOCAL_DIR, p);

async function localRead(p: string): Promise<Buffer | null> {
  try {
    return await readFile(localFile(p));
  } catch {
    return null;
  }
}

async function localWrite(p: string, content: Buffer) {
  await mkdir(path.dirname(localFile(p)), { recursive: true });
  await writeFile(localFile(p), content);
}

// ---------- GitHub contents API ----------

type GhContents = {
  content?: string;
  sha?: string;
};

const gh = async (
  apiPath: string,
  init?: RequestInit & { body?: string },
) => {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${apiPath}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return res;
};

async function ghRead(p: string): Promise<{ buf: Buffer | null; sha: string | null }> {
  const res = await gh(`${p}?ref=${BRANCH}`);
  if (res.status === 404) return { buf: null, sha: null };
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const json: GhContents = await res.json();
  return { buf: Buffer.from(json.content ?? "", "base64"), sha: json.sha ?? null };
}

async function ghWrite(
  p: string,
  content: Buffer,
  sha: string | null,
  message: string,
): Promise<void> {
  const res = await gh(p, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: content.toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

// ---------- public API ----------

export async function readSpace(): Promise<string> {
  if (!githubMode) {
    const buf = await localRead(DATA_PATH);
    return buf?.toString("utf8") ?? '{"items":[]}';
  }

  // Retry once — concurrent writes can transiently 409 on fast-forward
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { buf } = await ghRead(DATA_PATH);
      return buf?.toString("utf8") ?? '{"items":[]}';
    } catch (e) {
      if (attempt === 1) throw e;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  return '{"items":[]}'; // unreachable
}

/** Read-modify-write with the blob SHA GitHub requires for updates. */
export async function writeSpace(
  mutate: (currentJson: string) => { json: string; commitMessage: string },
): Promise<void> {
  if (!githubMode) {
    const current = await localRead(DATA_PATH);
    const currentJson = current?.toString("utf8") ?? "{}";
    const { json } = mutate(currentJson);
    await localWrite(DATA_PATH, Buffer.from(json, "utf8"));
    return;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { buf, sha } = await ghRead(DATA_PATH);
      const currentJson = buf?.toString("utf8") ?? "{}";
      const { json, commitMessage } = mutate(currentJson);
      await ghWrite(DATA_PATH, Buffer.from(json, "utf8"), sha, commitMessage);
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

export async function uploadAsset(name: string, bytes: Buffer): Promise<string> {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const p = `${ASSET_DIR}/${Date.now()}-${safe}`;

  if (!githubMode) {
    await localWrite(p, bytes);
    return `/api/space/asset?path=${encodeURIComponent(p)}`;
  }

  const res = await ghWrite(p, bytes, null, `space: add asset ${safe}`);
  void res;
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`;
}
