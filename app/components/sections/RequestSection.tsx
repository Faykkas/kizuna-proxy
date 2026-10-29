// @ts-nocheck
"use client";

import RequestForm from "../RequestForm";

export default function RequestSection({ t, asPage = false }: { t: any; asPage?: boolean }) {
  const H = asPage ? "h1" : "h2";
  return (
      <section id="request-wrap" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.request?.label}</p>
            <H>{t.request?.title} <em>{t.request?.titleEm}</em></H>
            <p className="desc">{t.request?.desc}</p>
          </div>
          <div className="req-layout">
            <div className="req-side">
              <p>{t.request?.sideDesc}</p>
              {[
                { title: t.request?.detail1Title, sub: t.request?.detail1Sub },
                { title: t.request?.detail2Title, sub: t.request?.detail2Sub },
                { title: t.request?.detail3Title, sub: t.request?.detail3Sub },
                { title: t.request?.detail4Title, sub: t.request?.detail4Sub },
              ].map(d => (
                <div key={d.title} className="req-detail">
                  <div className="rd-dot" />
                  <div className="rd-text"><strong>{d.title}</strong><span>{d.sub}</span></div>
                </div>
              ))}
            </div>
            <RequestForm t={t} />
          </div>
        </div>
      </section>
  );
}
