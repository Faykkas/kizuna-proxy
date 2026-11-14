// @ts-nocheck
"use client";

// Accueil « pro » : héros avec barre lien/description + collage de vraies photos, bande des boutiques, catégories en images,
// commandes livrées, avis Reddit, arguments de confiance. Textes : homeCopy.ts (12 langues) + translations.ts. Images : lib/homeImages.ts.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconInstagram, IconTiktok } from "../ui";
import { REAL_REVIEWS } from "../data";
import { homeCopy } from "./homeCopy";
import LinkPreviewCard from "../LinkPreview";
import { HERO_IMAGES, HERO_BG, BAND_BG, CATEGORY_IMAGES, JAPAN_PICKS, DELIVERED, STORES, PHOTO_CREDITS } from "../../lib/homeImages";

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

  function go(e) {
    e.preventDefault();
    const v = q.trim();
    window.location.href = v ? `/request?q=${encodeURIComponent(v)}` : "/request";
  }

  return (
    <section className="hp-hero hp-hero-photo">
      <div className="hp-hero-bg" aria-hidden="true">
        <Image src={HERO_BG} alt="" fill priority sizes="100vw" />
      </div>
      <div className="hp-hero-grid">
        <div className="hp-hero-copy">
          <p className="v3-eyebrow">{h.eyebrow}</p>
          <h1>
            {h.title1} <em>{h.title2}</em>
          </h1>
          <p className="hp-lead">{h.desc}</p>

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
              <span>{h.followUs}</span>
              <a href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </li>
          </ul>
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

export function CategoryGrid({ lang, more = false }: { lang: string; more?: boolean }) {
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
              <Image src={im.src} alt={im.alt} fill sizes="(max-width: 640px) 46vw, (max-width: 1100px) 31vw, 300px" />
              <span className="hp-cat-shade" aria-hidden="true" />
              <span className="hp-cat-body">
                <strong>{c.cats[i]}</strong>
                <em>{c.catCta} →</em>
              </span>
            </a>
          ))}
        </div>
        {more ? <p className="hp-more"><a href="/what-we-buy">{c.seeAll} →</a></p> : null}
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

/** Bandeau photo plein écran (Shibuya la nuit) avec effet de profondeur sur ordinateur. */
export function TokyoBand({ t, lang, steps = false }: { t: any; lang: string; steps?: boolean }) {
  const c = homeCopy(lang);
  const hw = t.howItWorks || {};
  const list = steps ? [1, 2, 3].map((n) => ({ n, title: hw[`step${n}Title`], body: hw[`step${n}Body`] })).filter((x) => x.title) : [];
  return (
    <section className={`hp-band${list.length ? " hp-band-steps" : ""}`} style={{ backgroundImage: `url(${BAND_BG})` }}>
      <div className="hp-band-inner wrap">
        <p className="v3-eyebrow">Tokyo · 東京</p>
        <h2>{c.bandTitle}</h2>
        <p>{c.bandDesc}</p>
        {list.length ? (
          <ol className="hp-band-list">
            {list.map((x) => (
              <li key={x.n}>
                <span className="hp-band-n" aria-hidden="true">{x.n}</span>
                <strong>{x.title}</strong>
                <small>{x.body}</small>
              </li>
            ))}
          </ol>
        ) : null}
        <a href={list.length ? "/how-it-works" : "/request"} className={list.length ? "btn btn-outline hp-band-cta" : "btn btn-gold"}>{list.length ? `${hw.label || "How it works"} →` : `${t.nav?.request || c.searchBtn} →`}</a>
      </div>
    </section>
  );
}

/** Mosaïque des produits phares du Japon : prouve qu'on peut tout chercher. Chaque tuile ouvre une demande pré-remplie. */
export function JapanPicks({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="hp-head">
          <h2>{c.picksTitle}</h2>
          <p>{c.picksSub}</p>
        </div>
        <div className="hp-picks">
          {JAPAN_PICKS.map((im, i) => (
            <a key={im.src} className={`hp-pick${im.big ? " big" : ""}`} href={`/request?q=${encodeURIComponent(c.picks[i] || im.query)}`}>
              <Image src={im.src} alt={im.alt} fill sizes={im.big ? "(max-width: 700px) 92vw, 560px" : "(max-width: 700px) 46vw, 280px"} />
              <span className="hp-cat-shade" aria-hidden="true" />
              <span className="hp-pick-label">{c.picks[i]}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Crédit des photographes Unsplash (bas de l'accueil). */
export function PhotoCredits({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  return (
    <p className="hp-credits">
      {c.photos} : {PHOTO_CREDITS.join(", ")} ·{" "}
      <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
    </p>
  );
}

/** Compte animé de 0 à la valeur quand le bloc entre à l'écran. */
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(to); return; }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}</span>;
}

/** Bandeau de preuve : vrais chiffres (commandes livrées, pays) depuis /api/stats, délai de réponse, avis. */
export function StatsBar({ lang }: { lang: string }) {
  const c = homeCopy(lang);
  const [data, setData] = useState<{ delivered: number; countries: number } | null>(null);
  useEffect(() => {
    let off = false;
    fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off && j && typeof j.delivered === "number") setData(j); }).catch(() => {});
    return () => { off = true; };
  }, []);
  const items = [
    data ? { v: <><CountUp to={data.delivered} /></>, l: c.stats[0] } : null,
    data ? { v: <><CountUp to={data.countries} /></>, l: c.stats[1] } : null,
    { v: "< 24h", l: c.stats[2] },
    { v: "5.0 ★", l: c.stats[3] },
  ].filter(Boolean);
  return (
    <section className="hp-stats-wrap">
      <div className="wrap">
        <ul className="hp-stats">
          {items.map((x, i) => (
            <li key={i}>
              <strong>{x.v}</strong>
              <span>{x.l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
