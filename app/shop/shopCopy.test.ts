import test from "node:test";
import assert from "node:assert/strict";
import { SHOP_COPY, filterAndSort } from "./shopCopy.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];

function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, `${path}.${k}`));
  return [];
}

test("Boutique : les 12 langues, même structure, aucun texte vide, {n} partout", () => {
  assert.deepEqual(Object.keys(SHOP_COPY).sort(), [...LANGS].sort());
  const ref = leaves(SHOP_COPY.en).map(([p]) => p);
  for (const lang of LANGS) {
    const got = leaves(SHOP_COPY[lang]);
    assert.deepEqual(got.map(([p]) => p), ref, `structure différente en ${lang}`);
    for (const [p, s] of got) assert.ok(s.trim().length > 0, `${lang}${p} est vide`);
    assert.ok(SHOP_COPY[lang].inStock.includes("{n}"), `${lang} : {n} manquant dans inStock`);
  }
});

const items = [
  { id: "a", name: "Hobonichi Suica Penguin pouch", image_url: "x", price_jpy: 5280, fee_jpy: 6000, sort_order: 2, created_at: "2026-11-02T00:00:00Z" },
  { id: "b", name: "Pokémon + STARBUCKS ボトル フシギダネ", image_url: "x", price_jpy: 6600, fee_jpy: 13000, sort_order: 1, created_at: "2026-11-01T00:00:00Z" },
  { id: "c", name: "Hobonichi Weeks", image_url: "x", price_jpy: 3520, fee_jpy: 6000, sort_order: 3, created_at: "2026-11-03T00:00:00Z" },
];

test("Boutique : tri par sélection, prix total et nouveautés", () => {
  assert.deepEqual(filterAndSort(items, "", "featured").map((i) => i.id), ["b", "a", "c"]);
  assert.deepEqual(filterAndSort(items, "", "priceAsc").map((i) => i.id), ["c", "a", "b"]);
  assert.deepEqual(filterAndSort(items, "", "priceDesc").map((i) => i.id), ["b", "a", "c"]);
  assert.deepEqual(filterAndSort(items, "", "newest").map((i) => i.id), ["c", "a", "b"]);
});

test("Boutique : la recherche ignore la casse, accepte plusieurs mots et le japonais", () => {
  assert.deepEqual(filterAndSort(items, "hobonichi", "featured").map((i) => i.id), ["a", "c"]);
  assert.deepEqual(filterAndSort(items, "  PENGUIN  pouch ", "featured").map((i) => i.id), ["a"]);
  assert.deepEqual(filterAndSort(items, "フシギダネ", "featured").map((i) => i.id), ["b"]);
  assert.deepEqual(filterAndSort(items, "zzz", "featured"), []);
});
