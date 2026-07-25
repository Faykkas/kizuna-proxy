// @ts-nocheck
"use client";
// app/lib/language.tsx
//
// Each visitor gets their own language automatically:
//   1. A signed-in customer's saved preference (user_metadata.language)
//   2. Whatever they picked before, on this device (localStorage)
//   3. Their browser's own language, detected on first visit
//   4. English, if none of the above match a language we support
//
// Signed-in customers are saved to their account (via supabase.auth.updateUser,
// which every user is always allowed to do for their own metadata — no extra
// database table or RLS policy needed) so the choice follows them across
// devices. Anonymous visitors just keep it in this browser.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import { translations, SUPPORTED_LANGS, detectLang } from "../translations";

const STORAGE_KEY = "kizuna-lang";

const LanguageContext = createContext(null);

function browserLangs() {
  if (typeof navigator === "undefined") return [];
  return navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language];
}

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState("en");
  const [ready, setReady] = useState(false);

  // Resolve the language once we know whether someone is signed in — a
  // saved account preference always wins over what this browser guessed.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initial = detectLang([
      user?.user_metadata?.language,
      saved,
      ...browserLangs(),
    ]);
    setLangState(initial);
    setReady(true);
  }, [user?.user_metadata?.language]);

  // Reflect the active language on <html> — screen readers rely on it, and
  // it's what the CJK font fallback in globals.css keys off.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(async (code) => {
    if (!SUPPORTED_LANGS.includes(code)) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
    if (user) {
      await supabase.auth.updateUser({ data: { language: code } });
    }
  }, [user]);

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ready, supported: SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
