// Lancer : node --test app/admin-v2/lib/shipping.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { assignLinksToOrders, looksLikeShipping, paypalFee, shippingAmount, shippingKind } from "./shipping.ts";

test("détecte les libellés de livraison, pas les faux amis", () => {
  for (const l of ["Shipping to brazil", "Delivery", "Pokemon delivery", "Hobonishi shipping + tax", "Livraison colis", "Coach shipping"])
    assert.equal(looksLikeShipping(l), true, l);
  for (const l of ["Mercari items", "Disney store items cup", "Reservation loft", "Amnibus Danganronpa", "", null])
    assert.equal(looksLikeShipping(l as string), false, String(l));
});

test("is_shipping explicite prime sur le libellé", () => {
  assert.equal(shippingKind({ is_shipping: true, label: "x" }), "explicit");
  assert.equal(shippingKind({ is_shipping: false, label: "Shipping to america" }), "guessed");
  assert.equal(shippingKind({ is_shipping: false, label: "Mercari items" }), null);
});

test("montant de livraison : mode livraison vs ancienne saisie, mixte signalé", () => {
  const base = { id: "a", label: "", client_email: "", paid_at: "", amount_jpy: 0, paypal_fee_jpy: 0 };
  assert.deepEqual(shippingAmount({ ...base, is_shipping: true, item_amount_jpy: 0, fee_amount_jpy: 5000 }), { amount: 5000, mixed: false });
  assert.deepEqual(shippingAmount({ ...base, is_shipping: false, item_amount_jpy: 9600, fee_amount_jpy: 0 }), { amount: 9600, mixed: false });
  assert.deepEqual(shippingAmount({ ...base, is_shipping: false, item_amount_jpy: 31730, fee_amount_jpy: 8000 }), { amount: 31730, mixed: true });
});

test("rattachement : commande la plus récente avant le paiement, tolérance 5 min, par email insensible à la casse", () => {
  const orders = [
    { id: 1, client_email: "A@x.com", created_at: "2026-09-01T10:00:00Z" },
    { id: 2, client_email: "a@x.com", created_at: "2026-10-01T10:00:00Z" },
    { id: 3, client_email: "b@x.com", created_at: "2026-10-01T10:00:00Z" },
  ];
  const mk = (id: string, email: string, paid_at: string) => ({ id, label: "", client_email: email, paid_at, amount_jpy: 0, item_amount_jpy: 0, fee_amount_jpy: 0, paypal_fee_jpy: 0, is_shipping: false });
  const m = assignLinksToOrders(orders, [
    mk("l1", "a@x.com", "2026-09-15T00:00:00Z"), // → commande 1
    mk("l2", "a@x.com", "2026-10-05T00:00:00Z"), // → commande 2
    mk("l3", "a@x.com", "2026-10-01T09:58:00Z"), // 2 min avant la création de #2 → #2 (tolérance)
    mk("l4", "a@x.com", "2026-08-01T00:00:00Z"), // avant toute commande → aucune
    mk("l5", "z@x.com", "2026-10-05T00:00:00Z"), // email inconnu → aucune
  ]);
  assert.equal(m.get("l1"), 1);
  assert.equal(m.get("l2"), 2);
  assert.equal(m.get("l3"), 2);
  assert.equal(m.has("l4"), false);
  assert.equal(m.has("l5"), false);
});

test("frais PayPal 6 % en entiers, moitié vers le haut", () => {
  assert.equal(paypalFee(7865, 8000), 952); // valeur réelle d'un lien existant
  assert.equal(paypalFee(14835, 0), 890);
  assert.equal(paypalFee(5000, 0), 300);
  assert.equal(paypalFee(25, 0), 2); // 1,5 → 2
  assert.equal(paypalFee(0, 0), 0);
});
