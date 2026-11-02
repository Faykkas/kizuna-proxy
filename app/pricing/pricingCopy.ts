// @ts-nocheck
// Textes de la page Tarifs, dans les 12 langues du site (repli sur l'anglais).

import { en, fr, ja, es } from "./pricingCopyA.ts";
import { it, de, ko, zh } from "./pricingCopyB.ts";
import { pt, id, vi, nl } from "./pricingCopyC.ts";
import { EXTRA } from "./pricingExtra.ts";

const BASE = { en, fr, ja, es, it, de, ko, zh, pt, id, vi, nl };

export const PRICING_COPY = Object.fromEntries(
  Object.entries(BASE).map(([lang, base]) => {
    const x = EXTRA[lang];
    return [lang, { ...base, cur: x.cur, policy: x.policy, faq: { ...base.faq, items: [...base.faq.items, ...x.faq] } }];
  })
);

export function pricingCopy(lang: string) {
  return PRICING_COPY[lang] || PRICING_COPY.en;
}
