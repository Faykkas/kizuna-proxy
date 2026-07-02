// @ts-nocheck
// app/components/SiteNav.tsx
"use client";

import { useState, useEffect } from "react";
import { translations, detectLang, LANG_LABELS } from "../translations";

const BLOG_ITEMS = [
  { href:"/blog/how-to-buy-from-mercari-japan",    emoji:"🛍️", label:"Mercari Japan" },
  { href:"/blog/yahoo-auctions-japan-guide",        emoji:"🏷️", label:"Yahoo Auctions" },
  { href:"/blog/best-pokemon-cards-japan-2026",     emoji:"🎴", label:"Pokémon Cards 2026" },
  { href:"/blog/pokemon-center-tokyo-exclusives",   emoji:"⭐", label:"Pokémon Center Tokyo" },
  { href:"/blog/supreme-japan-drops-guide",         emoji:"👕", label:"Supreme Japan Drops" },
  { href:"/blog/nike-japan-exclusives-guide",       emoji:"👟", label:"Nike Japan Exclusives" },
  { href:"/blog/anime-figures-japan-guide",         emoji:"🗿", label:"Anime Figures Japan" },
  { href:"/blog/japanese-trading-cards-guide-2026", emoji:"🃏", label:"Japanese Trading Cards" },
  { href:"/blog/japan-shipping-guide-2026",         emoji:"📦", label:"Japan Shipping Guide" },
];

export default function SiteNav() {
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-lang");
    setLang(saved || detectLang());
  }, []);

  function switchLang(l: string) {
    setLang(l);
    localStorage.setItem("kizuna-lang", l);
    setLangOpen(false);
    // Reload so translated content updates
    window.location.reload();
  }

  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <nav>
      <div className="nav-inner">
        {/* Logo */}
        <a href="/" className="logo">
          <img src="/logo.png" alt="Kizuna Proxy" style={{height:"42px",width:"auto",objectFit:"contain"}} />
          <div>
            <div className="logo-name"><span className="g">Kizuna</span> Proxy</div>
            <div className="logo-sub">Tokyo Proxy Service</div>
          </div>
        </a>

        {/* Links */}
        <ul className="nav-links">
          <li><a href="/#pricing">{t.nav.pricing}</a></li>
          <li><a href="/faq">{t.nav.faq || "FAQ"}</a></li>
          {/* Guides dropdown */}
          <li className="nav-dropdown-wrap"
            onMouseEnter={() => setGuidesOpen(true)}
            onMouseLeave={() => setGuidesOpen(false)}>
            <button className="nav-dropdown-btn">
              {t.blog?.label || "Guides"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{marginLeft:".3rem",transition:"transform .2s",transform:guidesOpen?"rotate(180deg)":"rotate(0)"}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {guidesOpen && (
              <div className="nav-dropdown">
                {BLOG_ITEMS.map(item => (
                  <a key={item.href} href={item.href} className="nav-dropdown-item">
                    <span className="nav-dropdown-emoji">{item.emoji}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Controls */}
        <div className="nav-controls">
          <a href="/#request-wrap" className="nav-cta">{t.nav.request}</a>

          {/* Lang selector */}
          <div className="lang-selector">
            <button className="icon-btn lang-btn" onClick={() => setLangOpen(v => !v)}>
              <span style={{fontSize:".65rem",letterSpacing:".1em"}}>{LANG_LABELS[lang] || lang.toUpperCase()}</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {langOpen && (
              <>
                <div style={{position:"fixed",inset:0,zIndex:199}} onClick={() => setLangOpen(false)} />
                <div className="lang-dropdown">
                  {Object.keys(LANG_LABELS).map(l => (
                    <button key={l} className={`lang-option${l === lang ? " active" : ""}`}
                      onClick={() => switchLang(l)}>
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <a href="/#pricing" onClick={() => setMobileOpen(false)}>{t.nav.pricing}</a>
          <a href="/faq" onClick={() => setMobileOpen(false)}>{t.nav.faq || "FAQ"}</a>
          <div className="mobile-menu-section">
            <span className="mobile-menu-section-title">{t.blog?.label || "Guides"}</span>
            {BLOG_ITEMS.map(item => (
              <a key={item.href} href={item.href} className="mobile-menu-guide" onClick={() => setMobileOpen(false)}>
                {item.emoji} {item.label}
              </a>
            ))}
          </div>
          <a href="/#request-wrap" className="nav-cta" style={{textAlign:"center"}} onClick={() => setMobileOpen(false)}>
            {t.nav.request}
          </a>
        </div>
      )}
    </nav>
  );
}
