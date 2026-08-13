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
  { q: "Can you get me 10 boxes of a hot release?", a: "Not from a single store or visit — Japanese retailers cap purchases per customer, often to 1–3 boxes, and we always respect those limits. A larger order may mean multiple visits across different stores, which we can discuss." },
  { q: "Do you buy rare or vintage cards from Yahoo Auctions?", a: "No — we don't place bids on Yahoo Auctions or any auction platform. We do buy fixed-price listings on Mercari and Rakuma, and can check official retailers and secondhand card shops in Tokyo in person." },
  { q: "Can you ship cards internationally?", a: "Yes — cards are packed securely with tracked, insured shipping to most countries." },
  { q: "Are the cards authentic?", a: "Yes. We buy from official retailers, Pokémon Center, or in person from established stores — never from third-party resellers whose stock we can't verify ourselves." },
  { q: "Can you guarantee stock for a brand-new release?", a: "No. High-demand releases can sell out within minutes at some stores, even in person. We'll always tell you honestly if we couldn't secure it." },
];

export default function CardProxyClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">札</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="card" size={86} float />
              <span className="px-head-bubble">Sourced in Tokyo, shipped worldwide</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>Pokémon & One Piece Card Proxy</span>
            </nav>
            <h1>Pokémon & One Piece <em>card proxy</em> in Japan</h1>
            <p>Official boosters, decks and sealed boxes, sourced from authorized Tokyo retailers — purchase limits respected, no guarantees on high-demand stock.</p>
          </div>
        </header>

        <div className="blog-page">
          <div className="blog-wrap">
            <div className="blog-eyebrow">Trading Card Sourcing · Tokyo</div>

            <h2>What We Buy</h2>
            <p>Pokémon Center exclusive boosters and decks, official Pokémon TCG boosters, elite trainer boxes and special sets, One Piece Card Game boosters, starter decks and special sets, and other official trading card game products available from authorized retailers and stores in Tokyo.</p>

            <h2>How Purchase Limits Work</h2>
            <p>Japanese retailers commonly cap sales per customer — often to one to three boxes — specifically to curb resale and scalping. We respect these limits strictly and never use multiple accounts or identities to bypass them. If your order is larger than a single store&apos;s limit, we&apos;ll tell you upfront and discuss whether multiple visits or stores can help.</p>

            <h2>No Guarantees on High-Demand Releases</h2>
            <p>Some releases sell out within minutes, even for someone buying in person. We can&apos;t promise securing product for a viral release, and we&apos;ll never overstate our chances just to win the order — if we think it&apos;s unlikely, we&apos;ll say so before you pay anything.</p>

            <h2>Receipts & Proof</h2>
            <p>When it&apos;s part of your quote, we photograph the receipt and the product store by store, so you have a clear record of exactly what was bought and where.</p>

            <hr className="blog-hr" />

            <h2>Frequently asked questions</h2>
            <FaqAccordion items={FAQS} />

            <div className="blog-cta">
              <p>Looking for a specific set or booster box?</p>
              <a href="/request" className="btn btn-red">Send a request →</a>
            </div>

            <p style={{ marginTop: "2rem", fontSize: ".82rem" }}>
              Learn more: <a href="/services">what we buy</a> · <a href="/pricing">pricing</a> · <a href="/how-it-works">how it works</a> · <a href="/blog/best-pokemon-cards-japan-2026">Pokémon cards guide</a> · <a href="/reviews">customer reviews</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
