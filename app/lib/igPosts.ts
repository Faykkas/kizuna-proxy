// Posts Instagram : types, validation des champs et légende par défaut. Fonctions pures, testées (igPosts.test.ts).
// Règle : jamais de photo de produit (droits d'auteur) — un visuel Kizuna est généré et le lien officiel est toujours donné.

export type IgStatus = "draft" | "approved" | "published" | "archived";
export type IgKind = "event" | "popup" | "release" | "collab" | "lottery" | "other";

export type IgPost = {
  id: string;
  status: IgStatus;
  kind: IgKind;
  title: string;
  subtitle: string | null;
  dates: string | null;
  place: string | null;
  highlights: string[];
  official_url: string;
  source_name: string | null;
  caption: string | null;
  created_by: "admin" | "auto";
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export const IG_KINDS: IgKind[] = ["event", "popup", "release", "collab", "lottery", "other"];

/** Étiquette affichée sur le visuel (en anglais : le compte Instagram parle aux clients du monde entier). */
export const IG_KIND_BADGE: Record<IgKind, string> = {
  event: "Tokyo event",
  popup: "Pop-up store",
  release: "New release",
  collab: "Limited collab",
  lottery: "Lottery & kuji",
  other: "From Japan",
};

export type IgInput = {
  kind: string;
  title: string;
  subtitle?: string;
  dates?: string;
  place?: string;
  highlights?: string; // un point par ligne
  officialUrl: string;
  sourceName?: string;
  caption?: string;
};

export type IgFields = Omit<IgPost, "id" | "status" | "created_by" | "created_at" | "updated_at" | "published_at">;

const clean = (s: string | undefined | null) => String(s ?? "").replace(/\s+/g, " ").trim();

/** Lien officiel : https uniquement, nettoyé des paramètres de suivi (utm, fbclid…). */
export function normalizeOfficialUrl(raw: string): string | null {
  const s = String(raw ?? "").trim();
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !u.hostname.includes(".")) return null;
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|igshid|_gl|srsltid)/i.test(k)) u.searchParams.delete(k);
  u.hash = "";
  const out = u.toString();
  return out.length <= 500 ? out : null;
}

/** Vérifie et met en forme les champs saisis. Message d'erreur en français (admin). */
export function parseIgInput(input: IgInput): { ok: true; value: IgFields } | { ok: false; error: string } {
  const kind = (IG_KINDS as string[]).includes(input.kind) ? (input.kind as IgKind) : null;
  if (!kind) return { ok: false, error: "Type de post inconnu." };
  const title = clean(input.title);
  if (title.length < 3) return { ok: false, error: "Le titre est trop court (3 caractères minimum)." };
  if (title.length > 90) return { ok: false, error: "Le titre est trop long (90 caractères maximum)." };
  const subtitle = clean(input.subtitle);
  if (subtitle.length > 120) return { ok: false, error: "Le sous-titre est trop long (120 caractères maximum)." };
  const dates = clean(input.dates);
  if (dates.length > 80) return { ok: false, error: "Les dates sont trop longues (80 caractères maximum)." };
  const place = clean(input.place);
  if (place.length > 100) return { ok: false, error: "Le lieu est trop long (100 caractères maximum)." };
  const highlights = String(input.highlights ?? "")
    .split(/\r?\n/)
    .map((l) => clean(l.replace(/^[-•*·]\s*/, "")))
    .filter(Boolean);
  if (highlights.length > 5) return { ok: false, error: "5 points maximum dans « ce qu'on peut acheter »." };
  if (highlights.some((h) => h.length > 70)) return { ok: false, error: "Chaque point doit faire 70 caractères maximum." };
  const url = normalizeOfficialUrl(input.officialUrl);
  if (!url) return { ok: false, error: "Le lien officiel doit être une adresse https:// valide." };
  const sourceName = clean(input.sourceName);
  if (sourceName.length > 80) return { ok: false, error: "Le nom de la source est trop long (80 caractères maximum)." };
  const caption = String(input.caption ?? "").trim();
  if (caption.length > 2200) return { ok: false, error: "La légende est trop longue (2 200 caractères maximum, limite d'Instagram)." };
  return {
    ok: true,
    value: {
      kind,
      title,
      subtitle: subtitle || null,
      dates: dates || null,
      place: place || null,
      highlights,
      official_url: url,
      source_name: sourceName || null,
      caption: caption || null,
    },
  };
}

const BASE_TAGS = ["#japan", "#tokyo", "#japanproxy", "#kizunaproxy", "#madeinjapan"];
const KIND_TAGS: Record<IgKind, string[]> = {
  event: ["#tokyoevents", "#japanevent"],
  popup: ["#popupstore", "#tokyopopup"],
  release: ["#newrelease", "#japanexclusive"],
  collab: ["#limitededition", "#japanexclusive"],
  lottery: ["#ichibankuji", "#japanlottery"],
  other: ["#japanshopping"],
};

/** Nom lisible du site officiel (« pokemoncenter-online.com ») si aucune source n'est indiquée. */
export function sourceLabel(post: Pick<IgPost, "source_name" | "official_url">): string {
  if (post.source_name) return post.source_name;
  try {
    return new URL(post.official_url).hostname.replace(/^www\./, "");
  } catch {
    return "official website";
  }
}

/** Légende Instagram par défaut (anglais), utilisée quand aucune légende n'a été écrite. */
export function defaultCaption(post: Pick<IgPost, "kind" | "title" | "subtitle" | "dates" | "place" | "highlights" | "official_url" | "source_name">): string {
  const lines: string[] = [];
  lines.push(post.subtitle ? `${post.title} — ${post.subtitle}` : post.title);
  lines.push("");
  if (post.dates) lines.push(`📅 ${post.dates}`);
  if (post.place) lines.push(`📍 ${post.place}`);
  if (post.highlights.length) {
    lines.push("");
    lines.push("What we can buy for you:");
    for (const h of post.highlights) lines.push(`• ${h}`);
  }
  lines.push("");
  lines.push(`Official info: ${sourceLabel(post)} (link in bio → kizunaproxy.com/ig)`);
  lines.push("Can't be in Tokyo? We buy it for you and ship worldwide. Free quote in 24h.");
  lines.push("");
  lines.push([...BASE_TAGS, ...KIND_TAGS[post.kind]].join(" "));
  return lines.join("\n");
}

/** Légende à copier : celle écrite à la main, sinon la légende par défaut. */
export function captionFor(post: IgPost): string {
  return post.caption && post.caption.trim() ? post.caption : defaultCaption(post);
}
