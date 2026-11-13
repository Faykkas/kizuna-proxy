import test from "node:test";
import assert from "node:assert/strict";
import { XMAS_COPY } from "./xmasCopy.ts";
import { XMAS_IDEAS, XMAS_DEADLINE, XMAS_CODE, rankIdeas, timeLeft } from "./xmasConfig.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];
const C = XMAS_COPY as Record<string, any>;

function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, `${path}.${k}`));
  return [];
}
const yen = (s: string) => (s.match(/¥\s?(?:\d{1,3}(?:,\d{3})+|\d+)/g) || []).map((n) => n.replace(/\s/g, "")).sort().join("|");
const vars = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join("|");

test("Noël : les 12 langues existent, même structure que l'anglais, aucun texte vide", () => {
  assert.deepEqual(Object.keys(C).sort(), [...LANGS].sort());
  const ref = leaves(C.en).map(([p]) => p);
  for (const lang of LANGS) {
    const got = leaves(C[lang]);
    assert.deepEqual(got.map(([p]) => p), ref, `structure différente en ${lang}`);
    for (const [p, s] of got) assert.ok(s.trim().length > 0, `${lang}${p} est vide`);
  }
});

test("Noël : mêmes montants en yens et mêmes variables {…} dans toutes les langues", () => {
  const ref = Object.fromEntries(leaves(C.en));
  for (const lang of LANGS) {
    for (const [p, s] of leaves(C[lang])) {
      assert.equal(yen(s), yen(ref[p]), `${lang}${p} : montants différents`);
      assert.equal(vars(s), vars(ref[p]), `${lang}${p} : variables différentes`);
    }
  }
});

test("Noël : 5 destinataires, 6 univers, 4 budgets, 3 questions, 3 idées par univers (texte et catalogue alignés)", () => {
  for (const lang of LANGS) {
    assert.equal(C[lang].recipients.length, 5, lang);
    assert.equal(C[lang].universes.length, 6, lang);
    assert.equal(C[lang].budgets.length, 4, lang);
    assert.equal(C[lang].q.length, 3, lang);
    assert.equal(C[lang].ideas.length, XMAS_IDEAS.length, lang);
    C[lang].ideas.forEach((list: unknown[], u: number) => assert.equal(list.length, XMAS_IDEAS[u].length, `${lang} univers ${u}`));
  }
  for (const list of XMAS_IDEAS) for (const idea of list) assert.ok(idea.img || idea.icon, "chaque idée a une image ou une icône");
});

test("Noël : classement des idées par budget (la plus proche d'abord, toujours 3)", () => {
  assert.deepEqual(rankIdeas(2, 3), [2, 0, 1]); // Mode, 40 000 et plus : le sac Coach d'abord
  assert.deepEqual(rankIdeas(2, 0), [1, 0, 2]); // Mode, moins de 5 000 : collabs d'abord
  for (let u = 0; u < 6; u++) for (let b = 0; b < 4; b++) assert.equal(new Set(rankIdeas(u, b)).size, 3);
});

test("Noël : date limite au 5 décembre 23:59 heure de Tokyo, compte à rebours jamais négatif", () => {
  assert.equal(XMAS_DEADLINE, "2026-12-05T14:59:59Z");
  assert.equal(XMAS_CODE, "XMAS500");
  const end = Date.parse(XMAS_DEADLINE);
  assert.deepEqual(timeLeft(end - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000), { done: false, d: 2, h: 3, m: 4, s: 5 });
  assert.equal(timeLeft(end + 1000).done, true);
  assert.equal(timeLeft(end + 1000).d, 0);
});
