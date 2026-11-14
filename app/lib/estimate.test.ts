import test from "node:test";
import assert from "node:assert/strict";
import { estimateTotal } from "./estimate.ts";

test("Estimation : commande en ligne, ¥2,500 par article + EMS", () => {
  // 2 articles à ¥4,000 vers la France (zone 3), 800 g → EMS ¥3,900
  assert.deepEqual(estimateTotal({ kind: "online", price: 4000, qty: 2, zone: 3, grams: 800 }), { items: 8000, fee: 5000, shipping: 3900, total: 16900, bracket: 800 });
});

test("Estimation : Onitsuka Tiger, ¥5,000 par commande quel que soit le nombre de paires", () => {
  const r = estimateTotal({ kind: "store", price: 15000, qty: 3, zone: 4, grams: 1500 });
  assert.equal(r?.items, 45000);
  assert.equal(r?.fee, 5000);
  assert.equal(r?.shipping, 6600); // États-Unis (zone 4), 1,5 kg
  assert.equal(r?.total, 56600);
});

test("Estimation : Coach, 10 % de la valeur d'achat (exemple de /pricing)", () => {
  const r = estimateTotal({ kind: "coach", price: 50000, qty: 1, zone: null, grams: 1000 });
  assert.deepEqual(r, { items: 50000, fee: 5000, shipping: null, total: 55000, bracket: null });
});

test("Estimation : poids arrondi à la tranche EMS supérieure, valeurs absurdes bornées", () => {
  assert.equal(estimateTotal({ kind: "online", price: 1000, qty: 1, zone: 1, grams: 200 })?.bracket, 500);
  assert.equal(estimateTotal({ kind: "online", price: 1000, qty: 0, zone: null, grams: 0 })?.fee, 2500);
  assert.equal(estimateTotal({ kind: "online", price: 1000, qty: 999, zone: null, grams: 0 })?.fee, 2500 * 50);
  assert.equal(estimateTotal({ kind: "online", price: 0, qty: 1, zone: 3, grams: 500 }), null);
  assert.equal(estimateTotal({ kind: "online", price: Number.NaN, qty: 1, zone: 3, grams: 500 }), null);
});
