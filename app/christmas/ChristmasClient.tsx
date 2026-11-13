// @ts-nocheck
"use client";

// Page /christmas : en-tête avec compte à rebours + quiz cadeau, code de Noël, pourquoi Kizuna, étapes, appel final.

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import StepsV3 from "../components/sections/StepsV3";
import Maneki from "../components/pixel/Maneki";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { xmasCopy } from "./xmasCopy";
import { XmasCountdown, XmasCodeCard, XmasQuiz } from "./XmasParts";

const WHY_ICONS = ["✦", "◎", "✈"];

export default function ChristmasClient() {
  const { lang, t } = useLang();
  const c = xmasCopy(lang);
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <section className="xm-hero">
          <div className="xm-hero-grid">
            <div className="xm-hero-copy">
              <div className="xm-hero-mascot">
                <Maneki state="success" prop="bag" size={88} float />
                <span className="xm-badge">🎄 {c.badge}</span>
              </div>
              <h1>
                {c.title} <em>{c.titleEm}</em>
              </h1>
              <p className="xm-lead">{c.desc}</p>
              <p className="xm-count-label">{c.chip}</p>
              <XmasCountdown lang={lang} size="lg" />
              <XmasCodeCard lang={lang} />
            </div>
            <div className="xm-hero-quiz">
              <XmasQuiz lang={lang} />
            </div>
          </div>
        </section>

        <section className="section-sm reveal">
          <div className="wrap">
            <div className="hp-head">
              <h2>{c.whyTitle}</h2>
            </div>
            <ul className="xm-why">
              {c.why.map((w, i) => (
                <li key={i}>
                  <span className="xm-why-icon" aria-hidden="true">{WHY_ICONS[i]}</span>
                  <p>{w}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <StepsV3 t={t} />

        <section className="section reveal">
          <div className="wrap">
            <div className="xm-final">
              <div>
                <h2>{c.finalTitle}</h2>
                <p>{c.finalDesc}</p>
              </div>
              <XmasCountdown lang={lang} size="md" />
              <div className="xm-final-btns">
                <a href="#quiz" className="btn btn-gold">{c.bandCta}</a>
                <a href="/request" className="btn btn-outline">{t.nav?.request}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
