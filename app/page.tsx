// @ts-nocheck
"use client";

import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import AnnounceBar from "./components/AnnounceBar";
import HeroSection from "./components/sections/HeroSection";
import SearchWidget from "./components/SearchWidget";
import ServicesSection from "./components/sections/ServicesSection";
import WhyKizunaHomeSection from "./components/sections/WhyKizunaHomeSection";
import ServiceRulesSection from "./components/sections/ServiceRulesSection";
import NewsPreviewSection from "./components/sections/NewsPreviewSection";
import GallerySection from "./components/sections/GallerySection";
import { BackToTop, useScrollReveal } from "./components/ui";
import usePixelCanvas from "./components/pixel/usePixelCanvas";
import { useLang, useAnnounce, useGallery } from "./components/useSiteState";
import { REAL_REVIEWS } from "./components/data";

export default function Home() {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  const gallery = useGallery();

  useScrollReveal();
  usePixelCanvas();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />

      <HeroSection t={t} />

      {/* HOBONICHI TECHO EVENT PROMO — time-sensitive announcement for the
          Sept 20, 2026 reservation slots at the Gransta Tokyo store opening,
          placed as the very first section after the hero for maximum
          visibility. Remove (or move to /events) once the slots are gone. */}
      <section className="section-sm reveal">
        <div className="wrap">
          <div className="p-event-card" style={{ borderLeftColor: "var(--gold-d)" }}>
            <div className="p-event-body">
              <div className="highlight-pill" style={{ marginBottom: ".8rem" }}>
                <span className="highlight-pill-dot" />
                <span className="highlight-pill-text">🐧 {t.eventPromo?.badge}</span>
              </div>
              <strong style={{ fontSize: "1.05rem" }}>{t.eventPromo?.title}</strong>
              <p>{t.eventPromo?.desc}</p>
              <div className="event-slot-row">
                <span className="event-slot-pill"><span className="event-slot-dot" />{t.eventPromo?.slot}</span>
              </div>
              <p style={{ marginTop: ".5rem" }}>{t.eventPromo?.fee}</p>
              <p style={{ marginTop: ".3rem", fontSize: ".7rem", fontStyle: "italic", opacity: .8 }}>{t.eventPromo?.note}</p>
            </div>
            <a href="/request" className="btn btn-gold">{t.eventPromo?.cta}</a>
          </div>
        </div>
      </section>

      {/* B2B PROMO — points business/reseller visitors to /business-sourcing,
          placed right under the hero for maximum visibility. Kept in English
          like the other landing-page pointers (Guides dropdown, "Kizuna Box")
          rather than wired into the 12-language translations dictionary. */}
      <section className="section-sm reveal">
        <div className="wrap">
          <div className="p-event-card" style={{ borderLeftColor: "var(--red)" }}>
            <div className="p-event-body">
              <div className="highlight-pill" style={{ marginBottom: ".8rem" }}>
                <span className="highlight-pill-dot" />
                <span className="highlight-pill-text">For businesses &amp; resellers</span>
              </div>
              <strong style={{ fontSize: "1.05rem" }}>Professional sourcing for retailers and resellers</strong>
              <p>K-pop, anime, cards, streetwear or group orders — a dedicated Tokyo sourcing partner with volume-friendly pricing for your business.</p>
            </div>
            <a href="/business-sourcing" className="btn btn-gold">Explore Business Sourcing →</a>
          </div>
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

      {/* SERVICES — aperçu, détail sur /services */}
      <ServicesSection t={t} />
      <div className="wrap" style={{textAlign:"center",marginTop:"-1.5rem",marginBottom:"3rem"}}>
        <a href="/services" className="btn btn-outline">
          {t.whatWeBuy?.seeAll || "See all services"} →
        </a>
      </div>

      {/* WHY KIZUNA */}
      <WhyKizunaHomeSection t={t} />

      {/* SERVICE RULES */}
      <ServiceRulesSection t={t} />

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
      <BackToTop />
    </>
  );
}
