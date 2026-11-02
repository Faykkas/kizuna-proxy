// @ts-nocheck
"use client";

// Bandeau « expédition hebdomadaire » et cartes des transporteurs (EMS, Yamato).
// Textes traduits (t.pricing / t.shipping, 12 langues) : repris tels quels de l'ancienne section Tarifs.

export default function ShippingPartners({ t }: { t: any }) {
  return (
    <>
      <div className="shipping-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
        <span><strong>{t.pricing?.weeklyShipping || "Weekly shipping"}</strong> — {t.pricing?.weeklyShippingDesc || "Packages are consolidated and shipped once a week from Tokyo."}</span>
      </div>

      <div className="shipping-section">
        <div className="shipping-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
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
            <p className="shipping-desc">{t.shipping?.yamatoDesc || "Used for shipping within Japan. Known for careful handling."}</p>
          </div>
        </div>
        <p className="shipping-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {t.shipping?.note || "Shipping method and costs are always discussed together before any payment."}
        </p>
      </div>
    </>
  );
}
