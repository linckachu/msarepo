import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import type { CatalogItem, CatalogKind } from "@/data/catalog";

const DIZIPAL_ORIGIN = "https://dizipalw.com";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const PLAYER_PASSPHRASE =
  process.env.DIZIPAL_PLAYER_PASSPHRASE ??
  "3hPn4uCjTVtfYWcjIcoJQ4cL1WWk1qxXI39egLYOmNv6IblA7eKJz68uU3eLzux1biZLCms0quEjTYniGv5z1JcKbNIsDQFSeIZOBZJz4is6pD7UyWDggWWzTLBQbHcQFpBQdClnuQaMNUHtLHTpzCvZy33p6I7wFBvL4fnXBYH84aUIyWGTRvM2G5cfoNf4705tO2kv";

const palettes: [string, string][] = [
  ["#14213d", "#fca311"],
  ["#3d405b", "#81b29a"],
  ["#2b2d42", "#ef8354"],
  ["#003049", "#669bbc"],
  ["#432818", "#bb9457"],
  ["#10002b", "#7b2cbf"],
  ["#1d3557", "#a8dadc"],
  ["#264653", "#e76f51"],
];

type EncryptedPlayer = {
  ciphertext: string;
  iv: string;
  salt: string;
};

const playerCache = new Map<string, { url: string; expiresAt: number }>();
const pendingPlayers = new Map<string, Promise<string>>();

function decodeEntities(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertDizipalUrl(value: string) {
  const url = new URL(value, DIZIPAL_ORIGIN);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "dizipalw.com" ||
    (!url.pathname.startsWith("/film/") && !url.pathname.startsWith("/dizi/"))
  ) {
    throw new Error("Desteklenmeyen kaynak adresi.");
  }
  return url;
}

async function fetchHtml(
  url: URL | string,
  retry = true,
  cacheable = true,
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "tr-TR,tr;q=0.9",
      Referer: `${DIZIPAL_ORIGIN}/`,
      "User-Agent": BROWSER_USER_AGENT,
    },
    ...(cacheable ? { next: { revalidate: 300 } } : { cache: "no-store" as const }),
  });

  if (response.status === 429 && retry) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter)
      ? Math.min(Math.max(retryAfter * 1000, 500), 2500)
      : 1200;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return fetchHtml(url, false, cacheable);
  }

  if (!response.ok) {
    throw new Error(`Dizipal yanıtı başarısız: ${response.status}`);
  }

  return response.text();
}

export async function resolveDizipalPlayer(sourceUrl: string) {
  const pageUrl = assertDizipalUrl(sourceUrl);
  const cached = playerCache.get(pageUrl.href);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const pending = pendingPlayers.get(pageUrl.href);
  if (pending) return pending;

  const resolution = resolvePlayerUncached(pageUrl).finally(() => {
    pendingPlayers.delete(pageUrl.href);
  });
  pendingPlayers.set(pageUrl.href, resolution);
  return resolution;
}

async function resolvePlayerUncached(pageUrl: URL) {
  const html = await fetchHtml(pageUrl, true, false);
  const encryptedMatch = html.match(
    /<div[^>]+data-rm-k=["']true["'][^>]*>([\s\S]*?)<\/div>/i,
  );

  if (!encryptedMatch) {
    const directIframe = html.match(/<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i)?.[1];
    if (directIframe) {
      playerCache.set(pageUrl.href, { url: directIframe, expiresAt: Date.now() + 5 * 60_000 });
      return directIframe;
    }
    if (/too many requests|429/i.test(html)) {
      throw new Error("Dizipal geçici istek sınırına ulaştı. Birkaç saniye sonra tekrar deneyin.");
    }
    throw new Error("Bu içerikte yayınlanmış oynatıcı bulunmuyor.");
  }

  const payload = JSON.parse(decodeEntities(encryptedMatch[1])) as EncryptedPlayer;
  const key = pbkdf2Sync(
    PLAYER_PASSPHRASE,
    Buffer.from(payload.salt, "hex"),
    999,
    32,
    "sha512",
  );
  const decipher = createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(payload.iv, "hex"),
  );
  const playerUrl = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ])
    .toString("utf8")
    .trim();

  const parsedPlayerUrl = new URL(playerUrl, pageUrl.origin);
  if (parsedPlayerUrl.protocol !== "https:") {
    throw new Error("Güvenli olmayan oynatıcı adresi reddedildi.");
  }

  const resolved = parsedPlayerUrl.toString();
  playerCache.set(pageUrl.href, { url: resolved, expiresAt: Date.now() + 5 * 60_000 });
  return resolved;
}

export async function fetchDizipalCatalog(): Promise<CatalogItem[]> {
  const html = await fetchHtml(DIZIPAL_ORIGIN);
  const anchorPattern =
    /<a\b[^>]*href=["'](https:\/\/dizipalw\.com\/(film|dizi)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  const films: CatalogItem[] = [];
  const series: CatalogItem[] = [];
  let match: RegExpExecArray | null;
  let paletteIndex = 0;

  const latestMoviesMarker = html.lastIndexOf("Son Eklenen Filmler");
  const latestMovieHtml = latestMoviesMarker >= 0
    ? html.slice(latestMoviesMarker, latestMoviesMarker + 180_000)
    : html;
  const episodeLinks = new Set(
    [...html.matchAll(/https:\/\/dizipalw\.com\/dizi\/[^"']+\/\d+-sezon-[^"']+-bolum/gi)].map(
      (entry) => entry[0],
    ),
  );

  while ((match = anchorPattern.exec(html))) {
    const [, sourceUrl, rawKind, block] = match;
    if (seen.has(sourceUrl)) continue;

    if (rawKind === "film") {
      if (!latestMovieHtml.includes(`href="${sourceUrl}"`) && !latestMovieHtml.includes(`href='${sourceUrl}'`)) {
        continue;
      }
    } else if (!episodeLinks.has(sourceUrl)) {
      continue;
    }

    const posterMatch = block.match(/data-src=["']([^"']+)["']/i);
    const titleMatch = block.match(/<img[^>]+alt=["']([^"']+)["']/i) ??
      block.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
    if (!titleMatch || !posterMatch) continue;

    const title = decodeEntities(titleMatch[1]);
    if (!title) continue;

    const kind = rawKind as CatalogKind;
    const text = decodeEntities(block);
    const year = Number(text.match(/\b(19\d{2}|20\d{2})\b/)?.[1] ?? new Date().getFullYear());
    const episode = text.match(/(\d+\. Sezon\s+\d+\. Bölüm)/i)?.[1];
    const score = Number(text.match(/\b(\d\.\d)\b/)?.[1] ?? 0);
    const target = kind === "film" ? films : series;

    seen.add(sourceUrl);
    target.push({
      id: seen.size,
      title,
      originalTitle: title,
      year,
      score,
      duration: episode ?? (kind === "film" ? "Film" : "Yeni bölüm"),
      kind,
      genres: [kind === "film" ? "Film" : "Dizi"],
      description: `${title} için Dizipal sayfasındaki güncel oynatıcı.`,
      palette: palettes[paletteIndex++ % palettes.length],
      label: target.length < 2 ? "Yeni" : undefined,
      posterUrl: decodeEntities(posterMatch[1]),
      sourceUrl,
    });

    if (films.length >= 6 && series.length >= 6) break;
  }

  return [...films.slice(0, 6), ...series.slice(0, 6)].map((item, index) => ({
    ...item,
    id: index + 1,
  }));
}
