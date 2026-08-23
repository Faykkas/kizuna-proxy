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

// This page's own visible copy is English-only by design (an international
// B2B audience), so it doesn't read from the 12-language `translations`
// dictionary the way the rest of the site does. SiteNav/SiteFooter still
// need the *site's* current language object for their own labels though —
// that's what useLang() below is for.
const bsT = {
  reviews: {
    label: "Reviews",
    title: "Trusted by",
    titleEm: "buyers worldwide",
    basedOn: "Based on real, verified reviews",
  },
};

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

const AUDIENCE = [
  { icon: "gift", title: "K-pop and entertainment retailers", desc: "Photocards, albums, official merch and pop-up exclusives from Tokyo's K-pop and entertainment stores." },
  { icon: "box", title: "Anime and collectibles stores", desc: "Anime figures, doujinshi, character goods and collab merchandise sourced directly from Japanese retailers." },
  { icon: "card", title: "Card and hobby businesses", desc: "Trading card boxes, sealed product and hobby items from physical stores and Japanese marketplaces." },
  { icon: "shield", title: "Japanese fashion resellers", desc: "Streetwear drops, brand exclusives and in-store fashion releases available only in Japan." },
  { icon: "online", title: "E-commerce sellers", desc: "Shopify, eBay and marketplace sellers who need a reliable local buyer for recurring Japanese inventory." },
  { icon: "users", title: "Group-order managers", desc: "Coordinated purchasing and consolidation for community group orders with multiple items and participants." },
];

const CAPABILITIES = [
  { icon: "pin", title: "Targeted store & event visits", desc: "Targeted visits to Tokyo stores and pop-up events on your behalf." },
  { icon: "gift", title: "Exclusive merchandise", desc: "Japan-exclusive and venue-exclusive merchandise you can't access from outside Japan." },
  { icon: "online", title: "Online marketplace purchasing", desc: "Purchasing from Japanese marketplaces and retailers that don't ship internationally." },
  { icon: "camera", title: "Live photo confirmation", desc: "Live photographs and product confirmation before purchase, when the venue permits it." },
  { icon: "budget", title: "Priorities & budget limits", desc: "Purchasing according to your priorities, quantities and budget limits." },
  { icon: "check", title: "Promotional gifts", desc: "Collection of legitimately provided purchase benefits and promotional gifts." },
  { icon: "receipt", title: "Proof of purchase", desc: "Receipt and proof-of-purchase collection when available from the store or seller." },
  { icon: "box", title: "Consolidation & shipping", desc: "Consolidation, protective packaging and tracked international shipping." },
  { icon: "repeat", title: "Recurring sourcing", desc: "Recurring sourcing operations for established business partners." },
];

const STEPS = [
  { n: "01", title: "Submit your sourcing request", body: "Send us the links, dates, quantities, priorities, budget and accepted alternatives." },
  { n: "02", title: "Receive a tailored quotation", body: "We check feasibility and event conditions, and prepare a quotation before any payment." },
  { n: "03", title: "Live sourcing and purchasing", body: "We purchase online or visit the store in Tokyo, communicating live when needed and permitted." },
  { n: "04", title: "Consolidation and shipping", body: "Products are consolidated, protected and shipped internationally with tracking." },
];

const BENEFITS = [
  "Local presence in Tokyo",
  "Human communication",
  "Clear budgets and purchasing limits",
  "Live approvals for alternatives",
  "Transparent service charges",
  "Purchase evidence and receipts when provided",
  "Secure PayPal Goods & Services payments",
  "Worldwide tracked shipping",
  "Experience with international collectors and professional buyers",
];

const LIMITS = [
  "Kizuna provides retail sourcing, not wholesale distribution.",
  "Kizuna does not guarantee resale value, profitability or future market demand.",
  "Product availability cannot be guaranteed before purchase.",
  "Store rules, event rules, identity requirements and purchase limits must be respected.",
  "Live photography or video depends on venue permission.",
  "Kizuna cannot circumvent identity checks or purchase restrictions.",
  "Physical visits are currently available within Tokyo.",
  "Nothing is reserved or purchased before the scope, quotation and payment have been confirmed.",
];

