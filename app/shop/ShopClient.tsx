// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { supabase } from "../lib/supabase";
import { formatJPY } from "../lib/orderStatus";

// Flat fee per article — same constant as the admin's Boutique tab. Items
// themselves are already secured (bought/reserved), so there's no travel or
// reservation fee here, just the standard per-article handling fee.
const SHOP_FEE_JPY = 6000;

export default function ShopClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("shop_items").select("*").eq("available", true).order("sort_order")
      .then(({ data }) => { setItems(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Sends the client to the same request form as every other order,
  // pre-filled with the item so we know exactly what they mean — instead of
  // a mailto, which skips the tracked requests table entirely.
  function orderHref(item) {
    const total = item.price_jpy + SHOP_FEE_JPY;
    const params = new URLSearchParams({
      shop_item: item.image_url,
      shop_price: formatJPY(total),
      ...(item.name ? { shop_name: item.name } : {}),
    });
    return `/request?${params.toString()}`;
  }

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">店</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="bag" size={86} float />
              <span className="px-head-bubble">Ready to ship</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>Shop</span>
            </nav>
            <h1>Items <em>ready to ship</em></h1>
            <p>Already secured in Japan — no waiting on a store visit or a lottery. First come, first served.</p>
          </div>
        </header>

        <section className="section reveal">
          <div className="wrap">
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--warm)", padding: "3rem 0" }}>Loading…</p>
            ) : items.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--warm)", padding: "3rem 0" }}>
                Nothing in stock right now — check back soon, or <a href="/request">send us a request</a> for anything specific.
              </p>
            ) : (
              <div className="tarif-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {items.map(item => (
                  <div className="tarif-card" key={item.id} style={{ gap: ".9rem" }}>
                    <img
                      src={item.image_url}
                      alt={item.name || ""}
                      style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }}
                    />
                    {item.name && <strong style={{ fontSize: ".88rem", color: "var(--ink)", lineHeight: 1.4 }}>{item.name}</strong>}
                    <div className="tarif-lines" style={{ gap: ".4rem" }}>
                      <div className="tarif-line" style={{ borderTop: "none", paddingTop: 0 }}>
                        <div className="tarif-line-top">
                          <span className="tarif-line-label">Item</span>
                          <span className="tarif-line-price" style={{ fontSize: "1rem" }}>{formatJPY(item.price_jpy)}</span>
                        </div>
                      </div>
                      <div className="tarif-line">
                        <div className="tarif-line-top">
                          <span className="tarif-line-label">Kizuna fee</span>
                          <span className="tarif-line-price" style={{ fontSize: "1rem" }}>{formatJPY(SHOP_FEE_JPY)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px dashed var(--border-gold)", paddingTop: ".6rem" }}>
                      <strong style={{ fontSize: ".8rem", color: "var(--ink)" }}>Total</strong>
                      <strong style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.3rem", color: "var(--red)" }}>{formatJPY(item.price_jpy + SHOP_FEE_JPY)}</strong>
                    </div>
                    <a href={orderHref(item)} className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}>Order this item</a>
                  </div>
                ))}
              </div>
            )}

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>International shipping isn't included — the price depends on weight and is given when your package is prepared for shipping.</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
