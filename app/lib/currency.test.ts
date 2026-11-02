import test from "node:test";
import assert from "node:assert/strict";
import { convertYenText, countryFromLocale, currencyForCountry, formatMoney, hasYen, COUNTRY_TO_CURRENCY } from "./currency.ts";

test("pays → monnaie : cas courants, minuscules acceptées, inconnu → null", () => {
  assert.equal(currencyForCountry("US"), "USD");
  assert.equal(currencyForCountry("fr"), "EUR");
  assert.equal(currencyForCountry("BR"), "BRL");
  assert.equal(currencyForCountry("JP"), "JPY");
  assert.equal(currencyForCountry("ZZ"), null);
  assert.equal(currencyForCountry(null), null);
});

test("la table pays couvre le monde : plus de 240 pays, tous avec un code monnaie à 3 lettres", () => {
  const entries = Object.entries(COUNTRY_TO_CURRENCY);
  assert.ok(entries.length > 240, `seulement ${entries.length} pays`);
  for (const [country, cur] of entries) {
    assert.match(country, /^[A-Z]{2}$/);
    assert.match(cur, /^[A-Z]{3}$/);
  }
});

test("pays déduit de la langue du navigateur", () => {
  assert.equal(countryFromLocale("fr-CA"), "CA");
  assert.equal(countryFromLocale("en_GB"), "GB");
  assert.equal(countryFromLocale("fr"), null);
  assert.equal(countryFromLocale(""), null);
});

test("formatMoney : conversion et symbole, sans centimes pour les grands montants", () => {
  assert.equal(formatMoney(4000, 0.0066, "USD", "en-US"), "$26.40");
  assert.equal(formatMoney(50000, 0.0066, "USD", "en-US"), "$330");
});

test("convertYenText remplace chaque montant en yens et laisse le reste du texte", () => {
  assert.equal(convertYenText("From ¥4,000", 0.0066, "USD", "en-US"), "From $26.40");
  assert.equal(convertYenText("¥5,000 + ¥1,000 per item", 0.0066, "USD", "en-US"), "$33.00 + $6.60 per item");
});

test("convertYenText garde la ponctuation qui suit un montant (« ¥1,000, »)", () => {
  assert.equal(convertYenText("below ¥1,000, we may reduce it. Total ¥2,000.", 0.0066, "USD", "en-US"), "below $6.60, we may reduce it. Total $13.20.");
});

test("convertYenText ne change rien sans monnaie, en JPY ou avec un taux invalide", () => {
  assert.equal(convertYenText("¥4,000", 0.0066, "JPY"), "¥4,000");
  assert.equal(convertYenText("¥4,000", null, "USD"), "¥4,000");
  assert.equal(convertYenText("¥4,000", 0, "USD"), "¥4,000");
  assert.equal(convertYenText("¥4,000", 0.0066, null), "¥4,000");
  assert.equal(convertYenText("Free", 0.0066, "USD"), "Free");
});

test("hasYen", () => {
  assert.equal(hasYen("From ¥4,000"), true);
  assert.equal(hasYen("Free"), false);
  assert.equal(hasYen("10%"), false);
});
