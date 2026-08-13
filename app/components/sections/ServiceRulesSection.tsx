// @ts-nocheck
"use client";

const SVG_PROPS = { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--red)", strokeWidth: "1.6", strokeLinecap: "round" as const };

function RuleIcon({ i }: { i: number }) {
  if (i === 0) return <svg {...SVG_PROPS}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
  if (i === 1) return <svg {...SVG_PROPS}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
  if (i === 2) return <svg {...SVG_PROPS}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
  if (i === 3) return <svg {...SVG_PROPS}><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /></svg>;
  return <svg {...SVG_PROPS}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}

export default function ServiceRulesSection({ t }: { t: any }) {
  const s = t.serviceRules || {};
  const items = s.items || [];

  return (
    <section id="service-rules" className="section reveal">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-label">{s.label || "Good to know"}</p>
          <h2>{s.title || "Important"} <em>{s.titleEm || "service rules"}</em></h2>
          <p className="desc">{s.desc || "A few honest details before you send your first request."}</p>
        </div>
        <div className="services-grid">
          {items.map((item, i) => (
            <div key={i} className="svc-card">
              <div className="svc-icon"><RuleIcon i={i} /></div>
              <div className="svc-title">{item.title}</div>
              <div className="svc-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
