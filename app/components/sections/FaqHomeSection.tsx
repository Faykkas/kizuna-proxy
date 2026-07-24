// @ts-nocheck
"use client";

import FaqSection from "../FaqSection";

export default function FaqHomeSection({ t }: { t: any }) {
  return (
      <section id="faq" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.faq?.label}</p>
            <h2>{t.faq?.title} <em>{t.faq?.titleEm}</em></h2>
          </div>
          <FaqSection t={t} />
        </div>
      </section>
  );
}
