// @ts-nocheck
"use client";

// Bande « comment ça marche » juste sous l'en-tête : trois étapes, pour qu'un visiteur comprenne le principe
// avant de scroller. Les textes viennent de t.howItWorks (translations.ts, 12 langues) : rien de nouveau à traduire.

export default function StepsV3({ t }: { t: any }) {
  const h = t.howItWorks || {};
  const steps = [1, 2, 3].map((n) => ({ n, title: h[`step${n}Title`], body: h[`step${n}Body`] })).filter((s) => s.title);
  if (steps.length === 0) return null;
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="v3-steps-head">
          <h2>
            {h.title} <em>{h.titleEm}</em>
          </h2>
          {h.desc ? <p>{h.desc}</p> : null}
        </div>
        <ol className="v3-steps">
          {steps.map((s) => (
            <li key={s.n} className="v3-step">
              <span className="v3-step-num" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="v3-steps-more">
          <a href="/how-it-works">{h.label} →</a>
        </p>
      </div>
    </section>
  );
}
