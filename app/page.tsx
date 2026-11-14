// @ts-nocheck
"use client";

// Accueil « histoire » : 4 blocs alternés image / texte (voir components/sections/HomeStory.tsx), Noël tant que c'est la saison,
// puis l'appel final. Le reste (grille complète des catégories, produits phares, actualités) vit sur /what-we-buy, /news, etc.

import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import { XmasBand } from "./christmas/XmasParts";
import { PhotoCredits } from "./components/sections/HomePro";
import { StoryHero, StoryJapan, StoryTokyo, StoryProof } from "./components/sections/HomeStory";
import { BackToTop, useScrollReveal } from "./components/ui";
import { useLang, useAnnounce } from "./components/useSiteState";

export default function Home() {
  const { lang, t } = useLang();
  const announce = useAnnounce();

  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />

      <StoryHero t={t} lang={lang} />

      {/* Noël : compte à rebours + quiz cadeau (disparaît seule après le 5 décembre) */}
      <XmasBand lang={lang} />

      <StoryJapan lang={lang} />
      <StoryTokyo t={t} lang={lang} />
      <StoryProof t={t} lang={lang} />

      {/* Appel final */}
      <section className="section reveal">
        <div className="wrap">
          <div className="pcg-cta">
            <div className="pcg-cta-left">
              <strong>{t.pricing?.ctaTitle || "Ready to place a request?"}</strong>
              <p>{t.pricing?.ctaDesc || "Describe your item and we'll get back to you with a personalised quote."}</p>
            </div>
            <a href="/request" className="btn btn-gold">{t.nav.request}</a>
            <a href="/pricing" className="btn btn-outline">{t.hero?.ctaSecondary || "See pricing"}</a>
          </div>
        </div>
      </section>

      <PhotoCredits lang={lang} />
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
