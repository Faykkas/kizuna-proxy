// Lancer : node --test app/admin-v2/lib/commissions.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { computeCommissions, currentMonthJst, lastMonths } from "./commissions.ts";

test("ignore Pending et Cancelled, groupe par mois de purchase_date", () => {
  const r = computeCommissions(
    [
      { status: "Purchased", purchase_date: "2026-10-03", service_fee_jpy: 11200 },
      { status: "Delivered", purchase_date: "2026-10-20", service_fee_jpy: 800 },
      { status: "Pending", purchase_date: "2026-10-05", service_fee_jpy: 5000 },
      { status: "Cancelled", purchase_date: "2026-10-06", service_fee_jpy: 7000 },
      { status: "Purchased", purchase_date: "2026-09-28", service_fee_jpy: 9000 },
      { status: "Purchased", purchase_date: null, service_fee_jpy: 1234 },
    ],
    [],
  );
  assert.deepEqual(
    r.months.map((m) => [m.month, m.total, m.orderCount]),
    [["2026-09", 9000, 1], ["2026-10", 12000, 2]],
  );
});

test("une commande à 0 ¥ de frais est comptée", () => {
  const r = computeCommissions([{ status: "Purchased", purchase_date: "2026-10-01", service_fee_jpy: 0 }], []);
  assert.equal(r.months[0].orderCount, 1);
  assert.equal(r.months[0].total, 0);
});

test("marge PayPal = facturé − réel, par mois de paid_at, négative possible", () => {
  const r = computeCommissions([], [
    { paid_at: "2026-10-06T01:04:59.633+00:00", paypal_fee_jpy: 890, paypal_real_fee_jpy: 685 },
    { paid_at: "2026-10-09T15:30:48.039+00:00", paypal_fee_jpy: 99, paypal_real_fee_jpy: 112 },
    { paid_at: "2026-10-10T00:00:00+00:00", paypal_fee_jpy: 500, paypal_real_fee_jpy: null }, // frais réel inconnu
    { paid_at: "2026-10-11T00:00:00+00:00", paypal_fee_jpy: 0, paypal_real_fee_jpy: 0 },
  ]);
  assert.equal(r.months.length, 1);
  assert.equal(r.months[0].paypalMargin, 205 - 13);
  assert.equal(r.months[0].total, 192);
});

test("montants non entiers : signalés dans anomalies, jamais silencieux", () => {
  const r = computeCommissions([{ status: "Purchased", purchase_date: "2026-10-01", service_fee_jpy: 100.5 }], []);
  assert.equal(r.anomalies.length, 1);
  assert.equal(r.months[0].serviceFees, 101);
});

test("mois courant à Tokyo : 20h UTC le 30 sept = 1er octobre à Tokyo", () => {
  assert.equal(currentMonthJst(new Date("2026-09-30T20:00:00Z")), "2026-10");
  assert.equal(currentMonthJst(new Date("2026-09-30T14:59:00Z")), "2026-09");
});

test("lastMonths enjambe l'année", () => {
  assert.deepEqual(lastMonths("2026-02", 4), ["2025-11", "2025-12", "2026-01", "2026-02"]);
});