export default function BusinessSourcingClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

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
              <span className="highlight-pill-text">Business Sourcing</span>
            </div>
            <h1 className="hero-h1">
              Local sourcing in Tokyo<br /><em>for international businesses</em>
            </h1>
            <p className="hero-desc">
              Access Japan-exclusive merchandise, pop-up stores, limited releases and retail products with a reliable local purchasing partner.
            </p>
            <div className="hero-btns hero-btns-center">
              <a href="#business-form" className="btn btn-gold">Request a Business Quote</a>
              <a href="#how-it-works-b2b" className="btn btn-outline">How It Works</a>
            </div>
            <p style={{ fontSize: ".72rem", letterSpacing: ".06em", color: "var(--warm)", textAlign: "center" }}>
              Tokyo-based • Live purchasing support • Worldwide tracked shipping
            </p>
          </div>
        </section>

        {/* ── 2. Audience ── */}
        <section className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">Who it&apos;s for</p>
              <h2>Built for <em>professional buyers</em></h2>
            </div>
            <div className="services-grid">
              {AUDIENCE.map((a, i) => (
                <div key={i} className="svc-card">
                  <div className="svc-icon"><Icon d={ICONS[a.icon]} /></div>
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
              <p className="sec-label">Capabilities</p>
              <h2>What Kizuna <em>can handle</em></h2>
              <p className="desc">Store rules, event rules and purchase limits are always respected.</p>
            </div>
            <div className="pricing-custom-grid" style={{ marginBottom: 0 }}>
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="pcg-card">
                  <div className="pcg-icon"><Icon d={ICONS[c.icon]} /></div>
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
              <p className="sec-label">Process</p>
              <h2>How business <em>sourcing works</em></h2>
            </div>
            <div className="hiw-steps hiw-steps-4">
              {STEPS.map((s, i) => (
                <div key={i} className="hiw-step">
                  <div className="hiw-step-num">{s.n}</div>
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
              <p className="sec-label">Pricing</p>
              <h2>Flexible pricing for <em>professional buyers</em></h2>
              <p className="desc">Business pricing is adapted to the order value, complexity, required locations and expected purchase frequency. Recurring and higher-volume partners receive preferential rates.</p>
            </div>

            <div className="highlight-pill">
              <span className="highlight-pill-dot" />
              <span className="highlight-pill-text">Purchasing commission from 5%</span>
            </div>

            <div className="pricing-formula-grid">
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.online} /></div>
                <h3>Online purchasing</h3>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--red)" }}>From ¥3,000 + 5%</div>
                <p>Purchasing commission on top of the base fee, quoted before any payment.</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.pin} /></div>
                <h3>Targeted visit to one Tokyo location</h3>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--red)" }}>From ¥6,000 + 5%</div>
                <p>Purchasing commission on top of the base fee, quoted before any payment.</p>
              </div>
            </div>

            <div className="pricing-custom-grid">
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.globe} /></div>
                <h3>Extended or multi-location sourcing</h3>
                <p>From ¥12,000 + 5% purchasing commission</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.repeat} /></div>
                <h3>Recurring and higher-volume operations</h3>
                <p>Tailored volume pricing</p>
              </div>
              <div className="pcg-card">
                <div className="pcg-icon"><Icon d={ICONS.budget} /></div>
                <h3>Recommended merchandise budget</h3>
                <p>From ¥50,000 per operation</p>
              </div>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>The final quotation depends on the requested products, location, queueing requirements, purchase restrictions and total merchandise budget. Every cost is confirmed before payment or reservation.</span>
            </div>
            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Product costs, admission fees, exceptional transportation, protective packaging, international shipping and payment-processing fees are charged separately when applicable.</span>
            </div>

            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>Planning your first sourcing test?</strong>
                <p>Contact us with your target products, event or store, quantities and merchandise budget. We can prepare a tailored quotation for your first professional sourcing operation.</p>
              </div>
              <a href="#business-form" className="btn btn-gold">Request a Business Quote</a>
            </div>
          </div>
        </section>

        {/* ── 6. Why Kizuna ── */}
        <section className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">Why Kizuna</p>
              <h2>Why work with <em>Kizuna Proxy</em></h2>
            </div>
            <div className="why-grid-v2">
              {BENEFITS.map((b, i) => (
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
        <ReviewsSection t={bsT} />

        {/* ── 7. Important information ── */}
        <section className="section reveal" style={{ background: "var(--paper)" }}>
          <div className="wrap" style={{ maxWidth: "760px" }}>
            <div className="sec-head">
              <p className="sec-label">Transparency</p>
              <h2>Important <em>information</em></h2>
            </div>
            <div className="p-note">
              <ul style={{ display: "flex", flexDirection: "column", gap: ".75rem", listStyle: "none" }}>
                {LIMITS.map((l, i) => (
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
              <p className="sec-label">Get started</p>
              <h2>Request a <em>business quote</em></h2>
              <p className="desc">
                Tell us what you need — we&apos;ll review your sourcing request and get back to you with the next steps.
                Prefer email? <a href="mailto:kizunaproxy@gmail.com?subject=Business%20sourcing%20request" onClick={() => track("business_contact_click")} style={{ color: "var(--red)" }}>kizunaproxy@gmail.com</a>
              </p>
            </div>
            <BusinessRequestForm />
          </div>
        </section>

      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
