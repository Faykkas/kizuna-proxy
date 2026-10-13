// Lancer : node --test app/admin-v2/lib/status.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { formatDateFr, monthLabelFr } from "./status.ts";

test("une date seule s'affiche telle quelle, quel que soit le fuseau de l'ordinateur", () => {
  for (const tz of ["Asia/Tokyo", "UTC", "America/New_York", "Europe/Paris"]) {
    process.env.TZ = tz;
    assert.match(formatDateFr("2026-07-12"), /^12 /, `fuseau ${tz}`);
    assert.match(formatDateFr("2026-10-01"), /^01 /, `fuseau ${tz}`);
  }
});

test("un horodatage complet est affiché à l'heure de Tokyo", () => {
  assert.match(formatDateFr("2026-09-30T20:00:00Z"), /^01 oct/);
});

test("libellé de mois", () => {
  assert.equal(monthLabelFr("2026-03").toLowerCase(), "mars 2026");
});
