// @ts-nocheck
"use client";

import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import { HeroPro, StoresStrip, CategoryGrid, DeliveredGrid, ReviewsHome, TrustBand } from "./components/sections/HomePro";
import HighlightsV3 from "./components/sections/HighlightsV3";
import StepsV3 from "./components/sections/StepsV3";
import SearchWidget from "./components/SearchWidget";
import ExplainerSection from "./components/sections/ExplainerSection";
import NewsPreviewSection from "./components/sections/NewsPreviewSection";
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

      {/* HERO v3 — la promesse + le formulaire de demande */}
      <HeroPro t={t} lang={lang} />

      {/* Boutiques, catégories en images */}
      <StoresStrip lang={lang} />
      <CategoryGrid lang={lang} />

      {/* Comment ça marche : 3 étapes */}
      <StepsV3 t={t} />

      {/* À la une : boutique, événements, business */}
      <HighlightsV3 t={t} lang={lang} />

      {/* Vraies commandes livrées, avis Reddit, arguments de confiance, puis les 4 réponses rapides */}
      <DeliveredGrid lang={lang} />
      <ReviewsHome t={t} lang={lang} />
      <TrustBand lang={lang} />
      <ExplainerSection t={t} />

      {/* SEARCH WIDGET */}
      <section className="search-widget-section">
        <div className="wrap">
          <SearchWidget lang={lang} t={t} />
        </div>
      </section>

      {/* NEWS */}
      <NewsPreviewSection t={t} />

      {/* CTA FINAL */}
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

      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
