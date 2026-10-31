// @ts-nocheck
"use client";

// Pages « Pourquoi Kizuna » et « Bon à savoir » : les blocs qui étaient sur l'accueil, maintenant chacun sur sa page.
// Les textes viennent de translations.ts (t.whyKizunaHome / t.serviceRules), déjà traduits en 12 langues.

import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import AnnounceBar from "./AnnounceBar";
import Maneki from "./pixel/Maneki";
import WhyKizunaHomeSection from "./sections/WhyKizunaHomeSection";
import ServiceRulesSection from "./sections/ServiceRulesSection";
import { BackToTop, useScrollReveal } from "./ui";
import { useLang, useAnnounce } from "./useSiteState";

export default function InfoPage({ which }: { which: "why" | "rules" }) {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();
  const s = which === "why" ? t.whyKizunaHome || {} : t.serviceRules || {};

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop={which === "why" ? "heart" : "sign"} size={86} float />
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{s.label}</span>
            </nav>
            <h1>{s.title} <em>{s.titleEm}</em></h1>
            {s.desc ? <p>{s.desc}</p> : null}
          </div>
        </header>
        {which === "why" ? <WhyKizunaHomeSection t={t} asPage /> : <ServiceRulesSection t={t} asPage />}
        <section className="section reveal">
          <div className="wrap">
            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>{t.pricing?.ctaTitle || "Ready to place a request?"}</strong>
                <p>{t.pricing?.ctaDesc || "Describe your item and we'll get back to you with a personalised quote."}</p>
              </div>
              <a href="/request" className="btn btn-gold">{t.nav.request}</a>
              <a href="/pricing" className="btn btn-outline">{t.hero?.ctaSecondary || "See pricing"}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
