// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function HowItWorksClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">道</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="sign" size={86} float />
              <span className="px-head-bubble">Three steps, that's it</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>How it works</span>
            </nav>
            <h1>Simple as sending <em>a message</em></h1>
            <p>From your first message to delivery at your door — three steps, real people in Tokyo.</p>
          </div>
        </header>
        <HowItWorksSection t={t} />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
