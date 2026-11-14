// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { photoHead } from "../lib/pagePhotos";
import { igCopy } from "./igCopy";

export default function IgClient({ posts }) {
  const { lang, t } = useLang();
  const c = igCopy(lang);
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head page-head-photo" style={photoHead("ig")}>
          <div className="page-head-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>Instagram</span>
            </nav>
            <h1>{c.title} <em>{c.titleEm}</em></h1>
            <p>{c.desc}</p>
            <p className="ig-follow"><a href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer">{c.follow} →</a></p>
          </div>
        </header>

        <section className="section-sm">
          <div className="wrap">
            {posts.length === 0 ? (
              <p className="ig-empty">{c.empty}</p>
            ) : (
              <div className="ig-grid">
                {posts.map((p) => {
                  const img = `/api/ig-card?id=${p.id}&v=${encodeURIComponent(p.updated_at)}`;
                  const ask = `/request?q=${encodeURIComponent(p.title)}&link=${encodeURIComponent(p.official_url)}`;
                  return (
                    <article key={p.id} className="ig-card" id={p.id}>
                      <a className="ig-card-img" href={p.official_url} target="_blank" rel="noopener noreferrer nofollow">
                        <img src={img} alt={p.title} width={540} height={675} loading="lazy" />
                      </a>
                      <div className="ig-card-body">
                        <strong>{p.title}</strong>
                        {p.dates || p.place ? <span>{[p.dates, p.place].filter(Boolean).join(" · ")}</span> : null}
                        <div className="ig-card-btns">
                          <a className="btn btn-outline" href={p.official_url} target="_blank" rel="noopener noreferrer nofollow">{c.official} ↗</a>
                          <a className="btn btn-gold" href={ask}>{c.ask}</a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
