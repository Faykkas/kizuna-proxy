// Lecture d'une page produit (côté serveur) : titre, image, prix en yens, nom de la boutique.
// Fonctions pures, sans réseau : testées dans linkPreview.test.ts. La route /api/preview s'occupe du téléchargement.
//
// Règles :
//   - on lit seulement les métadonnées publiques que la boutique destine aux aperçus (Open Graph, JSON-LD, itemprop) ;
//   - un prix n'est donné que s'il est clairement en yens (devise JPY, ou boutique japonaise sans devise indiquée) ;
//   - un site qui bloque les robots n'est jamais contourné : l'aperçu échoue simplement.

export type Preview = { title: string; image: string | null; priceJpy: number | null; store: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+|#39);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
function safeChar(code: number): string {
  return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : "";
}

/** Toutes les balises <meta> en { clé → contenu } (clé = property, name ou itemprop, en minuscules ; la première gagne). */
export function readMeta(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const attr = (n: string) => tag.match(new RegExp(`\\b${n}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    const key = attr("property") || attr("name") || attr("itemprop");
    const content = attr("content");
    if (!key || !content) continue;
    const k = (key[1] ?? key[2] ?? "").toLowerCase().trim();
    const v = content[1] ?? content[2] ?? "";
    if (k && !(k in out)) out[k] = v;
  }
  return out;
}

type LdOffer = { price: unknown; currency?: string; name?: string; image?: string };

/** Premier produit trouvé dans les blocs JSON-LD (offers.price / lowPrice). */
export function readJsonLd(html: string): LdOffer | null {
  for (const m of html.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: unknown;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const stack: unknown[] = Array.isArray(data) ? [...data] : [data];
    while (stack.length) {
      const n = stack.shift() as Record<string, any> | null;
      if (!n || typeof n !== "object") continue;
      if (Array.isArray(n["@graph"])) stack.push(...n["@graph"]);
      const offers = n.offers ? (Array.isArray(n.offers) ? n.offers : [n.offers]) : [];
      for (const o of offers) {
        const p = o?.price ?? o?.lowPrice;
        if (p != null) {
          const img = Array.isArray(n.image) ? n.image[0] : n.image;
          return { price: p, currency: o.priceCurrency, name: typeof n.name === "string" ? n.name : undefined, image: typeof img === "string" ? img : img?.url };
        }
      }
    }
  }
  return null;
}

/** « 12,000 », « ¥12000 », « 12000.0 » → 12000. Hors bornes ou illisible → null. */
export function parseYen(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) && v >= 1 && v <= 50_000_000 ? Math.round(v) : null;
  if (typeof v !== "string") return null;
  const s = v.replace(/[¥￥円,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return parseYen(Number(s));
}

const STORES: [RegExp, string][] = [
  [/(^|\.)mercari\.com$/, "Mercari"],
  [/^paypayfleamarket\.yahoo\.co\.jp$/, "Yahoo! Flea Market"],
  [/auctions\.yahoo\.co\.jp$/, "Yahoo! Auctions"],
  [/shopping\.yahoo\.co\.jp$/, "Yahoo! Shopping"],
  [/(^|\.)rakuten\.co\.jp$/, "Rakuten"],
  [/(^|\.)fril\.jp$/, "Rakuma"],
  [/(^|\.)amazon\.co\.jp$|^amzn\.asia$/, "Amazon Japan"],
  [/(^|\.)pokemoncenter-online\.com$/, "Pokémon Center"],
  [/(^|\.)suruga-ya\.jp$/, "Suruga-ya"],
  [/mandarake\.co\.jp$/, "Mandarake"],
  [/(^|\.)zozo\.jp$/, "ZOZOTOWN"],
  [/(^|\.)p-bandai\.jp$/, "Premium Bandai"],
  [/(^|\.)snkrdunk\.com$/, "SNKRDUNK"],
  [/(^|\.)animate-onlineshop\.jp$/, "animate"],
  [/(^|\.)uniqlo\.com$/, "Uniqlo"],
];

export function storeName(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, "");
  for (const [re, name] of STORES) if (re.test(h)) return name;
  return h;
}

/** Boutique japonaise : on peut supposer des yens quand la page ne précise pas la devise. */
export function isJapaneseStore(u: URL): boolean {
  const h = u.hostname.toLowerCase();
  return h.endsWith(".jp") || /(^|\.)mercari\.com$|(^|\.)pokemoncenter-online\.com$|(^|\.)snkrdunk\.com$/.test(h) || /\/jp(\/|-|$)/i.test(u.pathname);
}

// Suffixes de boutique retirés des titres (« … by メルカリ », « …｜Yahoo!フリマ（旧PayPayフリマ） »).
const TITLE_SUFFIXES = [/\s*by\s+メルカリ\s*$/, /\s*[|｜]\s*Yahoo!フリマ.*$/, /\s*[|｜]\s*【公式】ポケモンセンターオンライン\s*$/, /\s+-\s+Shop\s*$/, /\s*[|｜]\s*Amazon\.co\.jp.*$/i, /^Amazon\.co\.jp:\s*/i, /\s*の新品\/中古フリマ\(通販\)\s*[|｜]\s*スニダン\s*$/, /\s*[|｜]\s*スニダン\s*$/];

export function cleanTitle(raw: string): string {
  let t = decodeEntities(raw).replace(/\s+/g, " ").trim();
  for (const re of TITLE_SUFFIXES) t = t.replace(re, "").trim();
  return t.slice(0, 160);
}

function absolute(src: string | undefined | null, base: URL): string | null {
  if (!src) return null;
  try {
    const u = new URL(decodeEntities(src.trim()), base);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString().replace(/^http:/, "https:") : null;
  } catch {
    return null;
  }
}

/** Analyse une page produit déjà téléchargée. null si on n'en tire même pas un titre. */
export function parseProductHtml(html: string, pageUrl: string): Preview | null {
  const base = new URL(pageUrl);
  const meta = readMeta(html);
  const ld = readJsonLd(html);
  const rawTitle = meta["og:title"] || meta["twitter:title"] || ld?.name || html.match(/<title[^>]*>([^<]*)/i)?.[1] || "";
  const title = cleanTitle(rawTitle);
  if (!title || /^(just a moment|attention required|access denied|security check)/i.test(title)) return null;

  const image = absolute(meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || ld?.image, base);

  const metaPrice = meta["product:price:amount"] ?? meta["og:price:amount"] ?? meta["price"];
  const metaCur = (meta["product:price:currency"] || meta["og:price:currency"] || meta["pricecurrency"] || "").toUpperCase();
  let priceJpy: number | null = null;
  if (metaPrice != null) {
    if (metaCur === "JPY" || (!metaCur && isJapaneseStore(base))) priceJpy = parseYen(metaPrice);
  }
  if (priceJpy == null && ld) {
    const cur = (ld.currency || "").toUpperCase();
    if (cur === "JPY" || (!cur && isJapaneseStore(base))) priceJpy = parseYen(ld.price);
  }
  return { title, image, priceJpy, store: storeName(base.hostname) };
}

/** Jeu de caractères de la page : en-tête HTTP, sinon <meta charset>, sinon UTF-8. */
export function detectCharset(contentType: string | null, head: string): string {
  const fromHeader = contentType?.match(/charset=["']?([\w-]+)/i)?.[1];
  const fromMeta = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  const c = (fromHeader || fromMeta || "utf-8").toLowerCase();
  if (c === "sjis" || c === "x-sjis" || c === "shift-jis" || c === "windows-31j" || c === "cp932") return "shift_jis";
  return c;
}

/** Adresse IP privée, locale, réservée : jamais téléchargée (protection contre les requêtes vers le réseau interne). */
export function isPrivateAddress(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v.includes(":")) {
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")) return true; // lien local
    if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique local
    const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateAddress(mapped[1]) : false;
  }
  const p = v.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

/** Premier lien http(s) d'un texte collé (« regarde ça https://… »), nettoyé. */
export function extractUrl(text: string): string | null {
  const m = String(text || "").match(/https?:\/\/[^\s<>"'「」【】（）]+/i);
  if (!m) return null;
  const u = m[0].replace(/[),.、。!?]+$/, "");
  try {
    const parsed = new URL(u);
    return parsed.hostname.includes(".") ? parsed.toString() : null;
  } catch {
    return null;
  }
}
