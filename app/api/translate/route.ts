// app/api/translate/route.ts
// DeepL translation API route with Supabase caching

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEEPL_KEY = process.env.DEEPL_API_KEY!;
const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DeepL supported language codes
const DEEPL_SUPPORTED = new Set([
  "AR","BG","CS","DA","DE","EL","EN","ES","ET","FI","FR","HU","ID","IT","JA",
  "KO","LT","LV","NB","NL","PL","PT","RO","RU","SK","SL","SV","TR","UK","ZH"
]);

function getLangCode(browserLang: string): string | null {
  const base = browserLang.split("-")[0].toUpperCase();
  if (base === "EN") return null; // no need to translate EN
  if (DEEPL_SUPPORTED.has(base)) return base;
  // Languages not supported by DeepL — return null to skip translation
  const unsupported = new Set(["HE","HI","TH","VI","FA","UR","BN","SW","MS"]);
  if (unsupported.has(base)) return null;
  if (DEEPL_SUPPORTED.has(base)) return base;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLang, cacheKey } = await req.json();

    if (!texts?.length || !targetLang) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const deepLang = getLangCode(targetLang);
    if (!deepLang) {
      // Language not supported — return originals
      return NextResponse.json({ translations: texts, lang: targetLang, cached: false });
    }

    // Check cache in Supabase
    if (cacheKey) {
      const { data: cached } = await supabase
        .from("translation_cache")
        .select("translated")
        .eq("cache_key", `${cacheKey}_${deepLang}`)
        .single();

      if (cached?.translated) {
        return NextResponse.json({
          translations: cached.translated,
          lang: deepLang,
          cached: true,
        });
      }
    }

    // Call DeepL
    const res = await fetch(DEEPL_URL, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: "EN",
        target_lang: deepLang,
        tag_handling: "html",
        preserve_formatting: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 502 });
    }

    const data = await res.json();
    const translations = data.translations.map((t: any) => t.text);

    // Save to Supabase cache
    if (cacheKey) {
      await supabase.from("translation_cache").upsert({
        cache_key: `${cacheKey}_${deepLang}`,
        lang: deepLang,
        translated: translations,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ translations, lang: deepLang, cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — check DeepL quota
export async function GET() {
  const res = await fetch("https://api-free.deepl.com/v2/usage", {
    headers: { "Authorization": `DeepL-Auth-Key ${DEEPL_KEY}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
