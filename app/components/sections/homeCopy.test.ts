import test from "node:test";
import assert from "node:assert/strict";
import { HOME_COPY } from "./homeCopy.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];

test("Accueil pro : les 12 langues existent", () => {
  assert.deepEqual(Object.keys(HOME_COPY).sort(), [...LANGS].sort());
});

test("Accueil pro : mêmes clés, 8 catégories, 10 produits, 4 arguments, aucun texte vide dans chaque langue", () => {
  const ref = Object.keys(HOME_COPY.en).sort();
  for (const lang of LANGS) {
    const c = HOME_COPY[lang];
    assert.deepEqual(Object.keys(c).sort(), ref, lang);
    assert.equal(c.cats.length, 8, lang);
    assert.equal(c.picks.length, 10, lang);
    for (const p of c.picks) assert.ok(p.trim().length > 0, `${lang}.picks`);
    assert.equal(c.trust.length, 4, lang);
    for (const [k, v] of Object.entries(c)) {
      if (typeof v === "string") assert.ok(v.trim().length > 0, `${lang}.${k}`);
    }
    for (const s of c.cats) assert.ok(s.trim().length > 0, `${lang}.cats`);
    for (const x of c.trust) assert.ok(x.t.trim() && x.d.trim(), `${lang}.trust`);
  }
});
