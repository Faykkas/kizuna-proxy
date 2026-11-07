import test from "node:test";
import assert from "node:assert/strict";
import { FOOTER_COPY } from "./navFooterCopy.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];

test("Pied de page : les 12 langues existent, mêmes clés, aucun texte vide", () => {
  assert.deepEqual(Object.keys(FOOTER_COPY).sort(), [...LANGS].sort());
  const ref = Object.keys(FOOTER_COPY.en).sort();
  for (const lang of LANGS) {
    assert.deepEqual(Object.keys(FOOTER_COPY[lang]).sort(), ref, lang);
    for (const [k, v] of Object.entries(FOOTER_COPY[lang])) assert.ok(String(v).trim().length > 0, `${lang}.${k}`);
  }
});
