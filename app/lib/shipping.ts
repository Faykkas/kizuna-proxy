// @ts-nocheck
// app/lib/shipping.ts
//
// EMS rates, straight from Japan Post's official schedule.
// Source: https://www.post.japanpost.jp/send/oversea/charge/list-ems/all_en.html
//
// These change once or twice a year. When they do, update RATES below —
// the whole calculator reads from it.

export const RATES_UPDATED = "2026-07";

/**
 * Japan Post splits the world into five zones. The zone decides the price;
 * the weight decides which row of the table applies.
 */
export const ZONES = {
  1: { name: "Zone 1", desc: "China, South Korea, Taiwan" },
  2: { name: "Zone 2", desc: "Rest of Asia" },
  3: { name: "Zone 3", desc: "Oceania, Canada, Mexico, Middle East, Europe" },
  4: { name: "Zone 4", desc: "United States (incl. Guam and territories)" },
  5: { name: "Zone 5", desc: "Central & South America, Africa" },
};

/**
 * Weight brackets in grams, with the price for each zone.
 * EMS bills by bracket, not by exact weight: a 520 g parcel costs the same
 * as a 600 g one. Rounding up is the correct behaviour, not a bug.
 */
export const RATES = [
  { g:   500, z: [1450,  1900,  3150,  3900,  3600] },
  { g:   600, z: [1600,  2150,  3400,  4180,  3900] },
  { g:   700, z: [1750,  2400,  3650,  4460,  4200] },
  { g:   800, z: [1900,  2650,  3900,  4740,  4500] },
  { g:   900, z: [2050,  2900,  4150,  5020,  4800] },
  { g:  1000, z: [2200,  3150,  4400,  5300,  5100] },
  { g:  1250, z: [2500,  3500,  5000,  5990,  5850] },
  { g:  1500, z: [2800,  3850,  5550,  6600,  6600] },
  { g:  1750, z: [3100,  4200,  6150,  7290,  7350] },
  { g:  2000, z: [3400,  4550,  6700,  7900,  8100] },
  { g:  2500, z: [3900,  5150,  7750,  9100,  9600] },
  { g:  3000, z: [4400,  5750,  8800, 10300, 11100] },
  { g:  3500, z: [4900,  6350,  9850, 11500, 12600] },
  { g:  4000, z: [5400,  6950, 10900, 12700, 14100] },
  { g:  4500, z: [5900,  7550, 11950, 13900, 15600] },
  { g:  5000, z: [6400,  8150, 13000, 15100, 17100] },
  { g:  5500, z: [6900,  8750, 14050, 16300, 18600] },
  { g:  6000, z: [7400,  9350, 15100, 17500, 20100] },
  { g:  7000, z: [8200, 10350, 17200, 19900, 22500] },
  { g:  8000, z: [9000, 11350, 19300, 22300, 24900] },
  { g:  9000, z: [9800, 12350, 21400, 24700, 27300] },
  { g: 10000, z: [10600, 13350, 23500, 27100, 29700] },
  { g: 11000, z: [11400, 14350, 25600, 29500, 32100] },
  { g: 12000, z: [12200, 15350, 27700, 31900, 34500] },
  { g: 13000, z: [13000, 16350, 29800, 34300, 36900] },
  { g: 14000, z: [13800, 17350, 31900, 36700, 39300] },
  { g: 15000, z: [14600, 18350, 34000, 39100, 41700] },
  { g: 16000, z: [15400, 19350, 36100, 41500, 44100] },
  { g: 17000, z: [16200, 20350, 38200, 43900, 46500] },
  { g: 18000, z: [17000, 21350, 40300, 46300, 48900] },
  { g: 19000, z: [17800, 22350, 42400, 48700, 51300] },
  { g: 20000, z: [18600, 23350, 44500, 51100, 53700] },
  { g: 21000, z: [19400, 24350, 46600, 53500, 56100] },
  { g: 22000, z: [20200, 25350, 48700, 55900, 58500] },
  { g: 23000, z: [21000, 26350, 50800, 58300, 60900] },
  { g: 24000, z: [21800, 27350, 52900, 60700, 63300] },
  { g: 25000, z: [22600, 28350, 55000, 63100, 65700] },
  { g: 26000, z: [23400, 29350, 57100, 65500, 68100] },
  { g: 27000, z: [24200, 30350, 59200, 67900, 70500] },
  { g: 28000, z: [25000, 31350, 61300, 70300, 72900] },
  { g: 29000, z: [25800, 32350, 63400, 72700, 75300] },
  { g: 30000, z: [26600, 33350, 65500, 75100, 77700] },
];

