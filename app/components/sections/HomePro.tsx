// @ts-nocheck
"use client";

// Accueil « pro » : héros avec barre lien/description + collage de vraies photos, bande des boutiques, catégories en images,
// commandes livrées, avis Reddit, arguments de confiance. Textes : homeCopy.ts (12 langues) + translations.ts. Images : lib/homeImages.ts.

import { useState } from "react";
import Image from "next/image";
import Maneki from "../pixel/Maneki";
import { IconInstagram, IconTiktok } from "../ui";
import { REAL_REVIEWS } from "../data";
import { homeCopy } from "./homeCopy";
import { HERO_IMAGES, CATEGORY_IMAGES, DELIVERED, STORES } from "../../lib/homeImages";

// « 🇯🇵 to 🇺🇸 USA » → « USA » (les drapeaux emoji ne s'affichent pas sous Windows)
function cleanCountry(s: string) {
  return s.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/\s+/g, " ").trim().replace(/^to /, "");
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const TRUST_ICONS = [
  <svg key="a" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  <svg key="b" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>,
  <svg key="c" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  <svg key="d" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></svg>,
];

export function HeroPro({ t, lang }: { t: any; lang: string }) {
  const h = t.hero || {};
  const c = homeCopy(lang);
  const [q, setQ] = useState("");
  const [happy, setHappy] = useState(false);

  function go(e) {
    e.preventDefault();
    const v = q.trim();
    window.location.href = v ? `/request?q=${encodeURIComponent(v)}` : "/request";
  }

  return (
    <section className="hp-hero">
      <div className="hp-hero-grid">
        <div className="hp-hero-copy">
          <p className="v3-eyebrow">{h.eyebrow}</p>
          <h1>
            {h.title1} <em>{h.title2}</em>
          </h1>
          <p className="hp-lead">{h.desc}</p>

          <form className="hp-search" onSubmit={go} onFocus={() => setHappy(true)} onBlur={() => setHappy(false)} role="search">
            <span className="hp-search-icon"><SearchIcon /></span>
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} aria-label={c.searchPh} autoComplete="off" />
            <button type="submit" className="btn btn-gold">{c.searchBtn}</button>
          </form>
          <p className="hp-search-hint">{c.searchHint}</p>

          <ul className="v3-trust">
            <li>
              <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer">
                <span className="v3-stars" aria-hidden="true">★★★★★</span>
                <span>{h.trustBadge}</span>
              </a>
            </li>
            <li className="v3-social">
              <span>{h.followUs}</span>
              <a href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </li>
          </ul>
        </div>

        <div className="hp-collage" aria-hidden={false}>
          <div className="hp-collage-glow" aria-hidden="true" />
          {HERO_IMAGES.map((im, i) => (
            <figure key={im.src + i} className={`hp-shot hp-shot-${i + 1}`}>
              <Image src={im.src} alt={im.alt} fill sizes="(max-width: 900px) 46vw, 300px" priority={i === 0} />
              <figcaption>{im.place ? `${c.delBadge} · ${im.place}` : c.delBadge}</figcaption>
            </figure>
          ))}
          <div className="hp-collage-mascot">
            <Maneki state={happy ? "success" : "idle"} prop="bag" size={104} float />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StoresStrip({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <section className="hp-stores reveal">
      <div className="wrap">
        <div className="hp-stores-head">
          <h2>{c.storesTitle}</h2>
          <p>{c.storesNote}</p>
        </div>
        <ul className="hp-store-list">
          {STORES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CategoryGrid({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="hp-head">
          <h2>{c.catTitle}</h2>
          <p>{c.catSub}</p>
        </div>
        <div className="hp-cats">
          {CATEGORY_IMAGES.map((im, i) => (
            <a key={im.src + i} className="hp-cat" href={`/request?q=${encodeURIComponent(c.cats[i] || im.query)}`}>
              <Image src={im.src} alt={im.alt} fill sizes="(max-width: 640px) 46vw, (max-width: 1100px) 31vw, 380px" />
              <span className="hp-cat-shade" aria-hidden="true" />
              <span className="hp-cat-body">
                <strong>{c.cats[i]}</strong>
                <em>{c.catCta} →</em>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeliveredGrid({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="hp-head">
          <h2>{c.delTitle}</h2>
          <p>{c.delSub}</p>
        </div>
        <div className="hp-deliv">
          {DELIVERED.map((d, i) => (
            <article key={d.src + i} className="hp-card">
              <div className="hp-card-img">
                <Image src={d.src} alt={d.alt} fill sizes="(max-width: 640px) 46vw, (max-width: 1100px) 31vw, 280px" />
                <span className="hp-card-badge">{c.delBadge}</span>
              </div>
              <div className="hp-card-body">
                <strong>{d.title}</strong>
                {d.place ? <span>{d.place}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsHome({ t, lang }: { t: any; lang: string }) {
  const c = homeCopy(lang);
  const list = REAL_REVIEWS.slice(0, 6);
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="hp-head">
          <h2>{t.reviews?.title} <em>{t.reviews?.titleEm}</em></h2>
          <p>{t.reviews?.basedOn}</p>
        </div>
        <div className="hp-reviews">
          {list.map((r, i) => (
            <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="hp-review">
              <span className="v3-stars" aria-hidden="true">{"★".repeat(r.stars)}</span>
              <p>&ldquo;{r.text}&rdquo;</p>
              <footer>
                <span className="hp-avatar">{r.name.replace("u/", "").charAt(0).toUpperCase()}</span>
                <span><b>{r.name}</b><small>{cleanCountry(r.country)} · Reddit</small></span>
              </footer>
            </a>
          ))}
        </div>
        <p className="v3-steps-more"><a href="/reviews">{c.revCta} →</a></p>
      </div>
    </section>
  );
}

export function TrustBand({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <ul className="hp-trust">
          {c.trust.map((x, i) => (
            <li key={i}>
              <span className="hp-trust-icon">{TRUST_ICONS[i]}</span>
              <span><strong>{x.t}</strong><small>{x.d}</small></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
