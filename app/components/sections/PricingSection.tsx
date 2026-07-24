// @ts-nocheck
"use client";

export default function PricingSection({ t }: { t: any }) {
  return (
      <section id="pricing" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.pricing?.label || "Pricing"}</p>
            <h2>{t.pricing?.title || "Fully"} <em>{t.pricing?.titleEm || "personalised"}</em></h2>
            <p className="desc">{t.pricing?.desc || "Every request is unique — our pricing adapts to your order."}</p>
          </div>

          {/* 3 value cards */}
          <div className="pricing-custom-grid">
            <div className="pcg-card">
              <div className="pcg-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <h3>{t.pricing?.card1Title || "No hidden fees"}</h3>
              <p>{t.pricing?.card1Desc || "Every cost is communicated clearly before any payment."}</p>
            </div>
            <div className="pcg-card">
              <div className="pcg-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>{t.pricing?.card2Title || "Adapted to your order"}</h3>
              <p>{t.pricing?.card2Desc || "One item or a large haul — we study each request individually."}</p>
            </div>
            <div className="pcg-card">
              <div className="pcg-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>{t.pricing?.card3Title || "Get a quote in 24h"}</h3>
              <p>{t.pricing?.card3Desc || "Send us your request and we reply with a detailed, honest quote."}</p>
            </div>
          </div>

          {/* Weekly shipping notice */}
          <div className="shipping-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span><strong>{t.pricing?.weeklyShipping || "Weekly shipping"}</strong> — {t.pricing?.weeklyShippingDesc || "Packages are consolidated and shipped once a week from Tokyo."}</span>
          </div>

          {/* CTA */}
          <div className="pcg-cta">
            <div className="pcg-cta-left">
              <strong>{t.pricing?.ctaTitle || "Ready to place a request?"}</strong>
              <p>{t.pricing?.ctaDesc || "Describe your item and we'll get back to you with a personalised quote."}</p>
            </div>
            <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {t.pricing?.contactUs || "Contact us"}
            </a>
<a href="/request" className="btn btn-outline">{t.pricing?.useForm || "Use the form"}</a>
          </div>
          {/* SHIPPING */}
          <div className="shipping-section">
            <div className="shipping-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>{t.shipping?.label || "Shipping partners"}</span>
            </div>
            <div className="shipping-grid">
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge ems">EMS</div>
                  <div className="carrier-name">{t.shipping?.ems || "Japan Post EMS"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.emsDesc || "Express Mail Service — fast, tracked, affordable. Now available to new markets worldwide."}</p>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge yamato">ヤマト</div>
                  <div className="carrier-name">{t.shipping?.yamato || "Yamato Transport (TA-Q-BIN)"}</div>
                </div>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge fedex">FedEx</div>
                  <div className="carrier-name">{t.shipping?.fedex || "FedEx International"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.fedexDesc || "Recommended for high-value orders to USA and Canada. Full tracking, faster customs clearance, no declared value restriction."}</p>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge dhl">DHL</div>
                  <div className="carrier-name">{t.shipping?.dhl || "DHL Express"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.dhlDesc || "Premium express worldwide delivery. Excellent coverage across Europe. Fast customs processing, door-to-door tracking."}</p>
              </div>
            </div>
            <p className="shipping-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {t.shipping?.note || "Shipping method and costs are always discussed together before any payment. We choose the best option based on value, destination, and delivery time."}
            </p>
          </div>
        </div>
      </section>
  );
}
