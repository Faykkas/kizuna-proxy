// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { translations, detectLang } from "../translations";
import { supabase } from "../lib/supabase";

/**
 * Hook partagé : langue courante + traductions.
 * Utilisé par toutes les pages pour éviter de dupliquer la logique.
 */
export function useLang() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-lang");
    setLang(saved || detectLang());
  }, []);

  const t = (translations as any)[lang] || (translations as any).en;
  return { lang, setLang, t };
}

/** Bannière d'annonce depuis Supabase */
export function useAnnounce() {
  const [announce, setAnnounce] = useState(null);
  useEffect(() => {
    supabase.from("announce").select("*").limit(1).single().then(({ data }) => {
      if (data) setAnnounce(data);
    });
  }, []);
  return announce;
}

/** Galerie depuis Supabase (fallback sur SLIDES si vide) */
export function useGallery() {
  const [gallery, setGallery] = useState([]);
  useEffect(() => {
    supabase.from("gallery").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setGallery(data);
    });
  }, []);
  return gallery;
}
