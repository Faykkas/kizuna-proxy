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
  { q: "Do you guarantee you'll find the item?", a: "No. We confirm what we can before going, but availability is never guaranteed until we've physically checked the shelf — items can sell out or be relisted without notice." },
  { q: "Can you visit stores outside Tokyo?", a: "Right now, in-person visits are limited to Tokyo. If your item is only available in another city, tell us — we may still be able to source it through the store's online listing or a domestic marketplace." },
  { q: "How much does a store visit cost?", a: "It's a personalised quote based on the store, location, and how much time the visit takes — there's no flat rate. The service fee is paid upfront to reserve the visit. See our pricing page for details." },
  { q: "What if the item is sold out when you arrive?", a: "The visit fee still applies, since it covers our time and transport rather than the item itself. We'll never buy anything without your confirmation first." },
  { q: "Do you use multiple accounts to get around store purchase limits?", a: "No. We always respect the purchase limits a store sets, per customer, per visit." },
];

export default function TokyoInStoreClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">店</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="card" size={86} float />
              <span className="px-head-bubble">In-store, in person</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>In-Store Personal Shopper</span>
            </nav>
            <h1>Your in-store <em>personal shopper</em> in Tokyo</h1>
            <p>Some things you can only get by walking into the store. We&apos;re a real, physically-based team in Tokyo who visit shops for you — no warehouse, no bot.</p>
          </div>
        </header>

        <div className="blog-page">
          <div className="blog-wrap">
            <div className="blog-eyebrow">Physical Store Visits · Tokyo</div>

            <h2>What This Service Actually Covers</h2>
            <p>We visit physical retail stores across Tokyo on your behalf — electronics and card shops in Akihabara, fashion in Shibuya and Harajuku, collectibles at Nakano Broadway, secondhand chains like Mandarake, Suruga-ya and Book Off, official stores like Pokémon Center and Nintendo TOKYO, and department stores across the city. If it has a physical location in Tokyo, we can likely go.</p>

            <h2>How a Store Visit Works</h2>
            <ul className="blog-list">
              <li><strong>Send the details</strong> — the store, the item, and any size, quantity or reference number you know.</li>
              <li><strong>We quote the visit</strong> — based on the store, location, and how much time it&apos;ll take. No universal flat price.</li>
              <li><strong>You pay upfront</strong> — the visit fee reserves your request before we go, since it covers our time and transport either way.</li>
              <li><strong>We go, check, and report back</strong> — photos of the shelf, the price, and the item&apos;s condition before we buy anything.</li>
              <li><strong>We buy and ship</strong> — once you confirm, we purchase, photograph the receipt, and prepare it for shipping.</li>
            </ul>

            <h2>Live Communication While We Shop</h2>
            <p>We keep you posted over WhatsApp, Discord or email while we&apos;re in the store, and for some visits we can do a live video call so you can effectively shop with us in real time — pointing at what you want, asking us to check a size or a shelf.</p>

            <h2>What We Can&apos;t Promise</h2>
            <p>We&apos;re honest about the limits of this service. Availability is never guaranteed until we&apos;ve actually checked or purchased the item — stock can be gone by the time we arrive. We always respect store-imposed purchase limits and never use multiple accounts or identities to get around them. Some products — tobacco, weapons, and anything that can&apos;t legally be shipped — we won&apos;t buy at all; batteries, liquids and similar regulated goods are reviewed case by case.</p>

            <hr className="blog-hr" />

            <h2>Frequently asked questions</h2>
            <FaqAccordion items={FAQS} />

            <div className="blog-cta">
              <p>Have a specific store or item in mind?</p>
              <a href="/request" className="btn btn-red">Send a request →</a>
            </div>

            <p style={{ marginTop: "2rem", fontSize: ".82rem" }}>
              Learn more: <a href="/services">what we buy</a> · <a href="/pricing">pricing</a> · <a href="/how-it-works">how it works</a> · <a href="/reviews">customer reviews</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
