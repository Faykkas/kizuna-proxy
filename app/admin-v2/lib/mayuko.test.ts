import test from "node:test";
import assert from "node:assert/strict";
import { addDays, balance, groupByWeek, notYetBoughtTotal, repayableOrders, weekStart, type PurchaseOrder } from "./mayuko.ts";

const o = (id: number, date: string, price: number, status = "Purchased", name = "Client"): PurchaseOrder => ({
  id,
  client_name: name,
  status,
  purchase_date: date,
  item_price_jpy: price,
});

test("la semaine commence le lundi", () => {
  assert.equal(weekStart("2026-11-01"), "2026-10-26"); // dimanche → lundi précédent
  assert.equal(weekStart("2026-11-02"), "2026-11-02"); // lundi
  assert.equal(weekStart("2026-11-08"), "2026-11-02"); // dimanche
  assert.equal(addDays("2026-11-30", 1), "2026-12-01");
});

test("on ne compte que les achats faits depuis la reprise, sur des commandes déjà achetées", () => {
  const orders = [
    o(1, "2026-10-30", 5000), // avant la reprise
    o(2, "2026-11-01", 8000), // le jour de la reprise
    o(3, "2026-11-03", 3000, "Delivered"),
    o(4, "2026-11-04", 9000, "Pending"), // demande reçue
    o(5, "2026-11-04", 4000, "Cancelled"),
    o(6, "2026-11-05", 7000, "Purchasing"), // pas encore acheté
    o(7, "2026-11-06", 2000, "Shipped"),
  ];
  const rows = repayableOrders(orders, "2026-11-01");
  assert.deepEqual(rows.map((r) => r.id), [2, 3, 7]);
  assert.equal(rows.reduce((s, r) => s + (r.item_price_jpy ?? 0), 0), 13000);
  assert.deepEqual(notYetBoughtTotal(orders, "2026-11-01"), { total: 7000, count: 1 });
});

test("les commissions colis et les commandes sans prix d'article ne sont pas des achats", () => {
  const orders = [o(1, "2026-11-02", 5000, "Shipped", "COMISSION PACKING 12/1"), o(2, "2026-11-02", 0), o(3, "2026-11-02", 1500)];
  assert.deepEqual(repayableOrders(orders, "2026-11-01").map((r) => r.id), [3]);
});

test("regroupement par semaine, la plus récente d'abord", () => {
  const weeks = groupByWeek([o(1, "2026-11-01", 100), o(2, "2026-11-03", 200), o(3, "2026-11-09", 300), o(4, "2026-11-08", 400)]);
  assert.deepEqual(weeks.map((w) => [w.start, w.end, w.total]), [
    ["2026-11-09", "2026-11-15", 300],
    ["2026-11-02", "2026-11-08", 600],
    ["2026-10-26", "2026-11-01", 100],
  ]);
});

test("solde : achats + avances − remboursements", () => {
  const ledger = [
    { id: 1, entry_date: "2026-11-09", kind: "repayment" as const, amount_jpy: 10000, note: null },
    { id: 2, entry_date: "2026-11-09", kind: "advance" as const, amount_jpy: 2500, note: "EMS" },
  ];
  assert.deepEqual(balance(13000, ledger), { purchases: 13000, advances: 2500, repayments: 10000, due: 5500 });
  assert.equal(balance(0, []).due, 0);
});
