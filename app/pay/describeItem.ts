// Affichage lisible d'une ligne d'article sur la page de paiement du client.
//
// Les noms saisis par l'admin sont souvent des adresses brutes collées depuis Mercari, Yahoo, etc.
// (« https://jp.mercari.com/item/m12345678901 »). On en tire un titre lisible (« Mercari · m12345678901 »)
// et on garde l'adresse (http/https seulement) pour proposer « Voir l'article ».
//
// Sans dépendance, testable seul.

const KNOWN_SITES: [RegExp, string][] = [
  [/mercari/, "Mercari"],
  [/yahoo\.co\.jp/, "Yahoo Auctions"],
  [/rakuma|fril\.jp/, "Rakuma"],
  [/amazon/, "Amazon"],
  [/rakuten/, "Rakuten"],
  [/zozo/, "ZOZOTOWN"],
  [/p-bandai/, "Premium Bandai"],
  [/bandai/, "Bandai"],
  [/uniqlo/, "Uniqlo"],
  [/pokemoncenter/, "Pokémon Center"],
  [/nintendo/, "Nintendo"],
  [/suruga-ya/, "Suruga-ya"],
  [/mandarake/, "Mandarake"],
  [/yodobashi/, "Yodobashi"],
  [/hmv\.co\.jp/, "HMV"],
  [/amnibus/, "Amnibus"],
  [/lululemon/, "lululemon"],
  [/coach/, "Coach"],
];

export type DescribedItem = { title: string; href: string | null };

function siteName(host: string): string {
  for (const [re, name] of KNOWN_SITES) if (re.test(host)) return name;
  // Inconnu : le nom de domaine sans « www. » ni extension, avec une majuscule.
  const parts = host.split(".");
  // « boutique.co.jp » : le nom est avant « co », pas « co » lui-même.
  const SECOND_LEVEL = ["co", "com", "ne", "or", "ac", "go", "org", "net"];
  let idx = parts.length >= 2 ? parts.length - 2 : 0;
  if (parts.length >= 3 && SECOND_LEVEL.includes(parts[idx])) idx -= 1;
  const base = parts[idx];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function describeItem(name: string | null | undefined): DescribedItem {
  const raw = (name ?? "").trim();
  if (!raw) return { title: "—", href: null };

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      const site = siteName(host);
      const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
      const id = decodeURIComponent(last).replace(/\.(html?|php|aspx?)$/i, "").trim();
      // On n'ajoute l'identifiant que s'il est court et lisible.
      const title = id && id.length <= 24 && /^[\w.-]+$/.test(id) ? `${site} · ${id}` : site;
      return { title, href: u.toString() };
    } catch {
      return { title: raw.length > 60 ? `${raw.slice(0, 57)}…` : raw, href: null };
    }
  }
  return { title: raw, href: null };
}

/**
 * Range le nom et le lien d'un article saisis dans le formulaire de création :
 *  - une adresse collée dans « nom » devient le lien, et le nom est tiré de l'adresse (« Mercari · m123 ») ;
 *  - un lien sans nom donne un nom lisible.
 * Le lien doit être en http(s) : tout autre schéma est ignoré.
 */
export function splitNameAndUrl(name: string, url: string | null): { name: string; url: string | null } {
  const n = (name ?? "").trim();
  if (!url && /^https?:\/\//i.test(n)) {
    try {
      const u = new URL(n);
      if (u.protocol === "https:" || u.protocol === "http:") return { name: describeItem(u.toString()).title, url: u.toString() };
    } catch {
      /* pas une adresse valide : on garde le texte tel quel */
    }
  }
  if (!n && url) return { name: describeItem(url).title, url };
  return { name: n, url };
}
