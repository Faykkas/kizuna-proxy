// Journal des encaissements et synthèse mensuelle — calculés à partir des liens de paiement payés.
//
// Chaque lien payé = un encaissement PayPal. Pour chacun on garde ce qui est ENREGISTRÉ, sans le
// réinterpréter : total payé, articles (avance du client), commission, livraison (seulement si le lien
// est en mode « livraison »), frais PayPal facturés et frais réels. Les paiements saisis avant
// septembre 2026 ou payés directement sur PayPal n'existent pas ici (pas de lien).
//
// Les mois suivent l'heure de TOKYO (un paiement du 30 septembre à 20 h UTC est du 1er octobre).
// Entiers uniquement (yens), jamais de flottants. Sans dépendance, testable seul.

export type ReceiptLink = {
  id: string;
  label: string | null;
  client_name: string | null;
  paid_at: string | null;
  amount_jpy: number | null;
  item_amount_jpy: number | null;
  fee_amount_jpy: number | null;
  paypal_fee_jpy: number | null;
  paypal_real_fee_jpy: number | null;
  is_shipping: boolean | null;
  paypal_order_id?: string | null;
};

import { looksLikeShipping } from "./shipping.ts";

export type ReceiptKind = "Articles" | "Frais Kizuna" | "Articles + frais" | "Livraison" | "Livraison (d'après le libellé)" | "Ancien lien (total seul)";

export type Receipt = {
  id: string;
  paidAt: string; // ISO d'origine
  dateJst: string; // AAAA-MM-JJ
  timeJst: string; // HH:MM
  month: string; // AAAA-MM (Tokyo)
  client: string;
  label: string;
  kind: ReceiptKind;
  gross: number; // total payé par le client
  items: number; // avance articles
  commission: number; // frais de service Kizuna
  shipping: number; // livraison (mode « livraison » uniquement)
  paypalCharged: number; // frais PayPal facturés au client
  paypalReal: number | null; // frais réellement prélevés (null = inconnu)
  paypalMargin: number | null; // facturé − réel (null si réel inconnu)
  net: number | null; // total payé − frais réels (null si inconnu)
  reference: string; // identifiant PayPal
  warning: string | null; // incohérence à vérifier
  note: string | null; // simple information (ex. ancien lien sans détail)
};

const yen = (v: unknown): number => {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
};

