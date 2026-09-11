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
        <div className="why-rows">
          {items.map((item, i) => (
            <div key={i} className={`why-row${i % 2 === 1 ? " why-row-rev" : ""}`}>
              <div className="why-row-visual">
                <span className="why-row-num">0{i + 1}</span>
                <div className="why-row-icon"><WhyIcon i={i} /></div>
              </div>
              <div className="why-row-text">
                <div className="why-row-title">{item.title}</div>
                <div className="why-row-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
