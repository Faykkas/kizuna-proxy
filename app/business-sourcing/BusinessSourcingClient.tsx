// @ts-nocheck
"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import ReviewsSection from "../components/sections/ReviewsSection";
import BusinessRequestForm from "../components/BusinessRequestForm";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { businessSourcingTranslations } from "../businessSourcingTranslations";

function Icon({ d, viewBox = "0 0 24 24" }) {
  return (
    <svg width="22" height="22" viewBox={viewBox} fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const ICONS = {
  store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 20v-6h6v6"/>',
  online: '<rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  budget: '<circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-2.5-1.5h-1a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5h-1a2.5 2.5 0 0 1-2.5-1.5"/>',
  gift: '<rect x="2" y="8" width="20" height="14" rx="1"/><path d="M12 8v14M2 12h20M12 8c-2 0-3.5-1.5-3.5-3S10 2 12 5c0-3 1.5-5 3.5-5S19 4 17 8"/>',
  receipt: '<path d="M4 2h16v20l-3-2-3 2-2-2-2 2-3-2-3 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  check: '<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};

// Fixed icon per card index — content (title/desc) comes from the
// translated data, the icon set itself doesn't need to vary by language.
const AUDIENCE_ICONS = ["gift", "box", "card", "shield", "online", "users"];
const CAPABILITY_ICONS = ["pin", "gift", "online", "camera", "budget", "check", "receipt", "box", "repeat"];

export default function BusinessSourcingClient({ locale } = {}) {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  const data = businessSourcingTranslations;
  const g = data[locale || lang] || data.en;

  useEffect(() => { track("business_sourcing_page_view"); }, []);

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>

        {/* ── 1. Hero ── */}
        <section className="hero-center" style={{ padding: "7rem 2rem 5rem" }}>
          <div className="hero-center-inner">
            <div className="highlight-pill">
              <span className="highlight-pill-dot" />
              <span className="highlight-pill-text">{g.heroBadge}</span>
            </div>
            <h1 className="hero-h1">
              {g.heroTitle1}<br /><em>{g.heroTitleEm}</em>
            </h1>
            <p className="hero-desc">{g.heroDesc}</p>
            <div className="hero-btns hero-btns-center">
              <a href="#business-form" className="btn btn-gold">{g.heroCta}</a>
              <a href="#how-it-works-b2b" className="btn btn-outline">{g.heroCtaSecondary}</a>
            </div>
            <p style={{ fontSize: ".72rem", letterSpacing: ".06em", color: "var(--warm)", textAlign: "center" }}>
              {g.heroTagline}
            </p>
          </div>
        </section>

        {/* ── 2. Audience ── */}
        <section className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{g.audienceLabel}</p>
              <h2>{g.audienceTitle} <em>{g.audienceTitleEm}</em></h2>
            </div>
            <div className="services-grid">
              {g.audience.map((a, i) => (
                <div key={i} className="svc-card">
                  <div className="svc-icon"><Icon d={ICONS[AUDIENCE_ICONS[i]]} /></div>
                  <div className="svc-title">{a.title}</div>
                  <p className="svc-desc">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Services ── */}
        <section className="section reveal" style={{ background: "var(--paper)" }}>
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{g.capabilitiesLabel}</p>
              <h2>{g.capabilitiesTitle} <em>{g.capabilitiesTitleEm}</em></h2>
              <p className="desc">{g.capabilitiesDesc}</p>
            </div>
            <div className="pricing-custom-grid" style={{ marginBottom: 0 }}>
              {g.capabilities.map((c, i) => (
                <div key={i} className="pcg-card">
                  <div className="pcg-icon"><Icon d={ICONS[CAPABILITY_ICONS[i]]} /></div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. How it works ── */}
        <section id="how-it-works-b2b" className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{g.processLabel}</p>
              <h2>{g.processTitle} <em>{g.processTitleEm}</em></h2>
            </div>
            <div className="hiw-steps hiw-steps-4">
              {g.steps.map((s, i) => (
                <div key={i} className="hiw-step">
                  <div className="hiw-step-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="hiw-step-body">
                    <strong>{s.title}</strong>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Pricing ── */}
        <section className="section reveal" style={{ background: "var(--paper)" }}>
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{g.pricingLabel}</p>
              <h2>{g.pricingTitle} <em>{g.pricingTitleEm}</em></h2>
              <p className="desc">{g.pricingDesc}</p>
            </div>

            <div className="highlight-pill">
              <span className="highlight-pill-dot" />
              <span className="highlight-pill-text">{g.highlightBadge}</span>
            </div>

            <div className="pricing-formula-grid">
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.online} /></div>
                <h3>{g.priceOnlineTitle}</h3>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--red)" }}>{g.priceOnlineValue}</div>
                <p>{g.priceOnlineDesc}</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.pin} /></div>
                <h3>{g.priceVisitTitle}</h3>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--red)" }}>{g.priceVisitValue}</div>
                <p>{g.priceVisitDesc}</p>
              </div>
            </div>

            <div className="pricing-custom-grid">
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.globe} /></div>
                <h3>{g.priceMultiTitle}</h3>
                <p>{g.priceMultiValue}</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.repeat} /></div>
                <h3>{g.priceRecurringTitle}</h3>
                <p>{g.priceRecurringValue}</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.budget} /></div>
                <h3>{g.priceBudgetTitle}</h3>
                <p>{g.priceBudgetValue}</p>
              </div>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{g.noteQuotation}</span>
            </div>
            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{g.noteCosts}</span>
            </div>

            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>{g.promoTitle}</strong>
                <p>{g.promoText}</p>
              </div>
              <a href="#business-form" className="btn btn-gold">{g.promoBtn}</a>
            </div>
          </div>
        </section>

        {/* ── 6. Why Kizuna ── */}
        <section className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{g.whyLabel}</p>
              <h2>{g.whyTitle} <em>{g.whyTitleEm}</em></h2>
            </div>
            <div className="why-grid-v2">
              {g.benefits.map((b, i) => (
                <div key={i} className="why-card-v2">
                  <div className="why-card-v2-top">
                    <span className="why-card-v2-n">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="why-card-v2-icon"><Icon d={ICONS.check} /></div>
                  <strong className="why-card-v2-title">{b}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews (real reviews, existing component) ── */}
        <ReviewsSection t={{ reviews: { label: g.reviewsLabel, title: g.reviewsTitle, titleEm: g.reviewsTitleEm, basedOn: g.reviewsBasedOn } }} />

        {/* ── 7. Important information ── */}
        <section className="section reveal" style={{ background: "var(--paper)" }}>
          <div className="wrap" style={{ maxWidth: "760px" }}>
            <div className="sec-head">
              <p className="sec-label">{g.transparencyLabel}</p>
              <h2>{g.transparencyTitle} <em>{g.transparencyTitleEm}</em></h2>
            </div>
            <div className="p-note">
              <ul style={{ display: "flex", flexDirection: "column", gap: ".75rem", listStyle: "none" }}>
                {g.limits.map((l, i) => (
                  <li key={i} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--red)", flexShrink: 0 }}>—</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 8. B2B form ── */}
        <section id="business-form" className="section reveal">
          <div className="wrap" style={{ maxWidth: "760px" }}>
            <div className="sec-head">
              <p className="sec-label">{g.formLabel}</p>
              <h2>{g.formTitle} <em>{g.formTitleEm}</em></h2>
              <p className="desc">
                {g.formDesc}{" "}
                {g.formEmailPrefix} <a href="mailto:kizunaproxy@gmail.com?subject=Business%20sourcing%20request" onClick={() => track("business_contact_click")} style={{ color: "var(--red)" }}>kizunaproxy@gmail.com</a>
              </p>
            </div>
            <BusinessRequestForm t={g.form} />
          </div>
        </section>

      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
