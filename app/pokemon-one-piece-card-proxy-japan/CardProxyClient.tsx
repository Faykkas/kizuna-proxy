// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import FaqAccordion from "../components/FaqAccordion";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { landingTranslations } from "../landingTranslations";

export default function CardProxyClient({ locale } = {}) {
  const { lang, t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  const data = landingTranslations.cardProxy;
  const g = data[locale || lang] || data.en;

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">札</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="card" size={86} float />
              <span className="px-head-bubble">{g.bubble}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{g.breadcrumb}</span>
            </nav>
            <h1>{g.h1a}<em>{g.h1em}</em>{g.h1b}</h1>
            <p>{g.lead}</p>
          </div>
        </header>

        <div className="blog-page">
          <div className="blog-wrap">
            <div className="blog-eyebrow">{g.eyebrow}</div>

            <h2>{g.h2_1}</h2>
            <p>{g.p1}</p>

            <h2>{g.h2_2}</h2>
            <p>{g.p2}</p>

            <h2>{g.h2_3}</h2>
            <p>{g.p3}</p>

            <h2>{g.h2_4}</h2>
            <p>{g.p4}</p>

            <hr className="blog-hr" />

            <h2>{g.faqTitle}</h2>
            <FaqAccordion items={g.faqs} />

            <div className="blog-cta">
              <p>{g.ctaText}</p>
              <a href="/request" className="btn btn-red">{g.ctaBtn}</a>
            </div>

            <p style={{ marginTop: "2rem", fontSize: ".82rem" }}>
              {g.linksLabel} <a href="/services">{g.linkServices}</a> · <a href="/pricing">{g.linkPricing}</a> · <a href="/how-it-works">{g.linkHiw}</a> · <a href="/blog/best-pokemon-cards-japan-2026">{g.linkGuide}</a> · <a href="/reviews">{g.linkReviews}</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
