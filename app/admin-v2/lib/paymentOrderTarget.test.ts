// Lancer : node --test app/admin-v2/lib/paymentOrderTarget.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { resolveOpenOrder } from "../../lib/paymentOrderTarget.ts";

const o = (id: number, status: string, purchase_date: string) => ({ id, status, purchase_date, created_at: `${purchase_date}T10:00:00Z` });
const sept = o(1, "Purchased", "2026-09-10");
const oct = o(2, "Purchased", "2026-10-02");
const delivered = o(3, "Delivered", "2026-10-01");

test("automatique : commande ouverte du même mois pour des articles", () => {
  const r = resolveOpenOrder({ link: {}, existingOrders: [oct, sept], targetOrder: null, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r?.id, 2);
});

test("automatique : changement de mois => nouvelle commande (le problème de départ)", () => {
  const r = resolveOpenOrder({ link: {}, existingOrders: [sept], targetOrder: null, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r, null);
});

test("choix explicite : on ajoute à la commande de septembre malgré le nouveau mois", () => {
  const r = resolveOpenOrder({ link: { target_order_id: 1 }, existingOrders: [sept], targetOrder: sept, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r?.id, 1);
});

test("choix explicite : même une commande déjà livrée", () => {
  const r = resolveOpenOrder({ link: { target_order_id: 3 }, existingOrders: [delivered, oct], targetOrder: delivered, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r?.id, 3);
});

test("« nouvelle commande » : toujours une nouvelle, même s'il y en a une ouverte", () => {
  const r = resolveOpenOrder({ link: { new_order: true }, existingOrders: [oct], targetOrder: null, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r, null);
});

test("commande choisie disparue : repli sur la règle automatique, jamais de paiement perdu", () => {
  const r = resolveOpenOrder({ link: { target_order_id: 99 }, existingOrders: [oct], targetOrder: null, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r?.id, 2);
});

test("livraison sans choix : rejoint la commande ouverte quel que soit le mois", () => {
  const r = resolveOpenOrder({ link: {}, existingOrders: [sept], targetOrder: null, isShippingPayment: true, thisMonth: "2026-10" });
  assert.equal(r?.id, 1);
});

test("commandes expédiées/livrées/annulées ignorées par la règle automatique", () => {
  const r = resolveOpenOrder({ link: {}, existingOrders: [delivered, o(4, "Cancelled", "2026-10-03")], targetOrder: null, isShippingPayment: false, thisMonth: "2026-10" });
  assert.equal(r, null);
});
