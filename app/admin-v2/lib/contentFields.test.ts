// Lancer : node --test app/admin-v2/lib/contentFields.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { parseCategory, parseDateOrEmpty, parseId, parseImageUrl, parseText, parseYen, storagePathFromPublicUrl } from "./contentFields.ts";

test("montants : entiers seulement, vide = 0", () => {
  assert.deepEqual(parseYen("12500", "x"), { ok: true, value: 12500 });
  assert.deepEqual(parseYen("", "x"), { ok: true, value: 0 });
  assert.equal(parseYen("12.5", "x").ok, false);
  assert.equal(parseYen("-3", "x").ok, false);
  assert.equal(parseYen("1e6", "x").ok, false);
  assert.equal(parseYen("999999999999", "x").ok, false);
});

test("images : https seulement (pas de javascript:, data:, http:)", () => {
  assert.equal(parseImageUrl("https://abc.supabase.co/storage/v1/object/public/gallery/1.jpg").ok, true);
  for (const bad of ["javascript:alert(1)", "data:image/png;base64,AAA", "http://x.com/a.jpg", "pas une url", "", "//x.com/a.jpg"])
    assert.equal(parseImageUrl(bad).ok, false, bad);
});

test("texte : obligatoire et borné", () => {
  assert.equal(parseText("  ", "Titre", 10, true).ok, false);
  assert.equal(parseText("x".repeat(11), "Titre", 10).ok, false);
  assert.deepEqual(parseText("  Salut ", "Titre", 10), { ok: true, value: "Salut" });
});

test("catégorie, date, identifiant", () => {
  assert.equal(parseCategory("shipping").ok, true);
  assert.equal(parseCategory("hack").ok, false);
  assert.deepEqual(parseDateOrEmpty("", "d"), { ok: true, value: null });
  assert.equal(parseDateOrEmpty("2026-02-30x", "d").ok, false);
  assert.equal(parseId("3f2504e0-4f89-11d3-9a0c-0305e82c3301").ok, true);
  assert.equal(parseId("1; drop table").ok, false);
});

test("chemin de stockage retrouvé depuis l'adresse publique, sans sortie du bucket", () => {
  assert.equal(storagePathFromPublicUrl("https://x.supabase.co/storage/v1/object/public/gallery/17000.jpg", "gallery"), "17000.jpg");
  assert.equal(storagePathFromPublicUrl("https://x.supabase.co/storage/v1/object/public/gallery/a%20b.jpg?t=1", "gallery"), "a b.jpg");
  assert.equal(storagePathFromPublicUrl("https://autre.com/photo.jpg", "gallery"), null);
  assert.equal(storagePathFromPublicUrl("https://x/gallery/../secret", "gallery"), null);
});

test("lien d'article : facultatif, http(s) seulement", async () => {
  const { parseHttpUrl } = await import("./contentFields.ts");
  assert.deepEqual(parseHttpUrl(""), { ok: true, value: null });
  assert.equal(parseHttpUrl("https://jp.mercari.com/item/m1").ok, true);
  assert.equal(parseHttpUrl("http://example.com/a").ok, true);
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "ftp://x.com/a", "pas une adresse", "mercari.com/item/1"]) assert.equal(parseHttpUrl(bad).ok, false, bad);
});
