// Lancer : node --test app/pay/describeItem.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { describeItem } from "./describeItem.ts";
import { PAY_COPY, fill } from "./payTranslations.ts";

test("adresses d'articles : titre lisible + lien conservé", () => {
  assert.deepEqual(describeItem("https://jp.mercari.com/item/m12345678901"), { title: "Mercari · m12345678901", href: "https://jp.mercari.com/item/m12345678901" });
  assert.equal(describeItem("https://amnibus.com/products/detail/120558").title, "Amnibus · 120558");
  assert.equal(describeItem("https://item.fril.jp/a6141d07").title, "Rakuma · a6141d07");
  assert.equal(describeItem("https://www.unknown-shop.co.jp/").title, "Unknown-shop");
});

test("extension de page retirée de l'identifiant", () => {
  assert.equal(describeItem("https://www.coach.com/products/x/CCW96.html").title, "Coach · CCW96");
});

test("identifiant trop long ou illisible : seulement le nom du site", () => {
  assert.equal(describeItem("https://jp.mercari.com/item/" + "x".repeat(40)).title, "Mercari");
  assert.equal(describeItem("https://example.com/a%20b%2Fc").title, "Example");
});

test("texte libre : affiché tel quel, sans lien", () => {
  assert.deepEqual(describeItem("Supreme Puppies Tee + FDNY Box"), { title: "Supreme Puppies Tee + FDNY Box", href: null });
  assert.deepEqual(describeItem(""), { title: "—", href: null });
  assert.deepEqual(describeItem(null), { title: "—", href: null });
});

test("jamais de lien dangereux : javascript:/data: ne deviennent pas des liens", () => {
  assert.equal(describeItem("javascript:alert(1)").href, null);
  assert.equal(describeItem("data:text/html,<script>").href, null);
});

test("les 12 langues ont exactement les mêmes clés que l'anglais, et aucune valeur vide", () => {
  const keys = Object.keys(PAY_COPY.en).sort();
  assert.equal(Object.keys(PAY_COPY).length, 12);
  for (const [lang, copy] of Object.entries(PAY_COPY)) {
    assert.deepEqual(Object.keys(copy).sort(), keys, lang);
    for (const [k, v] of Object.entries(copy)) assert.ok(String(v).trim().length > 0, `${lang}.${k} est vide`);
  }
});

test("{name} est présent là où il faut et remplacé", () => {
  for (const [lang, copy] of Object.entries(PAY_COPY)) assert.ok(copy.requestFor.includes("{name}"), lang);
  assert.equal(fill("Payment request for {name}", { name: "Anna" }), "Payment request for Anna");
});

test("le point de l'extension est littéral : un identifiant comme « xhtml » reste intact", () => {
  assert.equal(describeItem("https://example.com/item/xhtml").title, "Example · xhtml");
});
