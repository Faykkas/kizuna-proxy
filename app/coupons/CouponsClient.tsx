// @ts-nocheck
"use client";

// Rubrique « Coupons » : comment obtenir un coupon (Noël, avis Trustpilot, avis Reddit) et comment l'utiliser sur la page de paiement.
// Textes en 12 langues : couponsCopy.ts. Montants affichés aussi dans la monnaie du visiteur (indicatif, les paiements restent en JPY).

import SiteNav from "../components/SiteNav";
import Maneki from "../components/pixel/Maneki";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import CurrencyPicker from "../components/CurrencyPicker";
import { Icon } from "../components/PricingIcons";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { useCurrency } from "../lib/useCurrency";
import { hasYen } from "../lib/currency";
import { pricingCopy } from "../pricing/pricingCopy";
import { couponsCopy } from "./couponsCopy";

const MAIL = "mailto:kizunaproxy@gmail.com?subject=Review%20coupon";
const CARD_ICONS = ["gift", "shield", "chat"];

export default function CouponsClient() {
  const { t, lang } = useLang();
  const c = couponsCopy(lang);
  const cur = useCurrency(lang);
  const announce = useAnnounce();
  useScrollReveal();
  const local = (text: string) => (cur.active && hasYen(text) ? cur.conv(text) : "");

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">券</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="coins" size={86} float />
              <span className="px-head-bubble">{c.hero.bubble}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{c.nav}</span>
            </nav>
            <h1>{c.hero.title}<em>{c.hero.titleEm}</em></h1>
            <p>{c.hero.desc}</p>
          </div>
        </header>

        <section className="section-sm pg-section reveal">
          <div className="wrap">
            <CurrencyPicker cur={cur} copy={pricingCopy(lang).cur} lang={lang} />
            <div className="pg-grid">
              {c.cards.map((card, i) => (
                <article key={card.title} className={`pg-card${i === 0 ? " pg-card-featured" : ""}`}>
                  <div className="pg-card-head">
                    <span className="pg-ico"><Icon name={CARD_ICONS[i]} /></span>
                    <h3>{card.title}</h3>
                  </div>
                  <span className="cp-tag">{card.tag}</span>
                  <div className="pg-price cp-amount">{card.amount}</div>
                  {local(card.amount) ? <div className="pg-local">≈ {local(card.amount)}</div> : null}
                  <div className="pg-body">
                    <p>{card.text}</p>
                    {card.code ? (
                      <p className="cp-code-row">
                        <span>{card.codeLabel}</span>
                        <code className="cp-code">{card.code}</code>
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
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
              {c.how.steps.map(([title, body], i) => (
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
            <div className="sec-head">
              <p className="sec-label">{c.rules.label}</p>
              <h2>{c.rules.title}</h2>
            </div>
            <ul className="pg-terms">
              {c.rules.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
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
              <a href="/request" className="btn btn-gold">{c.final.cta1}</a>
              <a href={MAIL} className="btn btn-outline">{c.final.cta2}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
