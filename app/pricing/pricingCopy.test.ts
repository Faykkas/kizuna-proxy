import test from "node:test";
import assert from "node:assert/strict";
import { PRICING_COPY } from "./pricingCopy.ts";
import { RESERVATION_COPY } from "../reservation-assistance/reservationCopy.ts";

const LANGS = ["en", "fr", "ja", "es", "it", "de", "ko", "zh", "pt", "id", "vi", "nl"];

// Liste « chemin → texte » de toutes les feuilles ; les tableaux comptent leur longueur dans le chemin.
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, `${path}.${k}`));
  return [];
}
// Prix en yens et pourcentages : identiques partout (les mots de quantité comme « 1 » ou « 2–3 » varient avec la langue).
const nums = (s: string) => (s.match(/¥\s?(?:\d{1,3}(?:,\d{3})+|\d+)|\d+%/g) || []).map((n) => n.replace(/\s/g, "")).sort().join("|");

for (const [name, copy] of [["Tarifs", PRICING_COPY], ["Réservation", RESERVATION_COPY]] as [string, Record<string, any>][]) {
  test(`${name} : les 12 langues existent`, () => {
    assert.deepEqual(Object.keys(copy).sort(), [...LANGS].sort());
  });

  test(`${name} : chaque langue a exactement la même structure que l'anglais (mêmes champs, mêmes longueurs de listes), sans texte vide`, () => {
    const ref = leaves(copy.en).map(([p]) => p);
    for (const lang of LANGS) {
      const got = leaves(copy[lang]);
      assert.deepEqual(got.map(([p]) => p), ref, `structure différente en ${lang}`);
      // « from » et « sub » peuvent être vides : le japonais met « 月額 … 〜 » directement dans le prix.
      for (const [p, s] of got) if (!/\.(from|sub)$/.test(p)) assert.ok(s.trim().length > 0, `${lang}${p} est vide`);
    }
  });

  test(`${name} : les prix et chiffres sont identiques dans toutes les langues`, () => {
    const ref = Object.fromEntries(leaves(copy.en));
    for (const lang of LANGS) {
      for (const [p, s] of leaves(copy[lang])) {
        assert.equal(nums(s), nums(ref[p]), `${lang}${p} : « ${s} » n'a pas les mêmes chiffres que l'anglais « ${ref[p]} »`);
      }
    }
  });
}

test("Tarifs : les prix du cahier des charges sont bien présents", () => {
  const all = leaves(PRICING_COPY.en).map(([, s]) => s).join("\n");
  for (const price of ["¥2,500", "¥500", "¥1,000", "¥5,000", "¥3,000", "¥500", "¥1,500", "10%", "50%", "¥50,000", "¥55,000"]) {
    assert.ok(all.includes(price), `${price} manque`);
  }
});

test("Tarifs : les 3 conditions (billet en plus, PayPal Biens et services, adresse du client) sont dans chaque langue", () => {
  for (const lang of LANGS) {
    assert.equal((PRICING_COPY as Record<string, any>)[lang].policy.items.length, 3);
    assert.ok((PRICING_COPY as Record<string, any>)[lang].faq.items.length >= 13);
  }
});

test("Tarifs : commande en ligne à ¥2,500 par article, sans palier 2–3 articles, gros volume ¥500 avec minimum 10 articles par mois", () => {
  for (const lang of LANGS) {
    const c = (PRICING_COPY as Record<string, any>)[lang];
    const std = c.online.standard;
    assert.equal(std.rows.length, 2, `${lang} : il ne doit rester que 2 lignes de tarif en ligne`);
    assert.match(std.price, /¥2,500/);
    assert.match(std.rows[0][1], /¥2,500/);
    assert.match(std.rows[1][1], /¥500(?!,)/);
    assert.match(std.rows[1][0], /10/, `${lang} : le minimum de 10 articles par mois doit être indiqué`);
    assert.match(std.text, /10/);
    assert.match(c.overview.rows[1][0], /10/);
    assert.ok(!/4,000|2,000/.test(JSON.stringify(c.online.standard) + JSON.stringify(c.overview.rows.slice(0, 2))), `${lang} : ancien prix encore présent`);
  }
});

test("Tarifs : aucun frais d'emballage, et plus de « demandes spéciales discutées au cas par cas »", () => {
  const en = (PRICING_COPY as Record<string, any>).en;
  assert.match(en.packaging.text, /do not charge any packaging fee/);
  assert.match(en.faq.items[0][1], /do not charge any packaging fee/);
  assert.ok(!/special packaging/i.test(JSON.stringify(en)));
});
