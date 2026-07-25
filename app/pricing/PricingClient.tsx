// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import PricingSection from "../components/sections/PricingSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function PricingClient() {
  const { t } = useLang();
  const h = t.pageHeroes?.pricing || {};
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
              <span className="px-head-bubble">{h.bubble || "Free quote in 24h"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{t.nav?.pricing || "Pricing"}</span>
            </nav>
            <h1>{h.title || "Fully "}<em>{h.titleEm || "personalised"}</em></h1>
            <p>{h.desc || "Every request is unique. No hidden fees, and a detailed quote within 24 hours."}</p>
          </div>
        </header>
        <PricingSection t={t} />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
