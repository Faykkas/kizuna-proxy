// @ts-nocheck
"use client";

import WhyIcon from "../WhyIcon";

export default function WhyKizunaHomeSection({ t }: { t: any }) {
  const w = t.whyKizunaHome || {};
  const items = w.items || [];

  return (
    <section id="why-kizuna" className="section reveal">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-label">{w.label || "Why Kizuna"}</p>
          <h2>{w.title || "A personal shopper,"} <em>{w.titleEm || "not a platform"}</em></h2>
          <p className="desc">{w.desc || "Real people in Tokyo — not a warehouse, not a bot."}</p>
        </div>
        <div className="services-grid">
          {items.map((item, i) => (
            <div key={i} className="svc-card">
              <div className="svc-num">0{i + 1}</div>
              <div className="svc-icon"><WhyIcon i={i} /></div>
              <div className="svc-title">{item.title}</div>
              <div className="svc-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
