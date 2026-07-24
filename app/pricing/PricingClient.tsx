// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import { ManekiCorner } from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import PricingSection from "../components/sections/PricingSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function PricingClient() {
  const { t } = useLang();
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
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>Pricing</span>
            </nav>
            <h1>Fully <em>personalised</em></h1>
            <p>Every request is unique. No hidden fees, and a detailed quote within 24 hours.</p>
          </div>
        </header>
        <PricingSection t={t} />
        <ManekiCorner prop="coins" label="Free quote in 24h" />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
