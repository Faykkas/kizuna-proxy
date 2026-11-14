// Estimation du prix total pour le calculateur de l'accueil. Fonction pure, testée (estimate.test.ts).
//
// Frais Kizuna = ceux affichés sur /pricing (pricingCopyA.ts) :
//   - commande en ligne : ¥2,500 par article
//   - Onitsuka Tiger & boutiques japonaises : ¥5,000 par commande, quel que soit le nombre d'articles
//   - Coach Japan : 10 % de la valeur d'achat
// Livraison = tarif EMS officiel de la Poste japonaise (lib/shipping.ts, même grille que le calculateur de /shipping).
// Non inclus (dit au client) : port au Japon, droits et taxes du pays, frais de paiement.

import { emsPrice } from "./shipping.ts";

export type EstimateKind = "online" | "store" | "coach";
export const ESTIMATE_KINDS: EstimateKind[] = ["online", "store", "coach"];

export const ONLINE_FEE_PER_ITEM = 2500;
export const STORE_FEE_PER_ORDER = 5000;
export const COACH_FEE_RATE = 0.1;
export const MAX_QTY = 50;

export type EstimateInput = { kind: EstimateKind; price: number; qty: number; zone: number | null; grams: number };
export type Estimate = { items: number; fee: number; shipping: number | null; total: number; bracket: number | null };

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : 0)));

/** Prix d'un article (¥, par article) × quantité, frais Kizuna, livraison EMS estimée et total. null si rien à calculer. */
export function estimateTotal(input: EstimateInput): Estimate | null {
  const price = clampInt(input.price, 0, 100_000_000);
  if (price <= 0) return null;
  const qty = clampInt(input.qty, 1, MAX_QTY);
  const items = price * qty;
  const fee =
    input.kind === "store" ? STORE_FEE_PER_ORDER
    : input.kind === "coach" ? Math.round(items * COACH_FEE_RATE)
    : ONLINE_FEE_PER_ITEM * qty;
  const ems = input.zone ? emsPrice(clampInt(input.grams, 1, 30000), input.zone) : null;
  const shipping = ems ? ems.price : null;
  return { items, fee, shipping, total: items + fee + (shipping ?? 0), bracket: ems ? ems.bracket : null };
}
