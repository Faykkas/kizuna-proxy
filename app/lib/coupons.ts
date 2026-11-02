// Coupons Kizuna : la remise réduit les FRAIS DE SERVICE de Samuel (sa marge), jamais le prix des articles,
// la livraison ni les taxes. Un coupon = une seule utilisation par client (identifié par son email).
// Fonctions pures, partagées par la page de paiement (route /api/payment-link) et l'admin. Testées dans coupons.test.ts.

import { paypalFee } from "../admin-v2/lib/shipping.ts";

export type CouponKind = "christmas" | "trustpilot" | "reddit" | "reddit_photo" | "custom";

/** Types de coupons proposés dans l'admin : montant conseillé, et s'ils sont nominatifs (liés à l'email du client). */
export const COUPON_KINDS: Record<CouponKind, { amount: number; personal: boolean }> = {
  christmas: { amount: 500, personal: false }, // code commun pour tous, une fois par client
  trustpilot: { amount: 500, personal: true }, // avis Trustpilot vérifié
  reddit: { amount: 500, personal: true }, // avis Reddit r/internationalshopper vérifié
  reddit_photo: { amount: 750, personal: true }, // avis Reddit avec photos
  custom: { amount: 500, personal: false },
};

export const MAX_COUPON_YEN = 100_000;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I, O, 0, 1 : pas de confusion à la saisie

/** Code saisi → forme enregistrée : majuscules, sans espaces, seulement A-Z 0-9 et tiret. */
export function normalizeCode(raw: unknown): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[\s_]+/g, "")
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export function isValidCode(code: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{3,31}$/.test(code);
}

/** Code aléatoire « KZ-XXXXXXXX » (8 caractères, ~1 000 milliards de possibilités) pour les coupons nominatifs. */
export function generateCode(random: (n: number) => number = (n) => Math.floor(Math.random() * n)): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[random(CODE_ALPHABET.length)];
  return `KZ-${s}`;
}

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Date limite « 2026-12-31 » → fin de cette journée à Tokyo (inclus). */
export function endOfDayTokyo(day: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const d = new Date(`${day}T23:59:59+09:00`);
  // Aller-retour : « 2026-02-30 » ne doit pas devenir le 2 mars.
  if (Number.isNaN(d.getTime()) || new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10) !== day) return null;
  return d.toISOString();
}

export type CouponRow = {
  id: string;
  code: string;
  kind: string;
  amount_jpy: number;
  customer_email: string | null;
  expires_at: string | null;
  max_total_uses: number | null;
  active: boolean;
};

export type CouponRefusal = "invalid" | "expired" | "used" | "sold_out" | "not_eligible" | "email_required";

export type CheckInput = {
  coupon: CouponRow | null;
  /** Email du client (celui de son lien de paiement ou celui qu'il a saisi), déjà normalisé. */
  email: string;
  now: Date;
  /** Ce client a déjà réservé ou utilisé ce coupon (sur un autre lien). */
  usedByThisEmail: boolean;
  /** Nombre de réservations + utilisations de ce coupon, tous clients confondus. */
  totalUsed: number;
  /** Frais de service du lien AVANT toute remise, et type de lien. */
  link: { isShipping: boolean; feeBeforeCoupon: number };
};

/**
 * Le coupon peut-il être appliqué ? Un coupon nominatif donné à un autre client répond « invalid » (comme un code
 * inconnu), pour ne pas révéler qu'il existe.
 */
export function checkCoupon(i: CheckInput): { ok: true } | { ok: false; reason: CouponRefusal } {
  const c = i.coupon;
  if (!c || !c.active) return { ok: false, reason: "invalid" };
  if (i.link.isShipping || i.link.feeBeforeCoupon <= 0) return { ok: false, reason: "not_eligible" };
  if (c.expires_at && Date.parse(c.expires_at) < i.now.getTime()) return { ok: false, reason: "expired" };
  if (!i.email || !isValidEmail(i.email)) return { ok: false, reason: "email_required" };
  if (c.customer_email && normalizeEmail(c.customer_email) !== i.email) return { ok: false, reason: "invalid" };
  if (i.usedByThisEmail) return { ok: false, reason: "used" };
  if (c.max_total_uses != null && i.totalUsed >= c.max_total_uses) return { ok: false, reason: "sold_out" };
  return { ok: true };
}

/**
 * Montants d'un lien avec coupon : la remise est plafonnée aux frais de service (jamais négatifs), puis les frais
 * PayPal (6 %) sont recalculés sur ce que le client paie réellement, taxes comprises, comme à la création du lien.
 */
export function priceWithCoupon(a: { itemAmount: number; fee: number; tax: number; couponAmount: number }) {
  const discount = Math.max(0, Math.min(Math.round(a.couponAmount), Math.round(a.fee)));
  const fee = Math.round(a.fee) - discount;
  const paypal = paypalFee(a.itemAmount, fee + a.tax);
  return { discount, fee, paypal, total: a.itemAmount + fee + a.tax + paypal };
}

/** Libellés lisibles des types de coupons (admin, en français). */
export const COUPON_KIND_LABELS: Record<string, string> = {
  christmas: "Noël",
  trustpilot: "Avis Trustpilot",
  reddit: "Avis Reddit",
  reddit_photo: "Avis Reddit avec photos",
  custom: "Autre",
};

/** E-mail envoyé au client avec son coupon (en anglais : clients du monde entier). Le propriétaire peut le modifier avant envoi. */
export function couponMessage(c: { code: string; amount_jpy: number; kind: string; expires_at: string | null }) {
  const amount = `¥${c.amount_jpy.toLocaleString("en-US")}`;
  const until = c.expires_at ? new Date(Date.parse(c.expires_at) + 9 * 3600_000).toISOString().slice(0, 10) : null;
  const reason = c.kind === "trustpilot" || c.kind === "reddit" || c.kind === "reddit_photo" ? "Thank you so much for your review!" : "Thank you for shopping with Kizuna Proxy!";
  const subject = `Your ${amount} Kizuna Proxy coupon`;
  const body = [
    "Hello,",
    "",
    reason,
    `As a thank-you, here is a coupon worth ${amount} off our service fee on your next order:`,
    "",
    `    ${c.code}`,
    "",
    "How to use it: open the payment link we send you for your order, click \"Have a coupon code?\" and enter the code. It can be used once, with the same email address as your order.",
    until ? `Valid until ${until}.` : null,
    "",
    "Thank you for your support!",
    "Kizuna Proxy",
  ].filter((l): l is string => l !== null).join("\n");
  return { subject, body };
}
