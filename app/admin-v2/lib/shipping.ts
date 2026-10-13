// Retrouver les paiements de LIVRAISON.
//
// Situation constatée (2026-10-13) : parmi les liens payés, aucun n'a été créé en mode
// « livraison » (is_shipping), donc aucune commande n'a de prix de livraison enregistré :
// le montant a été saisi comme un article et fusionné dans item_price_jpy.
//
// Pour le PASSÉ, on ne peut donc que deviner d'après le libellé du lien (« Shipping to
// brazil », « Delivery »…) et rattacher le lien à la commande du client (email + date).
// Pour l'AVENIR, le formulaire de création force le choix du type.
//
// Fichier sans dépendance, testable seul.

const SHIPPING_WORDS = /\b(ship|shipping|shipped|delivery|deliver|livraison|livrer|exp[ée]dition|exp[ée]dier|envoi|freight|postage)\b/i;

export function looksLikeShipping(label: string | null | undefined): boolean {
  return !!label && SHIPPING_WORDS.test(label);
}

export type LinkLite = {
  id: string;
  label: string | null;
  client_email: string | null;
  paid_at: string | null;
  amount_jpy: number | null;
  item_amount_jpy: number | null;
  fee_amount_jpy: number | null;
  paypal_fee_jpy: number | null;
  is_shipping: boolean | null;
};

export type OrderLiteForLinks = { id: number; client_email: string | null; created_at: string | null };

/** Livraison explicite (is_shipping) ou, à défaut, déduite du libellé. */
export function shippingKind(l: Pick<LinkLite, "is_shipping" | "label">): "explicit" | "guessed" | null {
  if (l.is_shipping) return "explicit";
  return looksLikeShipping(l.label) ? "guessed" : null;
}

/**
 * Montant de livraison d'un lien, en yens entiers (hors frais PayPal facturés).
 * Mode « livraison » : le montant est dans fee_amount_jpy. Ancienne saisie (libellé
 * seulement) : il est dans item_amount_jpy, éventuellement avec des frais Kizuna.
 * Quand le lien mélange livraison et frais Kizuna (ex. « Shipping loft » 31 730 + 8 000),
 * on ne PEUT PAS séparer : on retourne le montant article seul et on marque « mixte ».
 */
export function shippingAmount(l: LinkLite): { amount: number; mixed: boolean } {
  if (l.is_shipping) return { amount: Math.round(l.fee_amount_jpy ?? 0), mixed: false };
  const item = Math.round(l.item_amount_jpy ?? 0);
  const fee = Math.round(l.fee_amount_jpy ?? 0);
  return { amount: item, mixed: fee > 0 };
}

const TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Rattache chaque lien payé à une commande du même client : la commande la plus récente
 * créée AVANT le paiement (à 5 minutes près, car la commande est créée juste après la
 * capture). C'est une estimation : le site fusionnait les paiements dans la commande
 * ouverte du moment, sans garder le lien exact.
 */
export function assignLinksToOrders(orders: OrderLiteForLinks[], links: LinkLite[]): Map<string, number> {
  const out = new Map<string, number>();
  const byEmail = new Map<string, { id: number; t: number }[]>();
  for (const o of orders) {
    const email = (o.client_email ?? "").trim().toLowerCase();
    if (!email || !o.created_at) continue;
    const arr = byEmail.get(email) ?? [];
    arr.push({ id: o.id, t: Date.parse(o.created_at) });
    byEmail.set(email, arr);
  }
  for (const arr of byEmail.values()) arr.sort((a, b) => a.t - b.t);

  for (const l of links) {
    const email = (l.client_email ?? "").trim().toLowerCase();
    const arr = byEmail.get(email);
    if (!arr || !l.paid_at) continue;
    const paid = Date.parse(l.paid_at);
    let pick: number | null = null;
    for (const o of arr) if (o.t <= paid + TOLERANCE_MS) pick = o.id;
    if (pick != null) out.set(l.id, pick);
  }
  return out;
}

/** Frais PayPal « Goods & Services » facturés au client : 6 % de (articles + commission), en entiers. */
export function paypalFee(itemAmount: number, feeAmount: number): number {
  // Arrondi à l'entier le plus proche (moitié vers le haut) sans passer par un flottant.
  return Math.floor(((itemAmount + feeAmount) * 6 + 50) / 100);
}
