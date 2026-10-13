// Libellés français des statuts de commande. Les clés viennent de
// app/lib/orderStatus.ts (source de vérité du site) : on ne change rien aux
// valeurs stockées en base, seulement l'affichage.

export type Tone = "ok" | "alert" | "muted" | "info" | "warn";

const LABELS: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: "Demande reçue", tone: "warn" },
  Purchasing: { label: "Achat en cours", tone: "info" },
  "Awaiting Event": { label: "Attente de l'événement", tone: "info" },
  Purchased: { label: "Acheté", tone: "info" },
  "Seller Shipped": { label: "Expédié par le vendeur", tone: "info" },
  "Received in Japan": { label: "Reçu au Japon", tone: "info" },
  "Photos Uploaded": { label: "Photos envoyées", tone: "info" },
  Packing: { label: "Emballage", tone: "info" },
  "Awaiting Shipping Payment": { label: "Livraison à payer", tone: "alert" },
  Shipped: { label: "Expédié", tone: "ok" },
  Delivered: { label: "Livré", tone: "ok" },
  "Action Required": { label: "Action requise", tone: "alert" },
  Cancelled: { label: "Annulé", tone: "muted" },
  // Anciens statuts conservés par l'ancienne admin
  "Purchased — Awaiting Delivery": { label: "Acheté — attente livraison", tone: "info" },
  "Purchased — Awaiting Event": { label: "Acheté — attente événement", tone: "info" },
};

export function statusInfo(status: string | null | undefined): { label: string; tone: Tone } {
  if (!status) return { label: "—", tone: "muted" };
  return LABELS[status] ?? { label: status, tone: "muted" };
}

/** Statuts proposés dans le filtre de la page Commandes. */
export const FILTER_STATUSES = [
  "Pending",
  "Purchasing",
  "Awaiting Event",
  "Purchased",
  "Seller Shipped",
  "Received in Japan",
  "Photos Uploaded",
  "Packing",
  "Awaiting Shipping Payment",
  "Shipped",
  "Delivered",
  "Action Required",
  "Cancelled",
];

/** Commande « active » = ni livrée ni annulée. */
export function isActiveStatus(status: string | null): boolean {
  return status !== "Delivered" && status !== "Cancelled";
}

export function formatDateFr(value: string | null | undefined): string {
  if (!value) return "—";
  // Une date seule (AAAA-MM-JJ) est lue en UTC puis affichée en UTC : sinon, sur un ordinateur à
  // l'heure de Tokyo, minuit local tombe la veille en UTC et la date s'affiche un jour trop tôt.
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: value.length === 10 ? "UTC" : "Asia/Tokyo" });
}

export function formatDateTimeFr(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }) + " (JST)";
}

export function monthLabelFr(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function monthShortFr(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }).replace(".", "");
}
