// @ts-nocheck
// app/landingHreflang.ts
//
// Builds the hreflang alternate map for a landing-page slug. English lives
// at the un-prefixed URL (the original, already-indexed route); every other
// language gets a /<locale>/<slug> URL. Shared by the English page.tsx
// metadata and the [locale]/[slug] route so the reciprocal links always agree.

import { SUPPORTED_LANGS } from "./translations";

export function landingLanguageAlternates(slug: string): Record<string, string> {
  const map: Record<string, string> = { "x-default": `/${slug}` };
  for (const l of SUPPORTED_LANGS) {
    map[l] = l === "en" ? `/${slug}` : `/${l}/${slug}`;
  }
  return map;
}
