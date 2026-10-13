// Lancer : node --test app/admin-v2/lib/accounting.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { annualExpenseTotal, buildReceipts, csvCell, entityOn, monthlyExpenseAverage, receiptsToCsv, summarizeByMonth, toJst } from "./accounting.ts";

const link = (o: Partial<Parameters<typeof buildReceipts>[0][number]> = {}) => ({
  id: "l1", label: "Mercari items", client_name: "Anna", paid_at: "2026-10-06T01:04:59.633+00:00",
  amount_jpy: 15725, item_amount_jpy: 14835, fee_amount_jpy: 0, paypal_fee_jpy: 890, paypal_real_fee_jpy: 685, is_shipping: false, paypal_order_id: "PP1", ...o,
});

test("heure de Tokyo : 20h UTC le 30 sept = 1er octobre 05h", () => {
  assert.deepEqual(toJst("2026-09-30T20:00:00Z"), { date: "2026-10-01", time: "05:00" });
});

test("encaissement : ventilation, frais réels, marge et net (vrai lien de la base)", () => {
  const [r] = buildReceipts([link()]);
  assert.equal(r.gross, 15725);
  assert.equal(r.items, 14835);
  assert.equal(r.paypalMargin, 205);
  assert.equal(r.net, 15725 - 685);
  assert.equal(r.kind, "Articles");
  assert.equal(r.warning, null);
  assert.equal(r.dateJst, "2026-10-06");
});

test("lien « livraison » : le montant va dans livraison, pas dans commission", () => {
  const [r] = buildReceipts([link({ is_shipping: true, item_amount_jpy: 0, fee_amount_jpy: 9600, paypal_fee_jpy: 576, amount_jpy: 10176, paypal_real_fee_jpy: 440 })]);
  assert.equal(r.kind, "Livraison");
  assert.equal(r.shipping, 9600);
  assert.equal(r.commission, 0);
  assert.equal(r.items, 0);
});

test("frais réels inconnus : net et marge restent vides, jamais inventés", () => {
  const [r] = buildReceipts([link({ paypal_real_fee_jpy: null })]);
  assert.equal(r.net, null);
  assert.equal(r.paypalMargin, null);
});

test("ancien lien (total seul) : ni fausse alerte, ni marge négative inventée", () => {
  const [r] = buildReceipts([link({ item_amount_jpy: 0, fee_amount_jpy: 0, paypal_fee_jpy: 0, amount_jpy: 24113, paypal_real_fee_jpy: 800 })]);
  assert.equal(r.kind, "Ancien lien (total seul)");
  assert.equal(r.warning, null);
  assert.match(r.note ?? "", /total seul/);
  assert.equal(r.paypalMargin, null);
  assert.equal(r.net, 24113 - 800);
  const [m] = summarizeByMonth([r]);
  assert.equal(m.paypalMargin, 0);
});

test("incohérence signalée : total ≠ articles + frais + frais PayPal", () => {
  const [r] = buildReceipts([link({ amount_jpy: 20000 })]);
  assert.match(r.warning ?? "", /≠/);
});

test("synthèse mensuelle : somme des seuls frais connus, compte des inconnus", () => {
  const rs = buildReceipts([
    link({ id: "a" }),
    link({ id: "b", paid_at: "2026-10-09T15:30:00Z", paypal_real_fee_jpy: null }),
    link({ id: "c", paid_at: "2026-09-28T23:22:00Z" }),
  ]);
  const s = summarizeByMonth(rs);
  assert.deepEqual(s.map((m) => m.month), ["2026-09", "2026-10"]);
  const oct = s[1];
  assert.equal(oct.count, 2);
  assert.equal(oct.gross, 31450);
  assert.equal(oct.paypalReal, 685);
  assert.equal(oct.unknownFees, 1);
  assert.equal(oct.net, 15725 - 685);
});

test("dépenses : mensuelles x12, annuelles x1, moyenne mensuelle arrondie", () => {
  const e = [
    { id: 1, label: "Vercel", category: "Hébergement", amount_jpy: 3000, frequency: "monthly", notes: null },
    { id: 2, label: "Domaine", category: "Domaine", amount_jpy: 2000, frequency: "yearly", notes: null },
  ];
  assert.equal(annualExpenseTotal(e), 38000);
  assert.equal(monthlyExpenseAverage(e), 3167);
});

test("CSV : protège les formules Excel, échappe guillemets et séparateurs, BOM présent", () => {
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(csvCell("+33"), "'+33");
  assert.equal(csvCell(-500), "-500"); // un nombre négatif reste un nombre
  assert.equal(csvCell('dit "oui"; non'), '"dit ""oui""; non"');
  const csv = receiptsToCsv(buildReceipts([link({ label: "=1+1" })]), () => "");
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes("'=1+1"));
  assert.equal(csv.trim().split("\r\n").length, 2);
});

test("entité : rien d'inventé sans dates ; attribution seulement si une seule entité correspond", () => {
  assert.equal(entityOn("2026-10-06", [{ name: "Mayuko", active_from: null, active_to: null }, { name: "Samuel", active_from: null, active_to: null }]), "");
  const dated = [{ name: "Mayuko", active_from: null, active_to: "2026-11-30" }, { name: "Samuel", active_from: "2026-12-01", active_to: null }];
  assert.equal(entityOn("2026-10-06", dated), "Mayuko");
  assert.equal(entityOn("2026-12-15", dated), "Samuel");
  const overlap = [{ name: "A", active_from: "2026-01-01", active_to: null }, { name: "B", active_from: "2026-06-01", active_to: null }];
  assert.equal(entityOn("2026-07-01", overlap), "");
});
