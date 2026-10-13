// Validation des contenus du site (boutique, galerie, actualités, bandeau) — côté serveur.
// Sans dépendance, testable seul. Les valeurs viennent du navigateur : rien n'est pris tel quel.

export const NEWS_CATEGORIES = ["shipping", "service", "event", "general"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

const MAX_YEN = 100_000_000;

/** Entier de yens ≥ 0 (la valeur vide vaut 0). */
export function parseYen(raw: unknown, label: string): Ok<number> | Err {
  const s = String(raw ?? "").trim();
  if (s === "") return { ok: true, value: 0 };
  if (!/^\d+$/.test(s)) return { ok: false, error: `${label} : entier de yens uniquement.` };
  const n = Number(s);
  if (n > MAX_YEN) return { ok: false, error: `${label} : montant trop grand.` };
  return { ok: true, value: n };
}

/** Texte nettoyé, longueur bornée. `required` refuse le vide. */
export function parseText(raw: unknown, label: string, max: number, required = false): Ok<string> | Err {
  const s = String(raw ?? "").trim();
  if (required && s === "") return { ok: false, error: `${label} est obligatoire.` };
  if (s.length > max) return { ok: false, error: `${label} : ${max} caractères maximum.` };
  return { ok: true, value: s };
}

/**
 * Adresse d'image : https uniquement (le stockage Supabase est en https). Refuse javascript:, data:,
 * http: et tout ce qui n'est pas une URL — ces valeurs sont ensuite affichées dans <img src>.
 */
export function parseImageUrl(raw: unknown, label = "Image"): Ok<string> | Err {
  const s = String(raw ?? "").trim();
  if (s === "") return { ok: false, error: `${label} est obligatoire.` };
  if (s.length > 2000) return { ok: false, error: `${label} : adresse trop longue.` };
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, error: `${label} : adresse invalide.` };
  }
  if (u.protocol !== "https:") return { ok: false, error: `${label} : l'adresse doit commencer par https://.` };
  return { ok: true, value: u.toString() };
}

/** Adresse d'un article chez un vendeur : http(s) seulement, facultative (vide = pas de lien). */
export function parseHttpUrl(raw: unknown, label = "Le lien"): Ok<string | null> | Err {
  const s = String(raw ?? "").trim();
  if (s === "") return { ok: true, value: null };
  if (s.length > 2000) return { ok: false, error: `${label} : adresse trop longue.` };
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, error: `${label} : adresse invalide (elle doit commencer par https://).` };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: `${label} : l'adresse doit commencer par https://.` };
  return { ok: true, value: u.toString() };
}

export function parseCategory(raw: unknown): Ok<NewsCategory> | Err {
  const s = String(raw ?? "");
  return (NEWS_CATEGORIES as readonly string[]).includes(s) ? { ok: true, value: s as NewsCategory } : { ok: false, error: "Catégorie inconnue." };
}

export function parseDateOrEmpty(raw: unknown, label: string): Ok<string | null> | Err {
  const s = String(raw ?? "").trim();
  if (s === "") return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) return { ok: false, error: `${label} : date invalide.` };
  return { ok: true, value: s };
}

export function parseId(raw: unknown): Ok<string> | Err {
  const s = String(raw ?? "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) ? { ok: true, value: s } : { ok: false, error: "Élément invalide." };
}

/** Chemin de fichier dans le bucket, retrouvé depuis son adresse publique (pour supprimer aussi le fichier). */
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  return path && !path.includes("..") ? path : null;
}
