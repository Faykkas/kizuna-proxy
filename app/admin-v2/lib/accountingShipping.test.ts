// Lancer : node --test app/admin-v2/lib/accountingShipping.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildReceipts, summarizeByMonth } from "./accounting.ts";
import { computeCommissions } from "./commissions.ts";

const link = (o = {}) => ({
  id: "l1", label: "Shipping to brazil", client_name: "Anna", paid_at: "2026-10-02T10:00:00Z",
  amount_jpy: 10176, item_amount_jpy: 9600, fee_amount_jpy: 0, paypal_fee_jpy: 576, paypal_real_fee_jpy: 440, is_shipping: false, paypal_order_id: "PP", ...o,
});

test("livraison saisie comme des articles : séparée d'après le libellé, lien intact", () => {
  const [r] = buildReceipts([link()]);
  assert.equal(r.kind, "Livraison (d'après le libellé)");
  assert.equal(r.shipping, 9600);
  assert.equal(r.items, 0);
  assert.equal(r.commission, 0);
  assert.equal(r.gross, 10176); // le total payé ne change pas
  assert.match(r.note ?? "", /libellé/);
});

test("un vrai achat d'articles n'est pas pris pour une livraison", () => {
  for (const label of ["Mercari items", "Disney store items cup", "Amnibus Danganronpa"]) {
    const [r] = buildReceipts([link({ label, item_amount_jpy: 5000, amount_jpy: 5300, paypal_fee_jpy: 300 })]);
    assert.equal(r.shipping, 0, label);
    assert.equal(r.items, 5000, label);
  }
});

test("livraison mélangée à des frais Kizuna : non séparée, signalée à vérifier", () => {
  const [r] = buildReceipts([link({ label: "Shipping loft", item_amount_jpy: 31730, fee_amount_jpy: 8000, paypal_fee_jpy: 2384, amount_jpy: 42114 })]);
  assert.equal(r.shipping, 0);
  assert.equal(r.items, 31730);
  assert.equal(r.commission, 8000);
  assert.match(r.note ?? "", /à vérifier/);
});

test("la synthèse mensuelle compte la livraison à part des articles", () => {
  const rs = buildReceipts([link({ id: "a" }), link({ id: "b", label: "Mercari items", item_amount_jpy: 5000, amount_jpy: 5300, paypal_fee_jpy: 300 })]);
  const [m] = summarizeByMonth(rs);
  assert.equal(m.items, 5000);
  assert.equal(m.shipping, 9600);
  assert.equal(m.gross, 10176 + 5300);
});

test("achats pour les clients : prix des articles des vraies commandes, hors colis et hors Pending/Cancelled", () => {
  const r = computeCommissions(
    [
      { client_name: "Anna", status: "Purchased", purchase_date: "2026-10-03", service_fee_jpy: 7000, item_price_jpy: 17090 },
      { client_name: "Bob", status: "Delivered", purchase_date: "2026-10-04", service_fee_jpy: 5000, item_price_jpy: 20000 },
      { client_name: "COMISSION PACKING 04/1", status: "Delivered", purchase_date: "2026-10-04", service_fee_jpy: 2950, item_price_jpy: 0 },
      { client_name: "Cat", status: "Pending", purchase_date: "2026-10-05", service_fee_jpy: 1000, item_price_jpy: 9999 },
      { client_name: "Dan", status: "Cancelled", purchase_date: "2026-10-06", service_fee_jpy: 1000, item_price_jpy: 8888 },
    ],
    [],
  );
  assert.equal(r.months[0].clientPurchases, 37090);
  assert.equal(r.months[0].total, 7000 + 5000 + 2950);
});
