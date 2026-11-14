// @ts-nocheck
"use client";

// Accueil « histoire » : 4 blocs alternés image / texte, beaucoup d'air.
//   1. En-tête : promesse + grande barre (fiche produit instantanée) | photo d'Akihabara + une vraie commande livrée
//   2. Tout le Japon : 4 photos | catégories en pastilles + lien vers /what-we-buy
//   3. Une vraie personne à Tokyo : 3 étapes | photo de Shibuya
//   4. Les preuves : 4 vraies commandes livrées | chiffres réels + 2 avis
// Textes : homeCopy.ts + translations.ts (12 langues). Images : lib/homeImages.ts.

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconInstagram, IconTiktok } from "../ui";
import { REAL_REVIEWS } from "../data";
import { homeCopy } from "./homeCopy";
import LinkPreviewCard from "../LinkPreview";
import { HERO_BG, BAND_BG, HERO_IMAGES, DELIVERED } from "../../lib/homeImages";

const JAPAN_MOSAIC = [
  { src: "/photos/pokemon-cards-pokeball.jpg", alt: "Japanese trading cards" },
  { src: "/photos/one-piece-figures.jpg", alt: "Anime figures" },
  { src: "/photos/coach-tag.jpg", alt: "Designer leather bag" },
  { src: "/photos/vintage-camera.jpg", alt: "Vintage Japanese camera" },
];

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function cleanCountry(s: string) {
  return s.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/\s+/g, " ").trim().replace(/^to /, "");
}

/** 1. En-tête partagé en deux : texte et recherche à gauche, photo à droite. */
export function StoryHero({ t, lang }: { t: any; lang: string }) {
  const h = t.hero || {};
  const c = homeCopy(lang);
  const [q, setQ] = useState("");
  const proof = HERO_IMAGES[0];
  function go(e) {
    e.preventDefault();
    const v = q.trim();
    window.location.href = v ? `/request?q=${encodeURIComponent(v)}` : "/request";
  }
  return (
    <section className="st-hero">
      <div className="st-grid">
        <div className="st-copy">
          <p className="v3-eyebrow">{h.eyebrow}</p>
          <h1>
            {h.title1} <em>{h.title2}</em>
          </h1>
          <p className="st-lead">{h.desc}</p>
          <form className="hp-search" onSubmit={go} role="search">
            <span className="hp-search-icon"><SearchIcon /></span>
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} aria-label={c.searchPh} autoComplete="off" />
            <button type="submit" className="btn btn-gold">{c.searchBtn}</button>
          </form>
          <LinkPreviewCard raw={q} lang={lang} variant="hero" />
          <p className="hp-search-hint">{c.searchHint}</p>
          <ul className="v3-trust">
            <li>
              <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer">
                <span className="v3-stars" aria-hidden="true">★★★★★</span>
                <span>{h.trustBadge}</span>
              </a>
            </li>
            <li className="v3-social">
              <a href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </li>
          </ul>
        </div>
        <div className="st-visual">
          <div className="st-photo st-photo-tall">
            <Image src={HERO_BG} alt="Akihabara, Tokyo, at night" fill priority sizes="(max-width: 900px) 92vw, 560px" />
          </div>
          <figure className="st-proof">
            <div className="st-proof-img">
              <Image src={proof.src} alt={proof.alt} fill sizes="160px" />
            </div>
            <figcaption>
              <span className="st-dot" aria-hidden="true" />
              {c.delBadge}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/** 2. Tout le Japon : mosaïque de 4 photos à gauche, catégories en pastilles à droite. */
export function StoryJapan({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  const chips = [...c.cats, ...c.picks.slice(0, 6)];
  return (
    <section className="st-block reveal">
      <div className="st-grid">
        <div className="st-mosaic">
          {JAPAN_MOSAIC.map((im) => (
            <div key={im.src} className="st-mosaic-cell">
              <Image src={im.src} alt={im.alt} fill sizes="(max-width: 900px) 46vw, 280px" />
            </div>
          ))}
        </div>
        <div className="st-copy">
          <h2>{c.picksTitle}</h2>
          <p className="st-lead">{c.picksSub}</p>
          <ul className="st-chips">
            {chips.map((label) => (
              <li key={label}>
                <a href={`/request?q=${encodeURIComponent(label)}`}>{label}</a>
              </li>
            ))}
          </ul>
          <a className="st-link" href="/what-we-buy">{c.seeAll} →</a>
        </div>
      </div>
    </section>
  );
}

/** 3. Une vraie personne à Tokyo : texte + 3 étapes à gauche, photo de Shibuya à droite. */
export function StoryTokyo({ t, lang }: { t: any; lang: string }) {
  const c = homeCopy(lang);
  const hw = t.howItWorks || {};
  const steps = [1, 2, 3].map((n) => ({ n, title: hw[`step${n}Title`], body: hw[`step${n}Body`] })).filter((s) => s.title);
  return (
    <section className="st-block reveal">
      <div className="st-grid st-rev">
        <div className="st-photo">
          <Image src={BAND_BG} alt="Shibuya, Tokyo, at night" fill sizes="(max-width: 900px) 92vw, 560px" />
        </div>
        <div className="st-copy">
          <p className="v3-eyebrow">Tokyo · 東京</p>
          <h2>{c.bandTitle}</h2>
          <p className="st-lead">{c.bandDesc}</p>
          <ol className="st-steps">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="st-step-n" aria-hidden="true">{s.n}</span>
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.body}</small>
                </span>
              </li>
            ))}
          </ol>
          <a className="st-link" href="/how-it-works">{hw.label || "How it works"} →</a>
        </div>
      </div>
    </section>
  );
}

/** 4. Les preuves : vraies commandes livrées à gauche, chiffres réels + 2 avis à droite. */
export function StoryProof({ t, lang }: { t: any; lang: string }) {
  const c = homeCopy(lang);
  const [data, setData] = useState<{ delivered: number; countries: number } | null>(null);
  useEffect(() => {
    let off = false;
    fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off && j && typeof j.delivered === "number") setData(j); }).catch(() => {});
    return () => { off = true; };
  }, []);
  const stats = [
    data ? { v: String(data.delivered), l: c.stats[0] } : null,
    data ? { v: String(data.countries), l: c.stats[1] } : null,
    { v: "< 24h", l: c.stats[2] },
    { v: "5.0 ★", l: c.stats[3] },
  ].filter(Boolean);
  const reviews = REAL_REVIEWS.slice(0, 2);
  return (
    <section className="st-block reveal">
      <div className="st-grid">
        <div className="st-delivered">
          {DELIVERED.slice(0, 4).map((d) => (
            <figure key={d.src} className="st-delivered-cell">
              <Image src={d.src} alt={d.alt} fill sizes="(max-width: 900px) 46vw, 280px" />
              <figcaption><span className="st-dot" aria-hidden="true" />{c.delBadge}</figcaption>
            </figure>
          ))}
        </div>
        <div className="st-copy">
          <h2>{c.delTitle}</h2>
          <p className="st-lead">{c.delSub}</p>
          <ul className="st-stats">
            {stats.map((s, i) => (
              <li key={i}>
                <strong>{s.v}</strong>
                <span>{s.l}</span>
              </li>
            ))}
          </ul>
          <div className="st-reviews">
            {reviews.map((r, i) => (
              <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="st-review">
                <p>&ldquo;{r.text}&rdquo;</p>
                <span>{r.name} · {cleanCountry(r.country)} · Reddit</span>
              </a>
            ))}
          </div>
          <a className="st-link" href="/reviews">{c.revCta} →</a>
        </div>
      </div>
    </section>
  );
}
