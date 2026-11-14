// @ts-nocheck
// app/components/SiteNav.tsx
"use client";

// Menu « pro » : fine barre d'infos (confiance + langue + compte), rangée principale (logo, barre « lien ou description », bouton de demande),
// puis bande de liens façon place de marché. La bande se replie quand on fait défiler la page. Mobile : burger.
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language";
import { LANG_LABELS } from "../translations";
import { useAuth } from "../lib/auth";
import { homeCopy } from "./sections/homeCopy";
import LinkPreviewCard from "./LinkPreview";
import { couponsCopy } from "../coupons/couponsCopy";
import { xmasCopy } from "../christmas/xmasCopy";
import { XmasChip, useXmasOn } from "../christmas/XmasParts";
import {
  IconShoppingBag, IconAuction, IconCards, IconStore, IconApparel,
  IconSneaker, IconFigure, IconBox, IconEvent, IconBusiness, IconBook,
  IconGacha, IconMusicNote, IconTruck,
} from "./pixel/PixelIcons";

const BLOG_ITEMS = [
  { href:"/blog/how-to-buy-from-mercari-japan",    Icon:IconShoppingBag, label:"Mercari Japan" },
  { href:"/blog/yahoo-auctions-japan-guide",        Icon:IconAuction,     label:"Yahoo Auctions" },
  { href:"/blog/best-pokemon-cards-japan-2026",     Icon:IconCards,       label:"Pokémon Cards" },
  { href:"/blog/pokemon-center-tokyo-exclusives",   Icon:IconStore,       label:"Pokémon Center" },
  { href:"/blog/supreme-japan-drops-guide",         Icon:IconApparel,     label:"Supreme Japan" },
  { href:"/blog/nike-japan-exclusives-guide",       Icon:IconSneaker,     label:"Nike Japan" },
  { href:"/blog/anime-figures-japan-guide",         Icon:IconFigure,      label:"Anime Figures" },
  { href:"/blog/japanese-trading-cards-guide-2026", Icon:IconCards,       label:"Trading Cards" },
  { href:"/blog/japan-shipping-guide-2026",         Icon:IconBox,         label:"Shipping Guide" },
  { href:"/tokyo-in-store-personal-shopper",        Icon:IconStore,       label:"In-Store Shopper" },
  { href:"/japan-pop-up-store-proxy",               Icon:IconEvent,       label:"Pop-Up Store Proxy" },
  { href:"/pokemon-one-piece-card-proxy-japan",     Icon:IconCards,       label:"Card Proxy" },
  { href:"/business-sourcing",                      Icon:IconBusiness,    label:"Business Sourcing" },
  { href:"/blog/comiket-japan-guide",               Icon:IconBook,        label:"Comiket Guide" },
  { href:"/blog/comitia-japan-guide",               Icon:IconBook,        label:"COMITIA Guide" },
  { href:"/blog/ichiban-kuji-japan-guide",          Icon:IconGacha,       label:"Ichiban Kuji" },
  { href:"/blog/tokyo-anime-events-guide",          Icon:IconEvent,       label:"Tokyo Anime Events" },
  { href:"/blog/agf-ikebukuro-animate-girls-festival-2026", Icon:IconEvent, label:"AGF 2026 Ikebukuro" },
  { href:"/blog/resident-evil-30th-anniversary-exhibition-tokyo", Icon:IconEvent, label:"Resident Evil 30th" },
  { href:"/blog/order-christmas-gifts-from-japan-2026", Icon:IconEvent, label:"Christmas Orders" },
  { href:"/blog/starbucks-japan-christmas-2026-collection", Icon:IconShoppingBag, label:"Starbucks Christmas" },
  { href:"/blog/fukubukuro-japan-lucky-bags-2027-guide", Icon:IconGacha, label:"Fukubukuro 2027" },
  { href:"/blog/kpop-photocards-japan-guide",       Icon:IconMusicNote,   label:"K-pop Photocards" },
  { href:"/blog/japan-package-forwarding-guide",    Icon:IconTruck,       label:"Package Forwarding" },
  { href:"/blog/tokyo-discreet-pickup-service",     Icon:IconShoppingBag, label:"Discreet Pickup" },
  { href:"/blog/buy-coach-bags-japan",              Icon:IconShoppingBag, label:"Coach Bags" },
];

