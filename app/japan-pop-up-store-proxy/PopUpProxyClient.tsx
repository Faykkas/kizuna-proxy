// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import FaqAccordion from "../components/FaqAccordion";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

const FAQS = [
  { q: "Can you guarantee you'll get the item before it sells out?", a: "No. Pop-ups and limited drops can sell out within minutes, and we can only queue and buy once we're physically there — nothing is guaranteed in advance." },
  { q: "Do you queue overnight for drops?", a: "It depends on the event — tell us the details and we'll let you know what's realistic and what it would cost." },
  { q: "What if I don't know the exact release time?", a: "Tell us what you know — the brand, the collab, the venue if you have it — and we'll research the rest before confirming a quote." },
  { q: "Can you ship the item within Japan?", a: "Yes — if you're based in Japan, we can ship domestically to your address instead of internationally." },
  { q: "Do you respect store purchase limits at pop-ups?", a: "Always. We never use multiple accounts or identities to buy more than a store's stated per-customer limit." },
];

export default function PopUpProxyClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">催</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="card" size={86} float />
              <span className="px-head-bubble">We queue so you don&apos;t</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>Pop-Up Store Proxy</span>
            </nav>
            <h1>Your proxy for Japan <em>pop-up stores</em></h1>
            <p>Limited drops, collabs and temporary event stores don&apos;t restock. We queue and buy in person, in Tokyo, on your behalf.</p>
          </div>
        </header>

        <div className="blog-page">
          <div className="blog-wrap">
            <div className="blog-eyebrow">Pop-Ups & Limited Drops · Tokyo</div>

            <h2>What Counts as a Pop-Up</h2>
            <p>Brand collabs, anime and game tie-in stores, seasonal event pop-ups, exclusive merchandise counters, and convention or expo booths — anything temporary, in Tokyo, selling something that won&apos;t be restocked once it&apos;s gone.</p>

            <h2>What We Need From You</h2>
            <ul className="blog-list">
              <li><strong>Exact item name or reference</strong> — the more specific, the better our chances.</li>
              <li><strong>Size, if applicable</strong> — apparel and figures often come in limited size runs.</li>
              <li><strong>Quantity you want</strong> — within whatever limit the store sets per customer.</li>
              <li><strong>Event dates and times</strong> — pop-ups can run for a single day or a limited window.</li>
              <li><strong>Store or venue location</strong> — a link or address if you have one.</li>
              <li><strong>Your maximum budget</strong> — including our fee, so we can confirm before buying.</li>
            </ul>

            <h2>Why Details Matter So Much</h2>
            <p>Pop-ups often sell out within hours of opening, sometimes minutes for the most sought-after items. We usually can&apos;t call ahead to check stock, so the more precise your request, the faster we can move once we&apos;re there.</p>

            <h2>Availability Is Never Guaranteed</h2>
            <p>We&apos;re upfront about this: no pop-up or limited release can be promised in advance. We&apos;ll always respect the store&apos;s purchase limits per customer and never use multiple accounts or identities to buy more than allowed — even if that means we can&apos;t fulfil your full request.</p>

            <h2>Storage & Shipping</h2>
            <p>Once purchased, items are held securely in Tokyo, consolidated with any other orders, and shipped internationally — or domestically within Japan if that&apos;s where you&apos;re based.</p>

            <hr className="blog-hr" />

            <h2>Frequently asked questions</h2>
            <FaqAccordion items={FAQS} />

            <div className="blog-cta">
              <p>Have a pop-up or drop coming up?</p>
              <a href="/request" className="btn btn-red">Send a request →</a>
            </div>

            <p style={{ marginTop: "2rem", fontSize: ".82rem" }}>
              Learn more: <a href="/services">what we buy</a> · <a href="/pricing">pricing</a> · <a href="/how-it-works">how it works</a> · <a href="/events">Tokyo events</a> · <a href="/reviews">customer reviews</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
