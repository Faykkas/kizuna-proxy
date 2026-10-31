// @ts-nocheck
"use client";

// Guide d'événement : en-tête, fiche « L'essentiel », sections (texte + liste), appel à l'action.
// Les textes viennent de guideTranslations[guideKey] (12 langues) : eventGuidesBiohazard.ts / eventGuidesAgf.ts.

import { useLanguage } from "../lib/language";
import { guideTranslations } from "../guideTranslations";

export default function EventGuideClient({ guideKey, locale }: { guideKey: string; locale?: string }) {
  const { lang } = useLanguage();
  const data = guideTranslations[guideKey];
  const g = data[locale || lang] || data.en;

  return (
    <main className="blog-page">
      <div className="blog-wrap">
        <div className="blog-eyebrow">{g.eyebrow}</div>
        <h1>{g.title}<em>{g.titleEm}</em></h1>
        <p className="blog-lead">{g.lead}</p>

        <div className="blog-facts">
          <h2>{g.factsH}</h2>
          <dl>
            {g.facts.map(([k, v], i) => (
              <div key={i} className="blog-fact">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {g.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.h}</h2>
            {s.p ? <p>{s.p}</p> : null}
            {s.list ? (
              <ul className="blog-list">
                {s.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <hr className="blog-hr" />
        <div className="blog-cta">
          <p>{g.ctaText}</p>
          <a href="/request" className="btn btn-gold">{g.ctaBtn}</a>
        </div>
      </div>
    </main>
  );
}
