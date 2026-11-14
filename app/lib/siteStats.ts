// Chiffres publics du bandeau de preuve (accueil), calculés à partir des vraies commandes. Fonctions pures, testées.
//   delivered : commandes au statut « Delivered », hors lignes internes « commission package »
//   countries : pays de livraison distincts, hors Japon, orthographes regroupées (« usa », « america », « united states »…)

export type StatOrder = { status: string | null; delivery_country: string | null; client_name: string | null };

const COMMISSION_PACKAGE = /^\s*comm?iss?ion\s+pack(?:age|ing)\b/i;

// Variantes rencontrées dans la base → code pays.
const ALIASES: Record<string, string> = {
  usa: "US", us: "US", america: "US", "united states": "US", "united states of america": "US", "etats-unis": "US", "états-unis": "US",
  uk: "GB", "united kingdom": "GB", england: "GB", scotland: "GB", wales: "GB", "great britain": "GB",
  brasil: "BR", bresil: "BR", "brésil": "BR", brazil: "BR",
  singapore: "SG", singapour: "SG",
  italy: "IT", italia: "IT", italie: "IT",
  portugal: "PT", portugese: "PT", portuguese: "PT",
  germany: "DE", deutschland: "DE", allemagne: "DE",
  france: "FR", spain: "ES", "españa": "ES", espagne: "ES",
  korea: "KR", "south korea": "KR", "corée": "KR",
  "hong kong": "HK", taiwan: "TW", japan: "JP", japon: "JP", "日本": "JP",
  "united arab emirates": "AE", uae: "AE", netherlands: "NL", holland: "NL",
};

/** Code pays normalisé, ou le nom nettoyé si inconnu (compté tel quel). Vide → null. */
export function normalizeCountry(raw: string | null | undefined): string | null {
  const c = String(raw || "").trim().toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, " ").replace(/[.]/g, "");
  if (!c) return null;
  return ALIASES[c] || c;
}

export function computeStats(orders: StatOrder[]): { delivered: number; countries: number } {
  let delivered = 0;
  const countries = new Set<string>();
  for (const o of orders) {
    if (COMMISSION_PACKAGE.test(o.client_name || "")) continue;
    if (o.status === "Delivered") delivered += 1;
    const c = normalizeCountry(o.delivery_country);
    if (c && c !== "JP") countries.add(c);
  }
  return { delivered, countries: countries.size };
}
