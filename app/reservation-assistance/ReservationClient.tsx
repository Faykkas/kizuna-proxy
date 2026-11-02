// @ts-nocheck
"use client";

// Page /reservation-assistance : aide aux réservations d'hôtels et de restaurants au Japon (¥1,500 par demande).
// Séparée des tarifs d'achat. Textes dans les 12 langues : reservationCopy.ts (prix et conditions du cahier des charges, rien d'ajouté).

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import CurrencyPicker from "../components/CurrencyPicker";
import { Icon } from "../components/PricingIcons";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { useCurrency } from "../lib/useCurrency";
import { pricingCopy } from "../pricing/pricingCopy";
import { reservationCopy } from "./reservationCopy";

const MAIL = "mailto:kizunaproxy@gmail.com?subject=Reservation%20assistance%20request";

export default function ReservationClient() {
  const { t, lang } = useLang();
  const c = reservationCopy(lang);
  const cur = useCurrency(lang);
  const announce = useAnnounce();
  useScrollReveal();
  const local = cur.active ? cur.conv("¥1,500") : "";

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">予</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="sign" size={86} float />
              <span className="px-head-bubble">{c.bubble}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><a href="/pricing">{t.nav?.pricing || "Pricing"}</a><span>/</span><span>{c.crumb}</span>
            </nav>
            <h1>{c.title}<em>{c.titleEm}</em></h1>
            <p>{c.desc}</p>
          </div>
        </header>

        <section className="section-sm pg-section reveal">
          <div className="wrap">
            <CurrencyPicker cur={cur} copy={pricingCopy(lang).cur} lang={lang} />
            <div className="pg-grid">
              <article className="pg-card pg-card-featured">
                <div className="pg-card-head">
                  <span className="pg-ico"><Icon name="calendar" /></span>
                  <h3>{c.card.title}</h3>
                </div>
                <div className="pg-price">¥1,500</div>
                {local ? <div className="pg-local">≈ {local}</div> : null}
                <p className="pg-sub">{c.card.sub}</p>
                <div className="pg-body">
                  <p>{c.card.t1}</p>
                  <p>{c.card.t2}</p>
                </div>
                <a className="btn btn-gold pg-cta" href={MAIL}>{c.card.cta}</a>
              </article>
            </div>
          </div>
        </section>

        <section className="section-sm pg-section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{c.how.label}</p>
              <h2>{c.how.title}</h2>
            </div>
            <ol className="pg-steps">
              {c.steps.map(([title, body], i) => (
                <li key={title}>
                  <span className="pg-step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-sm pg-section reveal">
          <div className="wrap">
            <div className="pg-split">
              <div className="pg-panel">
                <div className="pg-panel-head"><span className="pg-ico pg-ico-sm"><Icon name="clipboard" size={18} /></span><h3>{c.info.title}</h3></div>
                <p>{c.info.intro}</p>
                <ul className="pg-list">{c.info.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
              <div className="pg-panel">
                <div className="pg-panel-head"><span className="pg-ico pg-ico-sm"><Icon name="shield" size={18} /></span><h3>{c.cond.title}</h3></div>
                <ul className="pg-list">{c.cond.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm pg-section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{c.faq.label}</p>
              <h2>{c.faq.title}</h2>
            </div>
            <div className="pg-faq">
              {c.faq.items.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm reveal">
          <div className="wrap">
            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>{c.final.title}</strong>
                <p>{c.final.text}</p>
              </div>
              <a href={MAIL} className="btn btn-gold">{c.final.cta}</a>
              <a href="/pricing" className="btn btn-outline">{c.final.all}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
