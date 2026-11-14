import test from "node:test";
import assert from "node:assert/strict";
import { ESTIMATE_COPY, ESTIMATE_WEIGHTS } from "./estimateCopy.ts";
import { COACH_FEE_RATE, ONLINE_FEE_PER_ITEM, STORE_FEE_PER_ORDER } from "../../lib/estimate.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];

function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, `${path}.${k}`));
  return [];
}

test("Calculateur : 12 langues, même structure, aucun texte vide, un libellé par poids", () => {
  assert.deepEqual(Object.keys(ESTIMATE_COPY).sort(), [...LANGS].sort());
  const ref = leaves(ESTIMATE_COPY.en).map(([p]) => p);
  for (const lang of LANGS) {
    const got = leaves(ESTIMATE_COPY[lang]);
    assert.deepEqual(got.map(([p]) => p), ref, `structure différente en ${lang}`);
    for (const [p, s] of got) assert.ok(s.trim().length > 0, `${lang}${p} est vide`);
    assert.equal(ESTIMATE_COPY[lang].weights.length, ESTIMATE_WEIGHTS.length);
  }
});

test("Calculateur : les tarifs affichés correspondent aux tarifs calculés, dans toutes les langues", () => {
  const yen = (n: number) => `¥${n.toLocaleString("en-US")}`;
  for (const lang of LANGS) {
    const k = ESTIMATE_COPY[lang].kinds;
    assert.ok(k.online.includes(yen(ONLINE_FEE_PER_ITEM)), `${lang} : tarif en ligne`);
    assert.ok(k.store.includes(yen(STORE_FEE_PER_ORDER)), `${lang} : tarif boutiques`);
    assert.ok(k.coach.includes(`${COACH_FEE_RATE * 100}%`), `${lang} : tarif Coach`);
  }
});