/** The countries customers actually ask about, grouped by zone */
export const COUNTRIES = [
  // Zone 4 — its own case, US duties apply on everything
  { code: "US", name: "United States", zone: 4, flag: "🇺🇸" },

  // Zone 3
  { code: "FR", name: "France",         zone: 3, flag: "🇫🇷" },
  { code: "DE", name: "Germany",        zone: 3, flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", zone: 3, flag: "🇬🇧" },
  { code: "IT", name: "Italy",          zone: 3, flag: "🇮🇹" },
  { code: "ES", name: "Spain",          zone: 3, flag: "🇪🇸" },
  { code: "NL", name: "Netherlands",    zone: 3, flag: "🇳🇱" },
  { code: "BE", name: "Belgium",        zone: 3, flag: "🇧🇪" },
  { code: "CH", name: "Switzerland",    zone: 3, flag: "🇨🇭" },
  { code: "SE", name: "Sweden",         zone: 3, flag: "🇸🇪" },
  { code: "PL", name: "Poland",         zone: 3, flag: "🇵🇱" },
  { code: "GR", name: "Greece",         zone: 3, flag: "🇬🇷" },
  { code: "PT", name: "Portugal",       zone: 3, flag: "🇵🇹" },
  { code: "AT", name: "Austria",        zone: 3, flag: "🇦🇹" },
  { code: "IE", name: "Ireland",        zone: 3, flag: "🇮🇪" },
  { code: "DK", name: "Denmark",        zone: 3, flag: "🇩🇰" },
  { code: "NO", name: "Norway",         zone: 3, flag: "🇳🇴" },
  { code: "FI", name: "Finland",        zone: 3, flag: "🇫🇮" },
  { code: "CZ", name: "Czechia",        zone: 3, flag: "🇨🇿" },
  { code: "CA", name: "Canada",         zone: 3, flag: "🇨🇦" },
  { code: "MX", name: "Mexico",         zone: 3, flag: "🇲🇽" },
  { code: "AU", name: "Australia",      zone: 3, flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand",    zone: 3, flag: "🇳🇿" },
  { code: "AE", name: "UAE",            zone: 3, flag: "🇦🇪" },
  { code: "IL", name: "Israel",         zone: 3, flag: "🇮🇱" },

  // Zone 2
  { code: "SG", name: "Singapore",   zone: 2, flag: "🇸🇬" },
  { code: "MY", name: "Malaysia",    zone: 2, flag: "🇲🇾" },
  { code: "TH", name: "Thailand",    zone: 2, flag: "🇹🇭" },
  { code: "ID", name: "Indonesia",   zone: 2, flag: "🇮🇩" },
  { code: "PH", name: "Philippines", zone: 2, flag: "🇵🇭" },
  { code: "VN", name: "Vietnam",     zone: 2, flag: "🇻🇳" },
  { code: "IN", name: "India",       zone: 2, flag: "🇮🇳" },

  // Zone 1
  { code: "KR", name: "South Korea", zone: 1, flag: "🇰🇷" },
  { code: "TW", name: "Taiwan",      zone: 1, flag: "🇹🇼" },
  { code: "CN", name: "China",       zone: 1, flag: "🇨🇳" },
  { code: "HK", name: "Hong Kong",   zone: 1, flag: "🇭🇰" },

  // Zone 5
  { code: "BR", name: "Brazil",       zone: 5, flag: "🇧🇷" },
  { code: "AR", name: "Argentina",    zone: 5, flag: "🇦🇷" },
  { code: "CL", name: "Chile",        zone: 5, flag: "🇨🇱" },
  { code: "ZA", name: "South Africa", zone: 5, flag: "🇿🇦" },
];

/**
 * Find the EMS price. Returns null above 30 kg, which is the EMS limit —
 * heavier parcels have to be split or sent by sea.
 */
export function emsPrice(grams, zone) {
  if (!grams || !zone) return null;
  const row = RATES.find(r => grams <= r.g);
  if (!row) return null;
  return { price: row.z[zone - 1], bracket: row.g };
}

/** Typical weights, so people who have no idea can still get an estimate */
export const WEIGHT_EXAMPLES = [
  { label: "A few cards or a keychain",     g: 200 },
  { label: "One manga volume",              g: 300 },
  { label: "A t-shirt",                     g: 400 },
  { label: "A booster box",                 g: 700 },
  { label: "A small figure",                g: 900 },
  { label: "A pair of sneakers",            g: 1400 },
  { label: "A large scale figure",          g: 2500 },
  { label: "A hoodie + a few items",        g: 2000 },
];

/**
 * Customs rules, by destination.
 *
 * The US case changed in a way that catches everyone out: the $800 de minimis
 * exemption was suspended on 29 August 2025 (Executive Order 14324). There is
 * no longer any threshold — every parcel is dutiable, whatever its value.
 * The old "under $800 is free" advice is out of date and repeating it would
 * leave customers with an unexpected bill.
 */
export const CUSTOMS = {
  US: {
    label: "United States",
    threshold: null,
    summary: "Every parcel is now dutiable, whatever its value.",
    detail:
      "The $800 duty-free allowance ended on 29 August 2025. Since then, all " +
      "parcels entering the US are subject to import duty regardless of value. " +
      "The rate depends on what the item is and where it was made.",
    kizuna:
      "We handle this for you through Zonos: duties are calculated and prepaid " +
      "before the parcel ships, so it clears customs without you being asked " +
      "for anything on delivery.",
  },
  EU: {
    label: "European Union",
    threshold: 150,
    summary: "VAT from the first euro. Customs duty above €150.",
    detail:
      "VAT applies to every parcel — there is no exempt threshold. The rate is " +
      "your country's (20% in France, 19% in Germany, 22% in Italy). Customs " +
      "duty is added on top when the goods are worth more than €150. Carriers " +
      "usually charge a handling fee of €10–20 on top.",
    kizuna: null,
  },
  GB: {
    label: "United Kingdom",
    threshold: 135,
    summary: "VAT from the first pound. Customs duty above £135.",
    detail:
      "VAT at 20% applies to all parcels. Customs duty is added above £135. " +
      "Royal Mail charges an £8 handling fee.",
    kizuna: null,
  },
  CA: {
    label: "Canada",
    threshold: 20,
    summary: "Taxes above CAD 20.",
    detail:
      "GST/HST applies above CAD 20, and customs duty above CAD 150. Canada " +
      "Post charges a CAD 9.95 handling fee.",
    kizuna: null,
  },
  AU: {
    label: "Australia",
    threshold: 1000,
    summary: "GST from the first dollar, duty above AUD 1,000.",
    detail:
      "GST at 10% applies to all imports. Customs duty is added above AUD 1,000.",
    kizuna: null,
  },
  DEFAULT: {
    label: "Other countries",
    threshold: null,
    summary: "Rules vary — check your local customs.",
    detail:
      "Most countries apply VAT and duty above a threshold that varies widely. " +
      "We declare the real value on every parcel, as required by law.",
    kizuna: null,
  },
};

const EU_CODES = ["FR","DE","IT","ES","NL","BE","SE","PL","GR","PT","AT","IE","DK","FI","CZ"];

export function customsFor(code) {
  if (code === "US") return CUSTOMS.US;
  if (code === "GB") return CUSTOMS.GB;
  if (code === "CA") return CUSTOMS.CA;
  if (code === "AU") return CUSTOMS.AU;
  if (EU_CODES.includes(code)) return CUSTOMS.EU;
  return CUSTOMS.DEFAULT;
}

/** Rough delivery windows, from Japan Post's published figures */
export const DELIVERY_DAYS = {
  1: "2–4 days",
  2: "3–5 days",
  3: "4–8 days",
  4: "4–7 days",
  5: "6–12 days",
};
