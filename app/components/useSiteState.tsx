// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { copy } from "../translations";
import { supabase } from "../lib/supabase";

/**
 * Conservé pour compatibilité : le site est monolingue, `t` renvoie
 * toujours les textes anglais.
 */
export function useLang() {
  return { lang: "en", setLang: () => {}, t: copy };
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
