// app/hooks/useTranslation.ts
// Auto-detects browser language, fetches DeepL translation, caches in localStorage

"use client";

import { useState, useEffect, useCallback } from "react";

type TranslationState = {
  lang: string;
  displayLang: string;
  translate: (texts: string[], cacheKey: string) => Promise<string[]>;
  isTranslating: boolean;
  isEN: boolean;
};

// Languages DeepL supports
const DEEPL_LANGS = new Set([
  "ar","bg","cs","da","de","el","es","et","fi","fr","hu","id","it","ja",
  "ko","lt","lv","nb","nl","pl","pt","ro","ru","sk","sl","sv","tr","uk","zh"
]);

const LANG_NAMES: Record<string, string> = {
  ar:"العربية", bg:"Български", cs:"Čeština", da:"Dansk", de:"Deutsch",
  el:"Ελληνικά", es:"Español", et:"Eesti", fi:"Suomi", fr:"Français",
  hu:"Magyar", id:"Indonesia", it:"Italiano", ja:"日本語", ko:"한국어",
  lt:"Lietuvių", lv:"Latviešu", nb:"Norsk", nl:"Nederlands", pl:"Polski",
  pt:"Português", ro:"Română", ru:"Русский", sk:"Slovenčina", sl:"Slovenščina",
  sv:"Svenska", tr:"Türkçe", uk:"Українська", zh:"中文", en:"English"
};

export function useAutoTranslation(): TranslationState {
  const [lang, setLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Detect browser language
    const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
    const saved = localStorage.getItem("kizuna-lang");
    const detected = saved || (DEEPL_LANGS.has(browserLang) ? browserLang : "en");
    setLang(detected);
  }, []);

  const translate = useCallback(async (texts: string[], cacheKey: string): Promise<string[]> => {
    if (lang === "en") return texts;
    if (!DEEPL_LANGS.has(lang)) return texts;

    // Check localStorage cache first
    const localKey = `tr_${cacheKey}_${lang}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang: lang, cacheKey }),
      });
      const data = await res.json();
      if (data.translations) {
        // Cache in localStorage for 7 days
        localStorage.setItem(localKey, JSON.stringify(data.translations));
        return data.translations;
      }
    } catch (e) {
      console.warn("Translation failed:", e);
    } finally {
      setIsTranslating(false);
    }
    return texts;
  }, [lang]);

  return {
    lang,
    displayLang: LANG_NAMES[lang] || lang.toUpperCase(),
    translate,
    isTranslating,
    isEN: lang === "en",
  };
}

// Hook specifically for blog pages
export function useBlogTranslation(pageKey: string, originalTexts: Record<string, string>) {
  const { lang, translate, isTranslating, isEN } = useAutoTranslation();
  const [texts, setTexts] = useState(originalTexts);

  useEffect(() => {
    if (isEN) return;
    const keys = Object.keys(originalTexts);
    const values = Object.values(originalTexts);
    translate(values, pageKey).then(translated => {
      const result: Record<string, string> = {};
      keys.forEach((k, i) => { result[k] = translated[i] || originalTexts[k]; });
      setTexts(result);
    });
  }, [lang, pageKey]);

  return { texts, lang, isTranslating };
}