const SEARCH_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Barre « collez un lien ou décrivez l'article » : envoie vers /request avec la description déjà remplie
function NavSearch({ lang, className = "" }: { lang: string; className?: string }) {
  const c = homeCopy(lang);
  const [q, setQ] = useState("");
  function go(e) {
    e.preventDefault();
    const v = q.trim();
    window.location.href = v ? `/request?q=${encodeURIComponent(v)}` : "/request";
  }
  return (
    <div className={`nav-search-wrap ${className}`}>
      <form className="nav-search" onSubmit={go} role="search">
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} aria-label={c.searchPh} autoComplete="off" />
        <button type="submit" aria-label={c.searchBtn}>{SEARCH_SVG}</button>
      </form>
      <LinkPreviewCard raw={q} lang={lang} variant={className.includes("mobile") ? "form" : "nav"} />
    </div>
  );
}

export default function SiteNav() {
  const { user } = useAuth();
  const { lang, setLang, t, supported } = useLanguage();
  const pathname = usePathname() || "/";
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGuidesOpen, setMobileGuidesOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const langRef = useRef(null);
  const c = homeCopy(lang);
  const xmasOn = useXmasOn();

  // Click-to-open instead of hover: reaching a specific item among 12
  // languages means crossing the gap between the button and the list, and
  // hover-close was firing before the click landed. A click outside is what
  // closes it now.
  useEffect(() => {
    if (!langOpen) return;
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  const links = [
    ...(xmasOn ? [{ href: "/christmas", label: `🎄 ${xmasCopy(lang).nav}`, xmas: true }] : []),
    { href: "/shop", label: t.nav?.shop || "Shop", badge: "NEW" },
    { href: "/services", label: t.nav?.services || "Services" },
    { href: "/pricing", label: t.nav?.pricing || "Pricing" },
    { href: "/shipping", label: t.nav?.shipping || "Shipping" },
    { href: "/how-it-works", label: t.nav?.howItWorks || "How it works" },
    { href: "/reviews", label: t.nav?.reviews || "Reviews" },
    { href: "/coupons", label: couponsCopy(lang).nav },
    { href: "/events", label: t.nav?.events || "Events" },
    { href: "/faq", label: t.nav?.faq || "FAQ" },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Barre d'infos ── */}
      <div className="nav-util">
        <div className="nav-util-inner">
          {xmasOn ? <XmasChip lang={lang} /> : <p className="nav-util-msg">
            <span className="nav-util-dot" aria-hidden="true" />
            {c.trust[0].t}
            <span className="nav-util-sep" aria-hidden="true">·</span>
            {c.trust[1].t}
          </p>}
          <div className="nav-util-right">
            <div className="nu-lang" ref={langRef}>
              <button className="nu-lang-btn" aria-label="Language" aria-expanded={langOpen} onClick={() => setLangOpen(v => !v)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>{LANG_LABELS[lang] || lang.toUpperCase()}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {supported.map(code => (
                    <button
                      key={code}
                      className={`lang-option${code === lang ? " active" : ""}`}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                    >
                      {LANG_LABELS[code] || code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="/account" className="nav-util-link">{user ? (t.nav?.myOrders || "My orders") : (t.nav?.signIn || "Sign in")}</a>
          </div>
        </div>
      </div>

      <nav>
        <div className="nav-inner">

          {/* ── Logo ── */}
          <a href="/" className="logo">
            <img src="/logo.svg" alt="Kizuna Proxy" width={42} height={42} className="logo-mark-svg" />
            <div>
              <div className="logo-name"><span className="g">Kizuna</span> Proxy</div>
              <div className="logo-sub">Tokyo Proxy Service</div>
            </div>
          </a>

          {/* ── Barre lien / description ── */}
          <NavSearch lang={lang} className="nav-search-desktop" />

          {/* ── Boutons ── */}
          <div className="nav-controls">
            <a href="/request" className="nav-cta nav-cta-main">{t.nav.request}</a>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu" aria-expanded={mobileOpen}>
              <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"transform .2s",transform:mobileOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
              <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"opacity .2s",opacity:mobileOpen?0:1}}/>
              <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"transform .2s",transform:mobileOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="mobile-menu">
            <NavSearch lang={lang} className="nav-search-mobile" />

            {/* Nav links */}
            {links.map(l => (
              <a key={l.href} href={l.href} className={l.badge ? "nav-shop-link" : undefined} onClick={() => setMobileOpen(false)}>
                {l.label}{l.badge ? <span className="nav-shop-badge">{l.badge}</span> : null}
              </a>
            ))}

            {/* Guides accordion */}
            <div>
              <button
                onClick={() => setMobileGuidesOpen(v => !v)}
                style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  width:"100%",background:"none",border:"none",padding:".5rem 0",
                  fontSize:".75rem",letterSpacing:".14em",textTransform:"uppercase",
                  color:"var(--warm)",cursor:"pointer",fontFamily:"'Inter',sans-serif",
                  borderBottom:"1px solid var(--border)",
                }}>
                {t.blog?.label || "Guides"}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{transition:"transform .2s",transform:mobileGuidesOpen?"rotate(180deg)":"rotate(0)"}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {mobileGuidesOpen && (
                <div style={{paddingLeft:"1rem",paddingTop:".25rem"}}>
                  {BLOG_ITEMS.map(item => (
                    <a key={item.href} href={item.href} className="mobile-menu-guide"
                      onClick={() => setMobileOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <item.Icon size={18} /> {item.label}
                    </a>
                  ))}
                  <a href="/blog" className="mobile-menu-guide"
                    onClick={() => setMobileOpen(false)}
                    style={{ fontWeight: 600 }}>
                    All Guides →
                  </a>
                </div>
              )}
            </div>
            {/* Account */}
            <a href="/account" onClick={() => setMobileOpen(false)}>{user ? (t.nav?.myOrders || "My orders") : (t.nav?.signIn || "Sign in")}</a>
            {/* Language accordion */}
            <div>
              <button
                onClick={() => setMobileLangOpen(v => !v)}
                style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  width:"100%",background:"none",border:"none",padding:".5rem 0",
                  fontSize:".75rem",letterSpacing:".14em",textTransform:"uppercase",
                  color:"var(--warm)",cursor:"pointer",fontFamily:"'Inter',sans-serif",
                  borderBottom:"1px solid var(--border)",
                }}>
                {LANG_LABELS[lang] || lang.toUpperCase()}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{transition:"transform .2s",transform:mobileLangOpen?"rotate(180deg)":"rotate(0)"}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {mobileLangOpen && (
                <div style={{paddingLeft:"1rem",paddingTop:".25rem",display:"flex",flexDirection:"column"}}>
                  {supported.map(code => (
                    <button
                      key={code}
                      className="mobile-menu-guide"
                      style={{
                        background:"none", border:"none", textAlign:"left", cursor:"pointer",
                        color: code === lang ? "var(--red)" : "var(--warm)",
                      }}
                      onClick={() => { setLang(code); setMobileLangOpen(false); }}
                    >
                      {LANG_LABELS[code] || code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <a href="/request" className="nav-cta"
              style={{textAlign:"center",display:"block",marginTop:".5rem"}}
              onClick={() => setMobileOpen(false)}>
              {t.nav.request}
            </a>
          </div>
        )}
      </nav>

      {/* ── Bande de liens (ordinateur) ── */}
      <div className="nav-strip">
        <ul className="nav-strip-inner">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={`ns-link${isActive(l.href) ? " active" : ""}${l.badge ? " ns-shop" : ""}${l.xmas ? " ns-xmas" : ""}`} aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}{l.badge ? <span className="nav-shop-badge">{l.badge}</span> : null}
              </a>
            </li>
          ))}

          {/* Guides dropdown: blog articles only — everything else stays a direct link */}
          <li className="nav-dropdown-wrap"
            onMouseEnter={() => setGuidesOpen(true)}
            onMouseLeave={() => setGuidesOpen(false)}>
            <button className="ns-link ns-guides" aria-expanded={guidesOpen}>
              {t.blog?.label || "Guides"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                style={{marginLeft:".35rem",transition:"transform .2s",transform:guidesOpen?"rotate(180deg)":"rotate(0)"}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {guidesOpen && (
              <div className="nav-dropdown">
                {BLOG_ITEMS.map(item => (
                  <a key={item.href} href={item.href} className="nav-dropdown-item">
                    <span className="nav-dropdown-emoji"><item.Icon size={20} /></span>
                    <span>{item.label}</span>
                  </a>
                ))}
                <a href="/blog" className="nav-dropdown-item" style={{ borderTop: "1px solid var(--border)", fontWeight: 600 }}>
                  <span>All Guides →</span>
                </a>
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}
