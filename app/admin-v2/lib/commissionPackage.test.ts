// Lancer : node --test app/admin-v2/lib/commissionPackage.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { isCommissionPackage } from "../../lib/commissionPackage.ts";

test("reconnaît les noms réellement présents dans la base", () => {
  for (const n of ["COMISSION PACKING 26/0", "COMISSION PACKING 04/1", "Comission PACKAGE WEEK", "commission package", "  Commission Packing 3/2"])
    assert.equal(isCommissionPackage({ client_name: n }), true, n);
});

test("ne confond pas avec de vrais clients", () => {
  for (const n of ["Jeffrey Bowlby", "Ahmed", "Package lost to him", "Packing Paul", "", null, undefined])
    assert.equal(isCommissionPackage({ client_name: n as string }), false, String(n));
});
