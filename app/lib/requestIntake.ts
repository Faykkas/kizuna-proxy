// Règles de réception d'une demande (formulaire du site) — fonctions pures, sans réseau, testées dans requestIntake.test.ts.
// Utilisé par app/api/requests/route.ts : tout ce qui arrive du navigateur est traité comme non fiable.

export type RequestRow = {
  customer_id: string | null;
  lead_type: "consumer" | "business";
  name: string;
  email: string;
  country: string | null;
  items: string;
  budget: string | null;
  notes: string | null;
  status: "new";
  quantity: string | null;
  purchase_type: string | null;
  deadline: string | null;
  partial_ok: boolean;
  business_name: string | null;
  business_website: string | null;
  business_type: string | null;
  product_category: string | null;
  recurring_sourcing: string | null;
  contact_platform: string | null;
  discovery_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type Cleaned = { ok: true; row: RequestRow } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Retire les caractères de contrôle (sauf retours à la ligne et tabulations) et borne la longueur.
function text(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
const opt = (v: unknown, max: number): string | null => text(v, max) || null;

export function cleanRequest(input: unknown): Cleaned {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Requête invalide." };
  const b = input as Record<string, unknown>;

  const email = text(b.email, 200).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "Adresse email invalide." };

  const items = text(b.items, 5000);
  if (!items) return { ok: false, error: "Décrivez ce que vous cherchez." };

  const lead = b.lead_type === "business" ? "business" : "consumer";
  const name = text(b.name, 120) || email.split("@")[0];

  let deadline: string | null = null;
  if (typeof b.deadline === "string" && b.deadline.trim()) {
    const d = b.deadline.trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) return { ok: false, error: "Date limite invalide." };
    deadline = d;
  }

  return {
    ok: true,
    row: {
      customer_id: null, // renseigné côté serveur uniquement, à partir d'une session vérifiée
      lead_type: lead,
      name,
      email,
      country: opt(b.country, 120),
      items,
      budget: opt(b.budget, 120),
      notes: opt(b.notes, 1000),
      status: "new",
      quantity: opt(b.quantity, 120),
      purchase_type: opt(b.purchase_type, 40),
      deadline,
      partial_ok: b.partial_ok === true,
      business_name: opt(b.business_name, 200),
      business_website: opt(b.business_website, 300),
      business_type: opt(b.business_type, 120),
      product_category: opt(b.product_category, 200),
      recurring_sourcing: opt(b.recurring_sourcing, 120),
      contact_platform: opt(b.contact_platform, 120),
      discovery_source: opt(b.discovery_source, 200),
      utm_source: opt(b.utm_source, 120),
      utm_medium: opt(b.utm_medium, 120),
      utm_campaign: opt(b.utm_campaign, 120),
      utm_content: opt(b.utm_content, 300),
      utm_term: opt(b.utm_term, 120),
    },
  };
}

/** D'où vient la demande : source déclarée, UTM, ou page du site (voir MiniRequestForm). */
export function originOf(r: Pick<RequestRow, "utm_source" | "utm_content" | "discovery_source">): string {
  const parts = [r.utm_source, r.discovery_source, r.utm_content?.startsWith("page:") ? r.utm_content.slice(5) : r.utm_content].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Message Discord (limites : 2000 caractères de contenu, 1024 par champ d'embed). */
export function discordPayload(r: RequestRow, adminUrl: string) {
  const business = r.lead_type === "business";
  const field = (name: string, value: string | null | undefined, inline = true) => (value ? { name, value: cut(value, 1000), inline } : null);
  const fields = [
    field("Email", r.email),
    field("Pays", r.country),
    field("Type", business ? "Business" : r.purchase_type === "visit" ? "Visite en boutique" : "Consommateur"),
    field("Budget", r.budget),
    field("Quantité", r.quantity),
    field("Date limite", r.deadline),
    business ? field("Entreprise", r.business_name) : null,
    field("Origine", originOf(r) === "—" ? null : originOf(r)),
    field("Demande", r.items, false),
  ].filter(Boolean);
  return {
    username: "Kizuna — demandes",
    allowed_mentions: { parse: [] as string[] },
    content: cut(`🔔 **Nouvelle demande** de ${r.name} (${r.country || "pays ?"})`, 300),
    embeds: [{ title: business ? "Demande business" : "Nouvelle demande", url: adminUrl, color: business ? 0x7c5cff : 0xc8243a, fields }],
  };
}
