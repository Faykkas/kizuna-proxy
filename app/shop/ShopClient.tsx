// @ts-nocheck
"use client";

// Boutique : articles déjà achetés et disponibles à Tokyo. Textes en 12 langues : shopCopy.ts.
// Recherche + tri (filterAndSort, testé), fiche « aperçu » en grand, prix aussi dans la monnaie du visiteur (indicatif).
// Seules les colonnes publiques sont lues : jamais le nom de l'acheteur ni la date d'envoi d'un article vendu.

import { useEffect, useMemo, useRef, useState } from "react";
import { photoHead } from "../lib/pagePhotos";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import CurrencyPicker from "../components/CurrencyPicker";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { supabase } from "../lib/supabase";
import { formatJPY } from "../lib/orderStatus";
import { formatMoney } from "../lib/currency";
import { useCurrency } from "../lib/useCurrency";
import { pricingCopy } from "../pricing/pricingCopy";
import { shopCopy, filterAndSort } from "./shopCopy";

const PUBLIC_COLUMNS = "id,name,image_url,price_jpy,fee_jpy,sort_order,created_at";

const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const IcoSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
const IcoExpand = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
);
const IcoTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
);

export default function ShopClient() {
  const { t, lang } = useLang();
  const c = shopCopy(lang);
  const announce = useAnnounce();
  const cur = useCurrency(lang);
  useScrollReveal();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    supabase.from("shop_items").select(PUBLIC_COLUMNS).eq("available", true).order("sort_order")
      .then(({ data }) => { setItems((data || []).map((i) => ({ ...i, fee_jpy: i.fee_jpy ?? 6000 }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Aperçu : Échap pour fermer, focus sur « Fermer », pas de défilement de la page derrière.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const shown = useMemo(() => filterAndSort(items, query, sort), [items, query, sort]);
  const rate = cur.active && cur.rates ? cur.rates[cur.currency] : null;
  const approx = (jpy) => (rate ? `≈ ${formatMoney(jpy, rate, cur.currency, lang)}` : "");

  // Même formulaire de demande que toutes les commandes, pré-rempli avec l'article.
  function orderHref(item) {
    const params = new URLSearchParams({
      shop_item: item.image_url,
      shop_price: formatJPY(item.price_jpy + item.fee_jpy),
      ...(item.name ? { shop_name: item.name } : {}),
    });
    return `/request?${params.toString()}`;
  }

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head page-head-photo" style={photoHead("shop")}>
          <div className="page-head-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{c.crumb}</span>
            </nav>
            <h1>{c.title} <em>{c.titleEm}</em></h1>
            <p>{c.desc}</p>
            <ul className="sh-trust">
              {c.trust.map((x) => <li key={x}><IcoCheck />{x}</li>)}
            </ul>
          </div>
        </header>

        <section className="section-sm sh-section">
          <div className="wrap">
            <div className="sh-bar">
              <p className="sh-count"><span className="sh-dot" aria-hidden="true" />{c.inStock.replace("{n}", String(items.length))}</p>
              <label className="sh-search">
                <IcoSearch />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} aria-label={c.search} />
              </label>
              <label className="sh-sort">
                <span>{c.sortLabel}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(c.sort).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <CurrencyPicker cur={cur} copy={pricingCopy(lang).cur} lang={lang} />

            {loading ? (
              <div className="sh-grid" aria-busy="true" aria-label={c.loading}>
                {[0, 1, 2, 3].map((i) => <div key={i} className="sh-card sh-skel"><div className="sh-img" /><div className="sh-body"><span /><span /><span /></div></div>)}
              </div>
            ) : items.length === 0 ? (
              <div className="sh-empty">
                <p>{c.empty}</p>
                <a className="btn btn-gold" href="/request">{c.emptyCta}</a>
              </div>
            ) : shown.length === 0 ? (
              <div className="sh-empty"><p>{c.noResults}</p></div>
            ) : (
              <div className="sh-grid">
                {shown.map((item) => {
                  const total = item.price_jpy + item.fee_jpy;
                  return (
                    <article className="sh-card" key={item.id}>
                      <button type="button" className="sh-img" onClick={() => setOpen(item)} aria-label={`${c.details}: ${item.name || ""}`}>
                        <img src={item.image_url} alt={item.name || ""} loading="lazy" />
                        <span className="sh-badge"><span className="sh-dot" aria-hidden="true" />{c.badge}</span>
                        <span className="sh-zoom" aria-hidden="true"><IcoExpand /></span>
                      </button>
                      <div className="sh-body">
                        {item.name ? <h3 title={item.name}>{item.name}</h3> : null}
                        <div className="sh-price">
                          <strong>{formatJPY(total)}</strong>
                          {approx(total) ? <span className="sh-approx">{approx(total)}</span> : null}
                        </div>
                        <p className="sh-split">{c.item} {formatJPY(item.price_jpy)} + {c.fee} {formatJPY(item.fee_jpy)}</p>
                        <a href={orderHref(item)} className="btn btn-gold sh-cta">{c.order}</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="sh-ship"><IcoTruck /><span>{c.shippingNote}</span></p>

            <div className="sh-more">
              <div>
                <h2>{c.more.title}</h2>
                <p>{c.more.text}</p>
              </div>
              <a className="btn btn-gold" href="/request">{c.more.cta} →</a>
            </div>
          </div>
        </section>
      </main>

      {open ? (
        <div className="sh-modal" role="dialog" aria-modal="true" aria-label={open.name || c.details} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="sh-modal-card">
            <button ref={closeRef} type="button" className="sh-close" onClick={() => setOpen(null)} aria-label={c.close}>×</button>
            <div className="sh-modal-img"><img src={open.image_url} alt={open.name || ""} /></div>
            <div className="sh-modal-body">
              <span className="sh-badge sh-badge-inline"><span className="sh-dot" aria-hidden="true" />{c.badge}</span>
              {open.name ? <h3>{open.name}</h3> : null}
              <dl className="sh-lines">
                <div><dt>{c.item}</dt><dd>{formatJPY(open.price_jpy)}</dd></div>
                <div><dt>{c.fee}</dt><dd>{formatJPY(open.fee_jpy)}</dd></div>
                <div className="sh-total"><dt>{c.total}</dt><dd>{formatJPY(open.price_jpy + open.fee_jpy)}{approx(open.price_jpy + open.fee_jpy) ? <small>{approx(open.price_jpy + open.fee_jpy)}</small> : null}</dd></div>
              </dl>
              <a href={orderHref(open)} className="btn btn-gold sh-cta">{c.order}</a>
              <p className="sh-modal-note"><IcoTruck />{c.shippingNote}</p>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
