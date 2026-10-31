// Ce que Samuel doit à Mayuko : l'argent des achats des clients qu'elle avance.
//
// Règle (affichée telle quelle dans l'admin) :
//   dû = achats des clients depuis la reprise (prix des ARTICLES, jamais les frais de service)
//        + avances supplémentaires (livraison, taxes… payées par Mayuko)
//        − remboursements déjà faits.
// Un achat est compté quand la commande est au moins « Acheté » (les commandes « Demande reçue », « Achat en cours »,
// « Attente de l'événement », « Action requise » et « Annulé » ne sont pas encore des achats faits par Mayuko).
// Les lignes « commission package » ne sont pas des achats. La semaine va du lundi au dimanche.
//
// Fichier sans dépendance, testable seul.

export const FALLBACK_START = "2026-11-01";

export type PurchaseOrder = {
  id: number;
  client_name: string | null;
  status: string | null;
  purchase_date: string | null;
  item_price_jpy: number | null;
};

export type LedgerEntry = {
  id: number;
  entry_date: string;
  kind: "repayment" | "advance";
  amount_jpy: number;
  note: string | null;
};

/** Statuts qui veulent dire « l'article est acheté » (donc l'argent a été avancé). */
const BOUGHT = new Set([
  "Purchased",
  "Seller Shipped",
  "Received in Japan",
  "Photos Uploaded",
  "Packing",
  "Awaiting Shipping Payment",
  "Shipped",
  "Delivered",
  "Purchased — Awaiting Delivery",
  "Purchased — Awaiting Event",
]);

/** Statuts « pas encore acheté » : montrés à part, jamais comptés dans le dû. */
const NOT_YET = new Set(["Purchasing", "Awaiting Event", "Action Required"]);

const COMMISSION_PACKAGE = /^\s*comm?iss?ion\s+pack(?:age|ing)\b/i;

export const isBought = (status: string | null | undefined): boolean => !!status && BOUGHT.has(status);
export const isNotYetBought = (status: string | null | undefined): boolean => !!status && NOT_YET.has(status);

const yen = (n: number | null | undefined): number => Math.max(0, Math.round(n ?? 0));
const isDay = (s: string | null | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Lundi de la semaine qui contient ce jour (AAAA-MM-JJ). */
export function weekStart(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return addDays(day, -sinceMonday);
}

function counts(o: PurchaseOrder, since: string): boolean {
  return isDay(o.purchase_date) && o.purchase_date >= since && yen(o.item_price_jpy) > 0 && !COMMISSION_PACKAGE.test(o.client_name ?? "");
}

/** Achats à rembourser : articles des commandes déjà achetées, à partir de `since`. */
export function repayableOrders(orders: PurchaseOrder[], since: string): PurchaseOrder[] {
  return orders.filter((o) => counts(o, since) && isBought(o.status));
}

/** Commandes encore en cours d'achat depuis `since` : informatif, pas compté dans le dû. */
export function notYetBoughtTotal(orders: PurchaseOrder[], since: string): { total: number; count: number } {
  const rows = orders.filter((o) => counts(o, since) && isNotYetBought(o.status));
  return { total: rows.reduce((s, o) => s + yen(o.item_price_jpy), 0), count: rows.length };
}

export type Week = { start: string; end: string; total: number; orders: PurchaseOrder[] };

/** Achats regroupés par semaine (lundi → dimanche), la plus récente d'abord. */
export function groupByWeek(orders: PurchaseOrder[]): Week[] {
  const map = new Map<string, PurchaseOrder[]>();
  for (const o of orders) {
    if (!isDay(o.purchase_date)) continue;
    const k = weekStart(o.purchase_date);
    map.set(k, [...(map.get(k) ?? []), o]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([start, list]) => ({
      start,
      end: addDays(start, 6),
      total: list.reduce((s, o) => s + yen(o.item_price_jpy), 0),
      orders: [...list].sort((a, b) => (b.purchase_date ?? "").localeCompare(a.purchase_date ?? "") || b.id - a.id),
    }));
}

export type Balance = { purchases: number; advances: number; repayments: number; due: number };

/** Ce qui est dû : achats + avances − remboursements (peut être négatif si on a trop remboursé). */
export function balance(purchases: number, ledger: LedgerEntry[]): Balance {
  const advances = ledger.filter((e) => e.kind === "advance").reduce((s, e) => s + yen(e.amount_jpy), 0);
  const repayments = ledger.filter((e) => e.kind === "repayment").reduce((s, e) => s + yen(e.amount_jpy), 0);
  return { purchases, advances, repayments, due: purchases + advances - repayments };
}
