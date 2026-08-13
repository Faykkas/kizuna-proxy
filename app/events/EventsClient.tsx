// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import Maneki from "../components/pixel/Maneki";
import { useLang } from "../components/useSiteState";

// ─── EVENTS CONTENT ───────────────────────────────────────────────────────────
const EVENTS_CONTENT = {
  eyebrow: "Tokyo Events · Exclusive Access",
  ctaNav: "Request an item",
  title: "Tokyo Events &",
  titleEm: "Exclusive Releases",
  lead: "Some of the most sought-after items in Japan are never listed online — they only exist at specific events, pop-ups, and store openings. We are on the ground in Tokyo and attend these for you.",
  whatTitle: "What We Cover",
  howTitle: "How It Works",
  pricingTitle: "Pricing is discussed privately",
  pricingText: "Event service fees vary depending on the event, queue time, purchase limits, and item cost. We do not publish a fixed price for events because every situation is different. Contact us directly for a clear, honest quote.",
  ctaText: "Interested in a Tokyo event?",
  ctaBtn: "Contact us privately →",
  faqTitle: "Frequently Asked Questions",
  cards: [
    { icon: "🎴", title: "Pokémon Center Events", desc: "Exclusive card releases, promo cards, and limited plush only at official Pokémon Center Tokyo locations. Some sets sell out within hours." },
    { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Japan-exclusive Switch games, limited bundles, event-only merch, and collabs only sold at Nintendo's flagship store in Shibuya Parco." },
    { icon: "👟", title: "Supreme & Streetwear Drops", desc: "Weekly Supreme Japan drops, BAPE exclusives, Neighborhood collabs, and limited sneaker releases across Harajuku and Shibuya." },
    { icon: "🏮", title: "Pop-up Events & Collabs", desc: "Anime collaborations, brand pop-ups, Wonder Festival, limited artist merch — goods that disappear in a matter of hours." },
    { icon: "🃏", title: "Card Game Events", desc: "Pokémon, One Piece TCG, Dragon Ball Super — exclusive promo cards and event merch only for in-person attendees." },
    { icon: "🏪", title: "Department Store Exclusives", desc: "Isetan, Mitsukoshi, Takashimaya — Japanese department stores regularly host exclusive brand events unavailable anywhere else." },
  ],
  steps: [
    { n: "01", title: "Contact us privately", body: "Send us a message about the event or item — dates, store name, or any links you have." },
    { n: "02", title: "We check availability", body: "We confirm queue requirements, opening times, and purchase limits before any commitment." },
    { n: "03", title: "Pricing & confirmation", body: "Event pricing is discussed case by case. Everything is communicated before you pay anything." },
    { n: "04", title: "We attend & ship", body: "We queue and purchase in person. We photograph everything and ship directly to you worldwide." },
  ],
  faqs: [
    { q: "How far in advance should I contact you?", a: "As early as possible — ideally at least a week before. Some events require pre-registration. The earlier you reach out, the better we can prepare." },
    { q: "What if the item sells out?", a: "We always tell you honestly if an item is likely to sell out quickly. The event or visit fee still applies even if we can't secure the item, since it covers our time and travel — we'll never charge for the item itself unless we actually bought it." },
    { q: "Can you attend events outside Tokyo?", a: "Our primary coverage is Tokyo. Other cities may be possible but require additional discussion and travel costs." },
    { q: "Do you do live video calls during events?", a: "Yes — we can arrange a live video call so you can see items in person before we purchase. This has been very popular with our clients." },
    { q: "Is there a minimum order?", a: "No minimum. One promo card or a full event haul — we treat every request with the same level of care." },
  ]
};

// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
export default function EventsClient() {
  const c = EVENTS_CONTENT;
  const { t } = useLang();
  const h = t.pageHeroes?.events || {};
  const ep = t.eventsPage || {};
  const cards = ep.cards || c.cards;
  const steps = ep.steps || c.steps;
  const faqs = ep.faqs || c.faqs;

  return (
    <>
      {/* NAV */}
      <SiteNav />

      {/* PAGE CONTENT */}
      <main className="blog-page">
        <div className="blog-wrap" style={{ maxWidth: "860px" }}>

          <div className="px-page-head-inline">
            <div className="px-head-mascot">
              <Maneki prop="sign" size={86} float />
              <span className="px-head-bubble">{h.bubble || "We queue so you don't"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{t.nav?.events || "Events"}</span>
            </nav>
            <h1 className="px-page-title">{h.title || c.title} <em>{h.titleEm || c.titleEm}</em></h1>
            <p className="px-page-lead">{h.lead || c.lead}</p>
          </div>

          <hr className="blog-hr" />

          <h2>{ep.whatTitle || c.whatTitle}</h2>
          <div className="ev-grid">
            {cards.map((item, i) => (
              <div key={i} className="ev-card">
                <div className="ev-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <hr className="blog-hr" />

          <h2>{ep.howTitle || c.howTitle}</h2>
          <div className="ev-steps">
            {steps.map(s => (
              <div key={s.n} className="ev-step">
                <div className="ev-step-num">{s.n}</div>
                <div><strong>{s.title}</strong><p>{s.body}</p></div>
              </div>
            ))}
          </div>

          <hr className="blog-hr" />

          <div className="ev-pricing-note">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>{ep.pricingTitle || c.pricingTitle}</strong>
              <p>{ep.pricingText || c.pricingText}</p>
            </div>
          </div>

          <div className="blog-cta" style={{ marginTop: "2rem" }}>
            <p>{ep.ctaText || c.ctaText}</p>
            <a href="/#request-wrap" className="btn btn-gold">{ep.ctaBtn || c.ctaBtn}</a>
          </div>

          <p style={{ fontSize: ".82rem", marginTop: "1.5rem" }}>
            Looking for a specific pop-up or collab? See our <a href="/japan-pop-up-store-proxy">Japan pop-up store proxy</a> page for how it works.
          </p>

          <hr className="blog-hr" />

          <h2>{ep.faqTitle || c.faqTitle}</h2>
          <div className="ev-faq">
            {faqs.map((item, i) => (
              <div key={i} className="ev-faq-item">
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      <SiteFooter t={t} />
    </>
  );
}
