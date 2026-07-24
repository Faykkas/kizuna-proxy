// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import { ManekiCorner } from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import RequestSection from "../components/sections/RequestSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function RequestClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">願</div>
          <div className="page-head-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>Request</span>
            </nav>
            <h1>Start your <em>request</em></h1>
            <p>Tell us what you want from Japan. Free quote, no commitment, reply within 24 hours.</p>
          </div>
        </header>
        <RequestSection t={t} />
        <ManekiCorner prop="mail" label="Tell us what you want" />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
