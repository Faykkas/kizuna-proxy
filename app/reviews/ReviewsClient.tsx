// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import ReviewsSection from "../components/sections/ReviewsSection";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function ReviewsClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">信</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="heart" size={86} float />
              <span className="px-head-bubble">Thanks for the love</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>Reviews</span>
            </nav>
            <h1>Trusted by <em>collectors worldwide</em></h1>
            <p>Verified reviews from customers in the USA, Canada, France, Germany, Greece, Indonesia and beyond.</p>
          </div>
        </header>
        <ReviewsSection t={t} />
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
