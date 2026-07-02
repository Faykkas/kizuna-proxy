#!/usr/bin/env node
// ─── MIGRATE BLOGS TO DEEPL AUTO-TRANSLATION ─────────────────────────────────
// Converts existing static blog TSX files to auto-translating versions
// Run: node migrate-blogs-to-deepl.js (from project root)

const fs = require("fs");
const path = require("path");

const ARTICLES = [
  { slug: "how-to-buy-from-mercari-japan",    key: "blog_mercari" },
  { slug: "yahoo-auctions-japan-guide",        key: "blog_yahoo" },
  { slug: "best-pokemon-cards-japan-2026",     key: "blog_pokemon" },
  { slug: "pokemon-center-tokyo-exclusives",   key: "blog_pkm_center" },
  { slug: "supreme-japan-drops-guide",         key: "blog_supreme" },
  { slug: "nike-japan-exclusives-guide",       key: "blog_nike" },
  { slug: "anime-figures-japan-guide",         key: "blog_anime" },
  { slug: "japanese-trading-cards-guide-2026", key: "blog_tcg" },
  { slug: "japan-shipping-guide-2026",         key: "blog_shipping" },
  { slug: "best-items-mercari-japan-2026",     key: "blog_mercari_tips" },
  { slug: "nintendo-japan-exclusives-guide",   key: "blog_nintendo" },
  { slug: "japanese-streetwear-guide",         key: "blog_streetwear" },
];

const DEEPL_LANGS = `new Set(["ar","bg","cs","da","de","el","es","et","fi","fr","hu","id","it","ja","ko","lt","lv","nb","nl","pl","pt","ro","ru","sk","sl","sv","tr","uk","zh"])`;

function wrapWithTranslation(content, cacheKey) {
  // Extract all string content from the TSX
  const strings = [];
  const placeholders = [];
  let counter = 0;

  // Find all JSX text content between tags
  let processed = content;

  // We'll inject the translation hook at the top of the component
  const translationHeader = `
// ─── AUTO-TRANSLATION (DeepL) ────────────────────────────────────────────────
"use client";
import { useState, useEffect } from "react";
const CACHE_KEY = "${cacheKey}";
const DEEPL_LANGS = ${DEEPL_LANGS};

function useDeepLTranslation(original: string) {
  const [text, setText] = useState(original);
  useEffect(() => {
    const lang = (localStorage.getItem("kizuna-lang") || navigator.language || "en").split("-")[0].toLowerCase();
    if (lang === "en" || !DEEPL_LANGS.has(lang)) return;
    const k = \`tr_\${CACHE_KEY}_\${lang}_\${btoa(original.slice(0,20))}\`;
    const cached = localStorage.getItem(k);
    if (cached) { setText(cached); return; }
    fetch("/api/translate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ texts:[original], targetLang:lang, cacheKey:k })
    }).then(r=>r.json()).then(d=>{
      if(d.translations?.[0]) { setText(d.translations[0]); localStorage.setItem(k,d.translations[0]); }
    }).catch(()=>{});
  }, []);
  return text;
}

function T({ children }: { children: string }) {
  const translated = useDeepLTranslation(children);
  return <>{translated}</>;
}
// ─────────────────────────────────────────────────────────────────────────────
`;

  // Remove existing "use client" if present, we'll add it back
  processed = processed.replace(/^"use client";\n?/m, "");
  // Remove existing imports of useState/useEffect if present
  processed = processed.replace(/import \{[^}]*useState[^}]*\}[^;]+;\n?/g, "");

  // Wrap JSX text nodes with <T> component
  // Replace >text< with ><T>text</T><  (only for text nodes with real words)
  processed = processed.replace(
    />([^<>{}\n]{15,})</g,
    (match, text) => {
      const trimmed = text.trim();
      if (!trimmed || !/[a-zA-Z]{4,}/.test(trimmed)) return match;
      if (trimmed.startsWith("//") || trimmed.startsWith("/*")) return match;
      return `><T>${trimmed}</T><`;
    }
  );

  // Add translation header after metadata export
  if (processed.includes("export const metadata")) {
    processed = processed.replace(
      /(export const metadata[\s\S]+?;\n)/,
      `$1${translationHeader}`
    );
  } else {
    processed = translationHeader + processed;
  }

  return processed;
}

let migrated = 0;
let skipped  = 0;

for (const { slug, key } of ARTICLES) {
  const filePath = path.join("app", "blog", slug, "page.tsx");

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${slug} — not found`);
    skipped++;
    continue;
  }

  const original = fs.readFileSync(filePath, "utf8");

  // Skip if already migrated
  if (original.includes("useDeepLTranslation")) {
    console.log(`✓  ${slug} — already migrated`);
    skipped++;
    continue;
  }

  // Backup original
  fs.writeFileSync(filePath + ".bak", original);

  const migrated_content = wrapWithTranslation(original, key);
  fs.writeFileSync(filePath, migrated_content);

  console.log(`✅ ${slug}`);
  migrated++;
}

console.log(`\nDone: ${migrated} migrated, ${skipped} skipped`);
console.log(`\nNext:`);
console.log(`  git add .`);
console.log(`  git commit -m "migrate blog pages to DeepL auto-translation"`);
console.log(`  git push`);
