import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "~/lib/space-auth";

export const runtime = "nodejs";

/**
 * GET: link metadata for pasted URLs.
 * YouTube / X(Twitter) block generic scraping and need their dedicated
 * noembed/oEmbed endpoints — handled explicitly. Everything else uses
 * OpenGraph scraping with a fallback chain.
 */

type Meta = {
  url: string;
  kind: "web" | "youtube" | "x";
  title?: string;
  description?: string;
  image?: string;
  /** youtube video id or x tweet id */
  embedId?: string;
};

const YT_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"];
const X_HOSTS = ["x.com", "twitter.com", "www.x.com", "www.twitter.com", "mobile.x.com"];

function detect(url: URL): { kind: Meta["kind"]; embedId?: string } {
  if (YT_HOSTS.includes(url.hostname)) {
    let id = url.searchParams.get("v") ?? "";
    if (!id && url.hostname === "youtu.be") id = url.pathname.slice(1);
    if (!id) {
      const m = url.pathname.match(/\/(shorts|embed|live|v)\/([\w-]+)/);
      if (m) id = m[2];
    }
    return { kind: "youtube", embedId: id || undefined };
  }
  if (X_HOSTS.includes(url.hostname)) {
    const m = url.pathname.match(/\/status(?:es)?\/(\d+)/);
    return { kind: "x", embedId: m?.[1] };
  }
  return { kind: "web" };
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; space-bot)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function scrapeOg(target: URL) {
  try {
    const res = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error();
    const html = (await res.text()).slice(0, 500_000);
    const pick = (...patterns: RegExp[]) => {
      for (const re of patterns) {
        const m = html.match(re);
        if (m?.[1]) return decode(m[1].trim());
      }
      return undefined;
    };
    return {
      title:
        pick(
          /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
          /<title[^>]*>([^<]{1,200})<\/title>/i,
        ) ?? target.hostname,
      description: pick(
        /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
        /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i,
      ),
      image: pick(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i),
    };
  } catch {
    return { title: target.hostname, description: undefined, image: undefined };
  }
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'");

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

  const { kind, embedId } = detect(target);

  // ---- YouTube: noembed oEmbed gives clean title/author/thumbnail ----
  if (kind === "youtube" && embedId) {
    const data = await fetchJson(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${embedId}`,
    );
    return NextResponse.json({
      url: target.toString(),
      kind,
      embedId,
      title: (data?.title as string) ?? `YouTube · ${embedId}`,
      description: (data?.author_name as string) ?? undefined,
      image: `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`,
    } satisfies Meta);
  }

  // ---- X/Twitter: syndication API returns the tweet's real text + author ----
  if (kind === "x") {
    const data = await fetchJson(
      `https://cdn.syndication.twimg.com/tweet-result?id=${embedId}&token=x`,
    );
    if (data && data.text) {
      const media = (data.mediaDetails as { media_url_https: string }[] | undefined)?.[0];
      const author = data.user as { name?: string; screen_name?: string } | undefined;
      return NextResponse.json({
        url: target.toString(),
        kind,
        embedId,
        title: `${author?.name ?? ""}${author?.screen_name ? ` (@${author.screen_name})` : ""}` || "Post on X",
        description: data.text as string,
        image: media?.media_url_https,
      } satisfies Meta);
    }
    // fallback mirror
    const fx = await fetchJson(`https://api.fxtwitter.com/status/${embedId}`);
    const tweet = fx?.tweet as
      | { author?: { name?: string; screen_name?: string }; text?: string; media?: { photos?: { url: string }[] } }
      | undefined;
    return NextResponse.json({
      url: target.toString(),
      kind,
      embedId,
      title: tweet?.author
        ? `${tweet.author.name} (@${tweet.author.screen_name})`
        : "Post on X",
      description: tweet?.text,
      image: tweet?.media?.photos?.[0]?.url,
    } satisfies Meta);
  }

  // ---- everything else: OG scraping ----
  const og = await scrapeOg(target);
  return NextResponse.json({
    url: target.toString(),
    kind: "web",
    ...og,
  } satisfies Meta);
}
