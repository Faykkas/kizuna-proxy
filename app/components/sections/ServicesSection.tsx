// @ts-nocheck
"use client";

import { CATEGORY_ICONS } from "../pixel/PixelIcons";

const RARITY = ["common", "common", "rare", "common", "rare", "legend"];
const RARITY_LABEL = { common: "COMMON", rare: "★ RARE", legend: "☆ LEGEND" };

export default function ServicesSection({ t }: { t: any }) {
  return (
      <section id="services" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.whatWeBuy?.label}</p>
            <h2>{t.whatWeBuy?.title} <em>{t.whatWeBuy?.titleEm}</em></h2>
            <p className="desc">{t.whatWeBuy?.desc}</p>
          </div>
          <div className="services-grid">
            {(t.whatWeBuy?.items || []).map((item, i) => (
              <div key={i} className="svc-card">
                <div className="svc-num">0{i+1}</div>
                <div className="svc-icon">
                  {(() => { const Ico = CATEGORY_ICONS[i] || CATEGORY_ICONS[0]; return <Ico size={44} />; })()}
                </div>
                <div className="svc-title">{item.title}</div>
                <div className="svc-desc">{item.desc}</div>
                <span className={`px-badge px-badge-${RARITY[i] || "common"}`}>
                  {RARITY_LABEL[RARITY[i] || "common"]}
                </span>
                <div className="svc-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
