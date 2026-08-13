// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import ServicesSection from "../components/sections/ServicesSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function ServicesClient() {
  const { t } = useLang();
  const h = t.pageHeroes?.services || {};
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
            <div className="px-head-mascot">
              <Maneki prop="card" size={86} float />
              <span className="px-head-bubble">{h.bubble || "Your personal shopper in Tokyo"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{t.nav?.services || "Services"}</span>
            </nav>
            <h1>{h.title || "What we buy "}<em>{h.titleEm || "from Japan"}</em></h1>
            <p>{h.desc || "From Japan's biggest marketplaces to exclusive physical stores in Tokyo — we handle sourcing, communication and shipping."}</p>
          </div>
        </header>
        <ServicesSection t={t} />
        <div className="wrap" style={{textAlign:"center",marginBottom:"3rem",fontSize:".82rem"}}>
          Visiting stores in person? See our <a href="/tokyo-in-store-personal-shopper">Tokyo in-store shopper</a> page for details.
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
