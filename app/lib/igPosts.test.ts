import test from "node:test";
import assert from "node:assert/strict";
import { defaultCaption, normalizeOfficialUrl, parseIgInput, sourceLabel } from "./igPosts.ts";

test("Instagram : lien officiel https nettoyé des paramètres de suivi", () => {
  assert.equal(normalizeOfficialUrl("https://www.pokemoncenter-online.com/news/?utm_source=x&id=3#top"), "https://www.pokemoncenter-online.com/news/?id=3");
  assert.equal(normalizeOfficialUrl("http://example.jp/a"), null);
  assert.equal(normalizeOfficialUrl("pas un lien"), null);
  assert.equal(normalizeOfficialUrl("https://localhost/x"), null);
});

test("Instagram : champs vérifiés et mis en forme", () => {
  const r = parseIgInput({ kind: "popup", title: "  Sanrio   Christmas  pop-up ", dates: "Nov 20 – Dec 25", place: "Shibuya", highlights: "- Limited plush\n• Christmas keychains\n\n", officialUrl: "https://www.sanrio.co.jp/news/", sourceName: "Sanrio" });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.title, "Sanrio Christmas pop-up");
    assert.deepEqual(r.value.highlights, ["Limited plush", "Christmas keychains"]);
    assert.equal(r.value.subtitle, null);
  }
  assert.equal(parseIgInput({ kind: "nope", title: "Titre", officialUrl: "https://a.jp" }).ok, false);
  assert.equal(parseIgInput({ kind: "event", title: "ab", officialUrl: "https://a.jp" }).ok, false);
  assert.equal(parseIgInput({ kind: "event", title: "Titre ok", officialUrl: "http://a.jp" }).ok, false);
  assert.equal(parseIgInput({ kind: "event", title: "Titre ok", officialUrl: "https://a.jp", highlights: "1\n2\n3\n4\n5\n6" }).ok, false);
});

test("Instagram : légende par défaut avec dates, lieu, points, source et hashtags", () => {
  const c = defaultCaption({ kind: "lottery", title: "Ichiban Kuji One Piece", subtitle: null, dates: "From Dec 6", place: "FamilyMart & Lawson", highlights: ["A prize figure"], official_url: "https://1kuji.com/products/x", source_name: null });
  assert.match(c, /^Ichiban Kuji One Piece\n/);
  assert.match(c, /📅 From Dec 6/);
  assert.match(c, /📍 FamilyMart & Lawson/);
  assert.match(c, /• A prize figure/);
  assert.match(c, /Official info: 1kuji\.com \(link in bio → kizunaproxy\.com\/ig\)/);
  assert.match(c, /#ichibankuji/);
  assert.ok(c.length < 2200);
  assert.equal(sourceLabel({ source_name: "Bandai Spirits", official_url: "https://1kuji.com" }), "Bandai Spirits");
});
