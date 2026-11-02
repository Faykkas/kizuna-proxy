// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import PricingGuide from "../components/sections/PricingGuide";
import { pricingCopy } from "./pricingCopy";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function PricingClient() {
  const { t, lang } = useLang();
  const copy = pricingCopy(lang);
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">価</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="coins" size={86} float />
              <span className="px-head-bubble">{copy.hero.bubble}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{t.nav?.pricing || "Pricing"}</span>
            </nav>
            <h1>{copy.hero.title}<em>{copy.hero.titleEm}</em></h1>
            <p>{copy.hero.desc}</p>
          </div>
        </header>
        <PricingGuide t={t} />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
