// Lightweight guide metadata (no component imports), used by the blog layout extras.
// Keep GUIDE_KEYS in sync with GUIDE_ROUTES in guideRoutes.ts (guideMeta.test.ts checks it).

export const GUIDE_KEYS: Record<string, string> = {
  "best-pokemon-cards-japan-2026": "pokemonCards",
  "anime-figures-japan-guide": "animeFigures",
  "how-to-buy-from-mercari-japan": "mercari",
  "japan-shipping-guide-2026": "shippingGuide",
  "japanese-trading-cards-guide-2026": "tcg",
  "nike-japan-exclusives-guide": "nike",
  "pokemon-center-tokyo-exclusives": "pokemonCenter",
  "supreme-japan-drops-guide": "supreme",
  "yahoo-auctions-japan-guide": "yahoo",
  "comiket-japan-guide": "comiket",
  "comitia-japan-guide": "comitia",
  "ichiban-kuji-japan-guide": "ichibanKuji",
  "tokyo-anime-events-guide": "animeEvents",
  "kpop-photocards-japan-guide": "kpop",
  "japan-package-forwarding-guide": "forwarding",
  "tokyo-discreet-pickup-service": "discreetPickup",
  "buy-coach-bags-japan": "coachOfficial",
  "buy-porter-yoshida-bags-japan": "porterYoshida",
  "buy-onitsuka-tiger-japan": "onitsukaTiger",
  "buy-sanrio-japan": "sanrio",
  "resident-evil-30th-anniversary-exhibition-tokyo": "biohazard30",
  "agf-ikebukuro-animate-girls-festival-2026": "agf2026",
  "order-christmas-gifts-from-japan-2026": "christmas2026",
  "starbucks-japan-christmas-2026-collection": "starbucksXmas2026",
  "buy-starbucks-japan-tumblers-guide": "starbucksJapan",
  "fukubukuro-japan-lucky-bags-2027-guide": "fukubukuro2027",
};

const GROUPS: string[][] = [
  ["order-christmas-gifts-from-japan-2026", "starbucks-japan-christmas-2026-collection", "buy-starbucks-japan-tumblers-guide", "fukubukuro-japan-lucky-bags-2027-guide"],
  ["supreme-japan-drops-guide", "nike-japan-exclusives-guide", "buy-coach-bags-japan", "buy-porter-yoshida-bags-japan", "buy-onitsuka-tiger-japan", "buy-sanrio-japan"],
  ["best-pokemon-cards-japan-2026", "pokemon-center-tokyo-exclusives", "japanese-trading-cards-guide-2026", "anime-figures-japan-guide", "ichiban-kuji-japan-guide", "kpop-photocards-japan-guide"],
  ["comiket-japan-guide", "comitia-japan-guide", "tokyo-anime-events-guide", "agf-ikebukuro-animate-girls-festival-2026", "resident-evil-30th-anniversary-exhibition-tokyo"],
  ["how-to-buy-from-mercari-japan", "yahoo-auctions-japan-guide", "japan-shipping-guide-2026", "japan-package-forwarding-guide", "tokyo-discreet-pickup-service"],
];

const FALLBACK = ["japan-shipping-guide-2026", "how-to-buy-from-mercari-japan", "japan-package-forwarding-guide"];

/** Up to three related guides: the next ones in the same group, then general guides. */
export function relatedGuides(slug: string): string[] {
  const out: string[] = [];
  const group = GROUPS.find((g) => g.includes(slug));
  if (group) {
    const i = group.indexOf(slug);
    for (let k = 1; k < group.length && out.length < 3; k++) out.push(group[(i + k) % group.length]);
  }
  for (const s of FALLBACK) if (out.length < 3 && s !== slug && !out.includes(s)) out.push(s);
  return out;
}

/** "/blog/<slug>" or "/blog/<locale>/<slug>" -> { slug, locale } (locale null for the English URL). */
export function parseGuidePath(pathname: string): { slug: string; locale: string | null } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "blog") return null;
  if (parts.length === 2 && GUIDE_KEYS[parts[1]]) return { slug: parts[1], locale: null };
  if (parts.length === 3 && GUIDE_KEYS[parts[2]]) return { slug: parts[2], locale: parts[1] };
  return null;
}

export const guideUrl = (slug: string, locale: string | null) =>
  !locale || locale === "en" ? `/blog/${slug}` : `/blog/${locale}/${slug}`;
