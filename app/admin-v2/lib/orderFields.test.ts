// Lancer : node --test app/admin-v2/lib/orderFields.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { diffFields, findConflicts, validateOrderChanges } from "./orderFields.ts";

test("valide et nettoie des champs normaux", () => {
  const r = validateOrderChanges({ client_name: "  Soo ", item_price_jpy: "28310", service_fee_jpy: 8000, shipping_paid: true, status: "Purchased", purchase_date: "2026-09-25", client_email: "soo@x.com", notes: "" });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.clean, { client_name: "Soo", item_price_jpy: 28310, service_fee_jpy: 8000, shipping_paid: true, status: "Purchased", purchase_date: "2026-09-25", client_email: "soo@x.com", notes: null });
});

test("refuse un champ hors liste blanche (id, created_at, public_ref…)", () => {
  for (const k of ["id", "created_at", "public_ref", "updated_at", "shipment_id"]) assert.equal(validateOrderChanges({ [k]: "x" }).ok, false, k);
});

test("refuse montants décimaux ou texte, statut inconnu, date et email invalides", () => {
  assert.equal(validateOrderChanges({ item_price_jpy: "12.5" }).ok, false);
  assert.equal(validateOrderChanges({ item_price_jpy: "abc" }).ok, false);
  assert.equal(validateOrderChanges({ status: "Hacked" }).ok, false);
  assert.equal(validateOrderChanges({ purchase_date: "2026-13-45" }).ok, false);
  assert.equal(validateOrderChanges({ purchase_date: "10/10/2026" }).ok, false);
  assert.equal(validateOrderChanges({ client_email: "pas un email" }).ok, false);
  assert.equal(validateOrderChanges({ customer_id: "123" }).ok, false);
  assert.equal(validateOrderChanges({ client_name: "x".repeat(500) }).ok, false);
});

test("vide un champ optionnel : texte → null, date → null, montant → 0", () => {
  const r = validateOrderChanges({ event_name: "", event_date: "", item_price_jpy: "" });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.clean, { event_name: null, event_date: null, item_price_jpy: 0 });
});

test("diff : seulement les champs modifiés, null et chaîne vide équivalents", () => {
  const orig = { client_name: "A", notes: null, item_price_jpy: 100, status: "Pending" };
  const { changes, before } = diffFields(orig, { client_name: "A", notes: "", item_price_jpy: 150, status: "Purchased", id: 5 });
  assert.deepEqual(changes, { item_price_jpy: 150, status: "Purchased" });
  assert.deepEqual(before, { item_price_jpy: 100, status: "Pending" });
});

test("conflit : détecte un champ changé en base depuis le chargement", () => {
  // le formulaire a chargé item_price=100 ; entre-temps un paiement l'a monté à 250
  assert.deepEqual(findConflicts({ item_price_jpy: 100 }, { item_price_jpy: 250, status: "Pending" }), ["item_price_jpy"]);
  assert.deepEqual(findConflicts({ item_price_jpy: 100 }, { item_price_jpy: 100 }), []);
  assert.deepEqual(findConflicts({ notes: null }, { notes: "" }), []);
});
