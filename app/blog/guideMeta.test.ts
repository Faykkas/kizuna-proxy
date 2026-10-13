import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GUIDE_KEYS, relatedGuides, parseGuidePath, guideUrl } from "./guideMeta.ts";

test("GUIDE_KEYS correspond exactement aux routes de guideRoutes.ts", () => {
  const src = readFileSync(new URL("./guideRoutes.ts", import.meta.url), "utf8");
  const routes = [...src.matchAll(/^\s*"([a-z0-9-]+)": \{ Component: \w+, key: "(\w+)" \}/gm)].map((m) => [m[1], m[2]]);
  assert.deepEqual(Object.fromEntries(routes), GUIDE_KEYS);
});

test("sitemap : chaque guide y figure", () => {
  const src = readFileSync(new URL("../sitemap.ts", import.meta.url), "utf8");
  for (const slug of Object.keys(GUIDE_KEYS)) assert.ok(src.includes(`"${slug}"`), slug);
});

test("guides liés : 3 guides différents, jamais le guide lui-même", () => {
  for (const slug of Object.keys(GUIDE_KEYS)) {
    const rel = relatedGuides(slug);
    assert.equal(rel.length, 3, slug);
    assert.equal(new Set(rel).size, 3, slug);
    assert.ok(!rel.includes(slug), slug);
    for (const r of rel) assert.ok(GUIDE_KEYS[r], r);
  }
});

test("chemins de guides", () => {
  assert.deepEqual(parseGuidePath("/blog/buy-sanrio-japan"), { slug: "buy-sanrio-japan", locale: null });
  assert.deepEqual(parseGuidePath("/blog/ja/buy-sanrio-japan"), { slug: "buy-sanrio-japan", locale: "ja" });
  assert.equal(parseGuidePath("/blog"), null);
  assert.equal(parseGuidePath("/blog/unknown"), null);
  assert.equal(guideUrl("buy-sanrio-japan", null), "/blog/buy-sanrio-japan");
  assert.equal(guideUrl("buy-sanrio-japan", "fr"), "/blog/fr/buy-sanrio-japan");
});
