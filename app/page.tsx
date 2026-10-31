// @ts-nocheck
"use client";

import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import HeroV3 from "./components/sections/HeroV3";
import HighlightsV3 from "./components/sections/HighlightsV3";
import StepsV3 from "./components/sections/StepsV3";
import SearchWidget from "./components/SearchWidget";
import ExplainerSection from "./components/sections/ExplainerSection";
import NewsPreviewSection from "./components/sections/NewsPreviewSection";
import Carousel from "./components/Carousel";
import { BackToTop, useScrollReveal } from "./components/ui";
import { useLang, useAnnounce, useGallery } from "./components/useSiteState";
import { SLIDES } from "./components/data";

export default function Home() {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  const gallery = useGallery();

  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />

      {/* HERO v3 — la promesse + le formulaire de demande */}
      <HeroV3 t={t} lang={lang} />

      {/* Comment ça marche : 3 étapes */}
      <StepsV3 t={t} />

      {/* À la une : boutique, événements, business */}
      <HighlightsV3 t={t} lang={lang} />

      {/* Qu'est-ce que Kizuna : 4 réponses rapides */}
      <ExplainerSection t={t} />

      {/* REAL PHOTO CAROUSEL — real order photos make the "we're a real
          team, not a template" case right after the hero, before any promo
          content. This is the only photo carousel on the homepage. */}
      <section className="section-sm reveal">
        <div className="wrap">
          <Carousel slides={gallery.length > 0 ? gallery.map(g => ({ src: g.image_url, alt: g.title, title: g.title, sub: g.subtitle || "" })) : SLIDES} />
        </div>
      </section>

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
