// GET /api/preview?url=… : aperçu d'une page produit (titre, image, prix en yens, boutique) pour la barre « lien ou description ».
//
// Sécurité :
//   - seulement http(s), ports par défaut, nom de domaine public (pas d'adresse IP, pas de réseau interne : vérifié par DNS
//     à chaque étape, y compris après une redirection) ;
//   - 3 redirections au plus, 6 s au plus, 1,5 Mo lus au plus ; seuls des champs analysés sont renvoyés, jamais la page ;
//   - User-Agent honnête ; un site qui bloque les robots n'est pas contourné (l'aperçu échoue, la barre marche quand même) ;
//   - limite par visiteur et cache (mémoire + CDN) pour ne pas solliciter les boutiques.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { detectCharset, isPrivateAddress, parseProductHtml, type Preview } from "../../lib/linkPreview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA = "Mozilla/5.0 (compatible; KizunaProxyPreview/1.0; +https://kizunaproxy.com)";
const TIMEOUT_MS = 6000;
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

type Result = { ok: true; preview: Preview & { url: string } } | { ok: false; reason: string };

const cache = new Map<string, { at: number; value: Result }>();
const CACHE_MS = 60 * 60 * 1000;
const hits = new Map<string, { n: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n += 1;
  return h.n > 20;
}

async function assertPublic(u: URL): Promise<void> {
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("protocol");
  if (u.port && u.port !== "80" && u.port !== "443") throw new Error("port");
  if (u.username || u.password) throw new Error("credentials");
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (isIP(host) || host === "localhost" || !host.includes(".") || /\.(local|internal|localhost|lan|home|corp)$/.test(host)) throw new Error("host");
  const addrs = await lookup(host, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address))) throw new Error("private");
}

async function readCapped(res: Response): Promise<Uint8Array> {
  const reader = res.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const out = new Uint8Array(Math.min(size, MAX_BYTES));
  let off = 0;
  for (const c of chunks) {
    const take = Math.min(c.byteLength, out.length - off);
    out.set(c.subarray(0, take), off);
    off += take;
    if (off >= out.length) break;
  }
  return out;
}

async function fetchPreview(start: string): Promise<Result> {
  let url = new URL(start);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublic(url);
      const res = await fetch(url, {
        redirect: "manual",
        signal: ctl.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "ja,en;q=0.8" },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        res.body?.cancel().catch(() => {});
        if (!loc) return { ok: false, reason: "redirect" };
        url = new URL(loc, url);
        continue;
      }
      if (!res.ok) return { ok: false, reason: `status_${res.status}` };
      const type = res.headers.get("content-type") || "";
      if (!/text\/html|application\/xhtml/i.test(type)) return { ok: false, reason: "not_html" };
      const bytes = await readCapped(res);
      const head = new TextDecoder("latin1").decode(bytes.subarray(0, 4096));
      let html: string;
      try {
        html = new TextDecoder(detectCharset(type, head)).decode(bytes);
      } catch {
        html = new TextDecoder("utf-8").decode(bytes);
      }
      const p = parseProductHtml(html, url.toString());
      return p ? { ok: true, preview: { ...p, url: url.toString() } } : { ok: false, reason: "unreadable" };
    }
    return { ok: false, reason: "too_many_redirects" };
  } catch (e) {
    const name = (e as Error)?.name;
    return { ok: false, reason: name === "AbortError" ? "timeout" : "blocked" };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return Response.json({ ok: false, reason: "invalid_url" }, { status: 400 });
  }
  if (raw.length > 2000) return Response.json({ ok: false, reason: "invalid_url" }, { status: 400 });

  const key = target.toString();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return Response.json(cached.value, { headers: { "Cache-Control": cached.value.ok ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=600" } });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const value = await fetchPreview(key);
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  return Response.json(value, { headers: { "Cache-Control": value.ok ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=600" } });
}
