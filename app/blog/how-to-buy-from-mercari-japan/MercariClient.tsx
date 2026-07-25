// @ts-nocheck
"use client";

import { useLanguage } from "../../lib/language";
import { guideTranslations } from "../../guideTranslations";

export default function MercariClient() {
  const { lang } = useLanguage();
  const data = guideTranslations.mercari;
  const g = data[lang] || data.en;

  return (
    <main className="blog-page">
      <div className="blog-wrap">
        <div className="blog-eyebrow">{g.eyebrow}</div>
        <h1>{g.title}<br /><em>{g.titleEm}</em></h1>
        <p className="blog-lead">{g.lead}</p>

        <hr className="blog-hr" />

        <h2>{g.h1}</h2>
        <p>{g.p1}</p>
        <p>{g.p2}</p>

        <h2>{g.h2}</h2>
        <p>{g.p3}</p>
        <p>{g.p4}</p>

        <h2>{g.h3}</h2>
        <ul className="blog-list">
          {g.list.map((item, i) => (
            <li key={i}><strong>{item.strong}</strong> {item.text}</li>
          ))}
        </ul>

        <h2>{g.h4}</h2>
        <p>{g.p5}</p>
        <p>{g.p6}</p>

        <h2>{g.h5}</h2>
        <p>{g.p7}</p>
        <p>{g.p8}</p>

        <div className="blog-cta">
          <p>{g.ctaText}</p>
          <a href="/#request-wrap" className="btn btn-red">{g.ctaBtn}</a>
        </div>
      </div>
    </main>
  );
}
