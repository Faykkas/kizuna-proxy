import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { photoBgVars, photoVariant } from "./photoVariants.ts";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

test("Photos : chemin de la version légère", () => {
  assert.equal(photoVariant("/photos/shibuya-neon.jpg", 800), "/photos/w/shibuya-neon-800.webp");
  assert.equal(photoVariant("/photos/guide-nike.jpeg", 1600), "/photos/w/guide-nike-1600.webp");
  assert.equal(photoVariant("https://exemple.jp/a.jpg", 800), "https://exemple.jp/a.jpg");
  assert.equal(photoVariant("/logo.svg", 800), "/logo.svg");
  assert.deepEqual(photoBgVars("/photos/a.jpg", "ph"), { "--ph": "url(/photos/w/a-1600.webp)", "--ph-sm": "url(/photos/w/a-800.webp)" });
});

test("Photos : chaque photo a ses versions légères (sinon : node scripts/optimize-photos.mjs)", () => {
  const dir = path.join(PUBLIC, "photos");
  const missing: string[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /\.jpe?g$/i.test(x))) {
    for (const w of [800, 1600] as const) {
      const v = photoVariant(`/photos/${f}`, w);
      if (!fs.existsSync(path.join(PUBLIC, v))) missing.push(v);
    }
  }
  assert.deepEqual(missing, []);
});
