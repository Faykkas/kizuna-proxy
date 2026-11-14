// @ts-nocheck
"use client";

// Page « tout ce qu'on achète » : la grille complète des catégories, le bandeau Tokyo et la mosaïque des produits phares
// (sortis de l'accueil pour l'alléger). Mêmes composants et mêmes textes (homeCopy.ts, 12 langues).

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import { StoresStrip, CategoryGrid, TokyoBand, JapanPicks, PhotoCredits } from "../components/sections/HomePro";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function WhatWeBuyClient() {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();
  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <CategoryGrid lang={lang} />
        <JapanPicks lang={lang} />
        <TokyoBand t={t} lang={lang} />
        <StoresStrip lang={lang} />
      </main>
      <PhotoCredits lang={lang} />
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
