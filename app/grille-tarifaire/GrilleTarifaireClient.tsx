// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function GrilleTarifaireClient() {
  const { t } = useLang();
  const g = t.grille || {};
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">価</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="coins" size={86} float />
              <span className="px-head-bubble">{g.headBadge || "Rates up to date"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{g.headTitle || "Pricing"} {g.headTitleEm || "sheet"}</span>
            </nav>
            <h1>{g.headTitle || "Pricing"} <em>{g.headTitleEm || "sheet"}</em></h1>
            <p>{g.headDesc || "A detailed breakdown of our fees by service type. An exact quote is always confirmed before payment."}</p>
          </div>
        </header>

        <section className="section reveal">
          <div className="wrap">
            <div className="tarif-highlight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                <strong>{g.highlightTitle || "Assistance included, no hidden fees"}</strong>
                <p>{g.highlightDesc || "We're based in Japan: calling stores, gathering information, taking in-store photos — it's all included in the fees below. You pay nothing else until your package arrives at your door."}</p>
              </div>
            </div>

            <div className="tarif-cards">
              {(g.categories || []).map((cat, i) => (
                <div className="tarif-card" key={i}>
                  <h3>{cat.title}</h3>
                  <p className="tarif-card-desc">{cat.desc}</p>
                  <div className="tarif-lines">
                    {cat.lines.map((l, j) => (
                      <div className="tarif-line" key={j}>
                        <div className="tarif-line-top">
                          <span className="tarif-line-label">{l.label}</span>
                          <span className="tarif-line-price">{l.price}</span>
                        </div>
                        {l.note && <p className="tarif-line-note">{l.note}</p>}
                      </div>
                    ))}
                  </div>
                  {cat.footnote && <p className="tarif-card-footnote">{cat.footnote}</p>}
                </div>
              ))}
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>{g.shippingNote || "These rates don't include international shipping fees. The price depends on the parcel's weight, so we can't provide a fixed rate in advance — it's communicated before any payment."}</span>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{g.zonosNote || "US residents — customs duties are settled via Zonos. If you'd like to declare a lower value on the package, Kizuna can do so at your request, but takes no responsibility for any issue related to that declaration."}</span>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>{g.refundNote || "All refunds are issued net of PayPal fees."}</span>
            </div>

            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>{g.ctaTitle || "Any question about your order?"}</strong>
                <p>{g.ctaDesc || "Contact us directly — we always confirm the exact rate before any payment."}</p>
              </div>
              <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {g.ctaContact || "Contact us"}
              </a>
              <a href="/request" className="btn btn-outline">{g.ctaRequest || "Make a request"}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
