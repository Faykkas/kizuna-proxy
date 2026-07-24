// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import ServicesSection from "../components/sections/ServicesSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function ServicesClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">商</div>
          <div className="page-head-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>Services</span>
            </nav>
            <h1>What we buy <em>from Japan</em></h1>
            <p>From the biggest marketplaces to exclusive physical stores — if it exists in Japan, we can get it.</p>
          </div>
        </header>
        <ServicesSection t={t} />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
