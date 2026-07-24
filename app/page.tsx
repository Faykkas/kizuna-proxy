// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import HeroSection from "./components/sections/HeroSection";
import SearchWidget from "./components/SearchWidget";
import ServicesSection from "./components/sections/ServicesSection";
import GallerySection from "./components/sections/GallerySection";
import { BackToTop, EventsFloat, useScrollReveal } from "./components/ui";
import useSakuraCanvas from "./components/useSakuraCanvas";
import { useLang, useAnnounce, useGallery } from "./components/useSiteState";
import { REAL_REVIEWS } from "./components/data";

const NewsSection = dynamic(() => import("./news"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"var(--warm)"}}>Loading…</div>
});

export default function Home() {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  const gallery = useGallery();

  useScrollReveal();
  useSakuraCanvas();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />

      <HeroSection t={t} />

      {/* SEARCH WIDGET */}
      <section className="search-widget-section">
        <div className="wrap">
          <SearchWidget lang={lang} t={t} />
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="section-sm reveal">
        <div className="wrap">
          <div className="sec-head" style={{marginBottom:"2rem"}}>
            <p className="sec-label">{t.news?.label || "Latest news"}</p>
            <h2>{t.news?.title || "Updates &"} <em>{t.news?.titleEm || "announcements"}</em></h2>
          </div>
          <NewsSection lang={lang} />
        </div>
      </section>

      {/* SERVICES — aperçu, détail sur /services */}
      <ServicesSection t={t} />
      <div className="wrap" style={{textAlign:"center",marginTop:"-1.5rem",marginBottom:"3rem"}}>
        <a href="/services" className="btn btn-outline">
          {t.whatWeBuy?.seeAll || "See all services"} →
        </a>
      </div>

      {/* PREUVE SOCIALE — 3 avis, le reste sur /reviews */}
      <section className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.reviews?.label}</p>
            <h2>{t.reviews?.title} <em>{t.reviews?.titleEm}</em></h2>
          </div>
          <div className="reviews-header">
            <div className="reviews-score-block">
              <div className="reviews-big-num">5.0</div>
              <div>
                <div className="reviews-big-stars">★★★★★</div>
                <div className="reviews-big-label">{t.reviews?.basedOn}</div>
                <div className="reviews-count">11 verified reviews</div>
              </div>
            </div>
          </div>
          <div className="reviews-cards-grid">
            {REAL_REVIEWS.slice(0, 3).map((r, i) => (
              <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="review-card-new">
                <div className="rcn-top">
                  <div className="rcn-stars">{"★".repeat(r.stars)}</div>
                  <div className="rcn-country">{r.country}</div>
                </div>
                <p className="rcn-text">&ldquo;{r.text}&rdquo;</p>
                <div className="rcn-footer">
                  <div className="rcn-avatar">{r.name.replace("u/","").charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="rcn-name">{r.name}</div>
                    <div className="rcn-source">via Reddit</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"2rem"}}>
            <a href="/reviews" className="btn btn-outline">
              {t.reviews?.seeAll || "Read all reviews"} →
            </a>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <GallerySection t={t} gallery={gallery} />

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
      <EventsFloat t={t} />
      <BackToTop />
    </>
  );
}
