// @ts-nocheck
"use client";

import { WHY_CARDS_DATA, TICKER_ITEMS } from "../data";
import WhyIcon from "../WhyIcon";

export default function HowItWorksSection({ t }: { t: any }) {
  return (
      <section id="how-it-works" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.howItWorks?.label}</p>
            <h2>{t.howItWorks?.title} <em>{t.howItWorks?.titleEm || ""}</em></h2>
            <p className="desc">{t.howItWorks?.desc}</p>
          </div>
          <div className="hiw-steps">
            {[
              { n:"01", title: t.howItWorks?.step1Title, body: t.howItWorks?.step1Body,
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { n:"02", title: t.howItWorks?.step2Title, body: t.howItWorks?.step2Body,
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
              { n:"03", title: t.howItWorks?.step3Title, body: t.howItWorks?.step3Body,
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
            ].map((step, i) => (
              <div key={i} className="hiw-step">
                <div className="hiw-step-num">{step.n}</div>
                <div className="hiw-step-icon">{step.icon}</div>
                <div className="hiw-step-body">
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Why Kizuna — merged */}
          <div className="why-merged-head">
            <p className="sec-label">{t.howItWorks?.whyKizuna?.label || t.whyKizuna?.label || "Why Kizuna"}</p>
            <h2>{t.howItWorks?.whyKizuna?.title || t.whyKizuna?.title || "Personal service,"} <em>{t.howItWorks?.whyKizuna?.titleEm || t.whyKizuna?.titleEm || "not a platform"}</em></h2>
            <p className="desc">{t.howItWorks?.whyKizuna?.desc || t.whyKizuna?.desc || "Big proxy services are automated."}</p>
          </div>
          <div className="why-grid-v2">
            {WHY_CARDS_DATA.map((item, i) => {
              const tCard = t.howItWorks?.whyKizuna?.cards?.[i];
              return (
                <div key={i} className="why-card-v2">
                  <div className="why-card-v2-top">
                    <span className="why-card-v2-n">{item.n}</span>
                    <div className="why-card-v2-stat">
                      <strong>{item.stat}</strong>
                      <span>{item.statL}</span>
                    </div>
                  </div>
                  <div className="why-card-v2-icon"><WhyIcon i={i} /></div>
                  <strong className="why-card-v2-title">{tCard?.title || item.title}</strong>
                  <p className="why-card-v2-desc">{tCard?.desc || item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Ticker */}
          <div className="order-ticker">
            <div className="ticker-label"><span className="ticker-dot"/>{t.howItWorks?.whyKizuna?.ticker || t.whyKizuna?.ticker || "Recent orders"}</div>
            <div className="ticker-track">
              <div className="ticker-inner">
                {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
                  <span key={i} className="ticker-item">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
