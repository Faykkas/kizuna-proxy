// @ts-nocheck
"use client";

// Four quick-explainer cards near the top of the homepage — what a proxy
// service is, how Kizuna's process works, who's behind it, and what
// services are covered. Answers the "what am I even looking at" question
// before the visitor scrolls any further.

const LINKS = ["/faq", "/how-it-works", "/how-it-works", "/services"];

export default function ExplainerSection({ t }: { t: any }) {
  const items = t.explainer?.items || [];
  if (items.length === 0) return null;

  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="explainer-grid">
          {items.map((item, i) => (
            <a key={i} href={LINKS[i] || "/faq"} className="explainer-card">
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
