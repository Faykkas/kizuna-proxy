import test from "node:test";
import assert from "node:assert/strict";
import { COUPONS_COPY } from "./couponsCopy.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];
const C = COUPONS_COPY as Record<string, any>;

function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, `${path}.${k}`));
  return [];
}
// Montants en yens : identiques dans toutes les langues.
const yen = (s: string) => (s.match(/¥\s?(?:\d{1,3}(?:,\d{3})+|\d+)/g) || []).map((n) => n.replace(/\s/g, "")).sort().join("|");

test("Coupons : les 12 langues existent", () => {
  assert.deepEqual(Object.keys(C).sort(), [...LANGS].sort());
});

test("Coupons : même structure que l'anglais dans chaque langue, aucun texte vide (sauf code/étiquette des coupons nominatifs)", () => {
  const ref = leaves(C.en).map(([p]) => p);
  for (const lang of LANGS) {
    const got = leaves(C[lang]);
    assert.deepEqual(got.map(([p]) => p), ref, `structure différente en ${lang}`);
    for (const [p, s] of got) if (!/\.(code|codeLabel)$/.test(p) || /cards\[0\]/.test(p)) assert.ok(s.trim().length > 0, `${lang}${p} est vide`);
  }
});

test("Coupons : les montants en yens sont identiques dans toutes les langues", () => {
  const ref = Object.fromEntries(leaves(C.en));
  for (const lang of LANGS) {
    for (const [p, s] of leaves(C[lang])) assert.equal(yen(s), yen(ref[p]), `${lang}${p} : « ${s} » n'a pas les mêmes montants que « ${ref[p]} »`);
  }
});

test("Coupons : le code de Noël est NOEL500 partout, et seul le coupon de Noël affiche un code", () => {
  for (const lang of LANGS) {
    assert.equal(C[lang].cards[0].code, "NOEL500", lang);
    assert.equal(C[lang].cards[1].code, "", lang);
    assert.equal(C[lang].cards[2].code, "", lang);
  }
});

test("Coupons : montants du cahier des charges (Noël 500, Trustpilot 500, Reddit 500 / 750 avec photos)", () => {
  assert.equal(C.en.cards[0].amount, "¥500");
  assert.equal(C.en.cards[1].amount, "¥500");
  assert.match(C.en.cards[2].amount, /¥500/);
  assert.match(C.en.cards[2].amount, /¥750/);
});

test("Coupons : chaque langue a un libellé de menu, un encadré pour la page Tarifs et une une d'accueil", () => {
  for (const lang of LANGS) {
    assert.ok(C[lang].nav.length > 0 && C[lang].callout.length > 0, lang);
    assert.ok(C[lang].promo.badge && C[lang].promo.title && C[lang].promo.desc && C[lang].promo.cta, lang);
  }
});