/** Date et heure à Tokyo, depuis un horodatage ISO. */
export function toJst(iso: string): { date: string; time: string } {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const s = d.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

export function buildReceipts(links: ReceiptLink[]): Receipt[] {
  const out: Receipt[] = [];
  for (const l of links) {
    if (!l.paid_at || Number.isNaN(Date.parse(l.paid_at))) continue;
    const { date, time } = toJst(l.paid_at);
    const isShip = !!l.is_shipping;
    const item = isShip ? 0 : yen(l.item_amount_jpy);
    const fee = yen(l.fee_amount_jpy);
    const charged = yen(l.paypal_fee_jpy);
    const gross = l.amount_jpy != null ? yen(l.amount_jpy) : item + fee + charged;
    const real = l.paypal_real_fee_jpy == null ? null : yen(l.paypal_real_fee_jpy);
    // Anciens liens (août 2026) : un total seul, sans articles, commission ni frais PayPal séparés.
    const legacy = !isShip && item === 0 && fee === 0 && charged === 0 && gross > 0;
    // Livraison saisie comme des articles au début : le libellé (« Shipping to… », « Delivery ») le trahit.
    // On la sépare dans la compta, sans modifier le lien. Si des frais Kizuna sont mélangés, on ne tranche pas.
    const guessedShip = !isShip && !legacy && looksLikeShipping(l.label) && fee === 0 && item > 0;
    const mixedShip = !isShip && !legacy && looksLikeShipping(l.label) && fee > 0 && item > 0;
    const kind: ReceiptKind = legacy ? "Ancien lien (total seul)" : isShip ? "Livraison" : guessedShip ? "Livraison (d'après le libellé)" : item > 0 && fee > 0 ? "Articles + frais" : item > 0 ? "Articles" : "Frais Kizuna";
    const expected = (isShip ? 0 : yen(l.item_amount_jpy)) + fee + charged;
    out.push({
      id: l.id,
      paidAt: l.paid_at,
      dateJst: date,
      timeJst: time,
      month: date.slice(0, 7),
      client: l.client_name ?? "",
      label: l.label ?? "",
      kind,
      gross,
      items: guessedShip ? 0 : item,
      commission: isShip ? 0 : fee,
      shipping: isShip ? fee : guessedShip ? item : 0,
      paypalCharged: charged,
      paypalReal: real,
      // Marge seulement si des frais PayPal ont été facturés au client (sinon ils étaient inclus dans le prix).
      paypalMargin: real == null || charged === 0 ? null : charged - real,
      net: real == null ? null : gross - real,
      reference: l.paypal_order_id ?? "",
      warning: !legacy && gross !== expected ? `Total payé (${gross}) ≠ articles + frais + frais PayPal (${expected})` : null,
      note: legacy
        ? "Ancien lien : total seul, sans ventilation"
        : guessedShip
          ? "Livraison reconnue d'après le libellé (le lien a été saisi comme des articles)"
          : mixedShip
            ? "Libellé de livraison mélangé à des frais Kizuna : à vérifier, non séparé"
            : null,
    });
  }
  return out.sort((a, b) => a.paidAt.localeCompare(b.paidAt));
}

export type MonthSummary = {
  month: string;
  count: number;
  gross: number;
  items: number;
  commission: number;
  shipping: number;
  paypalCharged: number;
  paypalReal: number; // somme des frais réels CONNUS
  paypalMargin: number; // somme des marges connues
  net: number; // somme des nets connus
  unknownFees: number; // nombre d'encaissements sans frais réel connu
};

export function summarizeByMonth(receipts: Receipt[]): MonthSummary[] {
  const map = new Map<string, MonthSummary>();
  for (const r of receipts) {
    let m = map.get(r.month);
    if (!m) {
      m = { month: r.month, count: 0, gross: 0, items: 0, commission: 0, shipping: 0, paypalCharged: 0, paypalReal: 0, paypalMargin: 0, net: 0, unknownFees: 0 };
      map.set(r.month, m);
    }
    m.count += 1;
    m.gross += r.gross;
    m.items += r.items;
    m.commission += r.commission;
    m.shipping += r.shipping;
    m.paypalCharged += r.paypalCharged;
    if (r.paypalReal == null) m.unknownFees += 1;
    else {
      m.paypalReal += r.paypalReal;
      if (r.paypalCharged > 0) m.paypalMargin += r.paypalCharged - r.paypalReal;
      m.net += r.gross - r.paypalReal;
    }
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

// ── Dépenses récurrentes ─────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = ["Hébergement", "Domaine", "Logiciels", "Publicité", "Frais PayPal/Stripe", "Comptable", "Déplacements", "Emballage / Cartons", "Fournitures", "Autre"];

export type Expense = { id: number; label: string; category: string | null; amount_jpy: number | null; frequency: string | null; notes: string | null };

/** Total annuel : une dépense « mensuelle » compte 12 fois, une « annuelle » une fois. */
export function annualExpenseTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + (e.frequency === "monthly" ? yen(e.amount_jpy) * 12 : yen(e.amount_jpy)), 0);
}

/** Moyenne mensuelle (arrondie à l'entier). */
export function monthlyExpenseAverage(expenses: Expense[]): number {
  return Math.round(annualExpenseTotal(expenses) / 12);
}

// ── Commissions colis : semaines sans entrée ─────────────────────────────

/** Lundi (AAAA-MM-JJ) de la semaine d'une date. */
function mondayOf(date: string): string {
  const t = new Date(date + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
}

/**
 * Semaines (lundis) sans aucune commission colis enregistrée, ENTRE la première et la dernière entrée.
 * Information seulement : on ne sait pas s'il n'y a rien eu ou si la saisie manque. Rien n'est ajouté.
 */
export function missingPackageWeeks(dates: string[]): string[] {
  const valid = dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (valid.length < 2) return [];
  const have = new Set(valid.map(mondayOf));
  const missing: string[] = [];
  const end = Date.parse(mondayOf(valid[valid.length - 1]) + "T00:00:00Z");
  for (let t = Date.parse(mondayOf(valid[0]) + "T00:00:00Z"); t <= end; t += 7 * 24 * 3600 * 1000) {
    const d = new Date(t).toISOString().slice(0, 10);
    if (!have.has(d)) missing.push(d);
  }
  return missing;
}

// ── Export CSV ───────────────────────────────────────────────────────────

/** Protège contre l'injection de formules dans Excel (=, +, -, @ en début de cellule). */
export function csvCell(value: string | number | null | undefined): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s) && typeof value !== "number") s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CSV_HEADERS = [
  "Date (Tokyo)",
  "Heure",
  "Client",
  "Libellé",
  "Type",
  "Total payé (JPY)",
  "Articles / avance client (JPY)",
  "Commission Kizuna (JPY)",
  "Livraison (JPY)",
  "Frais PayPal facturés (JPY)",
  "Frais PayPal réels (JPY)",
  "Marge PayPal (JPY)",
  "Net reçu (JPY)",
  "Référence PayPal",
  "Identifiant du lien",
  "Entité",
  "Remarque",
];

export function receiptsToCsv(receipts: Receipt[], entityFor: (dateJst: string) => string): string {
  const lines = [CSV_HEADERS.map(csvCell).join(";")];
  for (const r of receipts) {
    lines.push(
      [
        r.dateJst,
        r.timeJst,
        r.client,
        r.label,
        r.kind,
        r.gross,
        r.items,
        r.commission,
        r.shipping,
        r.paypalCharged,
        r.paypalReal ?? "",
        r.paypalMargin ?? "",
        r.net ?? "",
        r.reference,
        r.id,
        entityFor(r.dateJst),
        r.warning ?? r.note ?? (r.paypalReal == null ? "Frais PayPal réels inconnus" : ""),
      ]
        .map((v) => csvCell(v as string | number))
        .join(";"),
    );
  }
  // BOM UTF-8 : Excel affiche correctement les accents et le japonais. Séparateur « ; » (Excel français).
  return "﻿" + lines.join("\r\n") + "\r\n";
}

// ── Entité fiscale à une date ────────────────────────────────────────────

export type Entity = { name: string; active_from: string | null; active_to: string | null };

/**
 * Entité qui exploitait l'activité à cette date. Vide si aucune date de bascule n'est confirmée
 * (on n'invente rien) ou si plusieurs entités se recouvrent.
 */
export function entityOn(date: string, entities: Entity[]): string {
  const dated = entities.filter((e) => e.active_from || e.active_to);
  if (dated.length === 0) return "";
  const matching = dated.filter((e) => (!e.active_from || e.active_from <= date) && (!e.active_to || date <= e.active_to));
  return matching.length === 1 ? matching[0].name : "";
}
