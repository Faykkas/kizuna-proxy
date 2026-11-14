import test from "node:test";
import assert from "node:assert/strict";
import { computeStats, normalizeCountry } from "./siteStats.ts";

test("chiffres : orthographes d'un même pays regroupées, Japon exclu", () => {
  assert.equal(normalizeCountry("America"), "US");
  assert.equal(normalizeCountry(" United States "), "US");
  assert.equal(normalizeCountry("USA"), "US");
  assert.equal(normalizeCountry("Brasil"), "BR");
  assert.equal(normalizeCountry("bresil"), "BR");
  assert.equal(normalizeCountry("Singapour"), "SG");
  assert.equal(normalizeCountry("England"), "GB");
  assert.equal(normalizeCountry("Portugese"), "PT");
  assert.equal(normalizeCountry(""), null);
  assert.equal(normalizeCountry("Finland"), "finland");
});

test("chiffres : livrées hors « commission package », pays distincts hors Japon", () => {
  const s = computeStats([
    { status: "Delivered", delivery_country: "USA", client_name: "Anna" },
    { status: "Delivered", delivery_country: "america", client_name: "Bob" },
    { status: "Delivered", delivery_country: "Brasil", client_name: "Caio" },
    { status: "Shipped", delivery_country: "Brazil", client_name: "Dani" },
    { status: "Delivered", delivery_country: "Japan", client_name: "Eri" },
    { status: "Delivered", delivery_country: "Canada", client_name: "Commission package Nov" },
    { status: "Pending", delivery_country: null, client_name: "Fay" },
  ]);
  assert.deepEqual(s, { delivered: 4, countries: 2 }); // US + BR ; le Japon et la ligne interne ne comptent pas
});
