// @ts-nocheck
// app/blog/hreflang.ts
//
// Builds the hreflang alternate map for a blog guide slug. English lives at
// the un-prefixed URL (the original, already-indexed route); every other
// language gets a /blog/<locale>/<slug> URL. Shared by the English page.tsx
// metadata and the [locale]/[slug] route so the reciprocal links always agree.

import { SUPPORTED_LANGS } from "../translations";

export function blogLanguageAlternates(slug: string): Record<string, string> {
  const map: Record<string, string> = { "x-default": `/blog/${slug}` };
  for (const l of SUPPORTED_LANGS) {
    map[l] = l === "en" ? `/blog/${slug}` : `/blog/${l}/${slug}`;
  }
  return map;
}
