// @ts-nocheck
"use client";

// Accueil : en-tête Akihabara plein écran (avec tes vraies commandes), Noël tant que c'est la saison, 8 catégories en photos,
// bandeau Shibuya avec les 3 étapes, un seul bloc de preuves (chiffres réels, commandes livrées, avis), appel final.
// Le reste (produits phares, liste des boutiques) vit sur /what-we-buy ; les actualités sur /news.

import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import { XmasBand } from "./christmas/XmasParts";
import { HeroPro, CategoryGrid, TokyoBand, PhotoCredits } from "./components/sections/HomePro";
import { StoryProof } from "./components/sections/HomeStory";
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

      <HeroPro t={t} lang={lang} />

      {/* Noël : compte à rebours + quiz cadeau (disparaît seule après le 5 décembre) */}
      <XmasBand lang={lang} />

      <CategoryGrid lang={lang} more />
      <TokyoBand t={t} lang={lang} steps />
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
