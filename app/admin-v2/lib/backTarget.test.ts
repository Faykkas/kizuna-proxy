import test from "node:test";
import assert from "node:assert/strict";
import { resolveBack } from "./backTarget.ts";

const base = "/admin-v2/commandes";

test("retour : la liste filtrée mémorisée est reprise (statut et page compris)", () => {
  assert.equal(resolveBack("/admin-v2/commandes?statut=Shipped&page=2", base), "/admin-v2/commandes?statut=Shipped&page=2");
  assert.equal(resolveBack(base, base), base);
});

test("retour : rien de mémorisé, ou adresse d'une autre page → liste par défaut", () => {
  assert.equal(resolveBack(null, base), base);
  assert.equal(resolveBack("https://exemple.com/x", base), base);
  assert.equal(resolveBack("/admin-v2/commandes-evil?x=1", base), base);
  assert.equal(resolveBack("/admin-v2/clients?q=a", base), base);
});
