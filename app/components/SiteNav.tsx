// @ts-nocheck
// app/components/SiteNav.tsx
"use client";

import { useState } from "react";
import { copy as t } from "../translations";

const BLOG_ITEMS = [
  { href:"/blog/how-to-buy-from-mercari-japan",    emoji:"🛍️", label:"Mercari Japan" },
  { href:"/blog/yahoo-auctions-japan-guide",        emoji:"🏷️", label:"Yahoo Auctions" },
  { href:"/blog/best-pokemon-cards-japan-2026",     emoji:"🎴", label:"Pokémon Cards" },
  { href:"/blog/pokemon-center-tokyo-exclusives",   emoji:"⭐", label:"Pokémon Center" },
  { href:"/blog/supreme-japan-drops-guide",         emoji:"👕", label:"Supreme Japan" },
  { href:"/blog/nike-japan-exclusives-guide",       emoji:"👟", label:"Nike Japan" },
  { href:"/blog/anime-figures-japan-guide",         emoji:"🗿", label:"Anime Figures" },
  { href:"/blog/japanese-trading-cards-guide-2026", emoji:"🃏", label:"Trading Cards" },
  { href:"/blog/japan-shipping-guide-2026",         emoji:"📦", label:"Shipping Guide" },
];

export default function SiteNav() {
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGuidesOpen, setMobileGuidesOpen] = useState(false);


  return (
    <nav>
      <div className="nav-inner">

        {/* ── Logo ── */}
        <a href="/" className="logo">
          <img src="/logo.png" alt="Kizuna Proxy" style={{height:"42px",width:"42px",imageRendering:"pixelated"}} />
          <div>
            <div className="logo-name"><span className="g">Kizuna</span> Proxy</div>
            <div className="logo-sub">Tokyo Proxy Service</div>
          </div>
        </a>

        {/* ── Desktop links ── */}
        <ul className="nav-links">
          <li><a href="/services">{t.nav?.services || "Services"}</a></li>
          <li><a href="/pricing">{t.nav.pricing}</a></li>
          <li><a href="/how-it-works">{t.nav?.howItWorks || "How it works"}</a></li>
          <li><a href="/reviews">{t.nav?.reviews || "Reviews"}</a></li>
          <li><a href="/faq">{t.nav.faq || "FAQ"}</a></li>
          <li><a href="/events">{t.nav?.events || "Events"} 🎌</a></li>

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

        {/* ── Desktop controls ── */}
        <div className="nav-controls">
          <a href="/request" className="nav-cta">{t.nav.request}</a>
          {/* Burger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu">
            <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"transform .2s",transform:mobileOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
            <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"opacity .2s",opacity:mobileOpen?0:1}}/>
            <span style={{display:"block",width:"20px",height:"1.5px",background:"var(--ink)",transition:"transform .2s",transform:mobileOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="mobile-menu">

          {/* Nav links */}
          <a href="/services" onClick={() => setMobileOpen(false)}>{t.nav?.services || "Services"}</a>
          <a href="/pricing" onClick={() => setMobileOpen(false)}>{t.nav.pricing}</a>
          <a href="/how-it-works" onClick={() => setMobileOpen(false)}>{t.nav?.howItWorks || "How it works"}</a>
          <a href="/reviews" onClick={() => setMobileOpen(false)}>{t.nav?.reviews || "Reviews"}</a>
          <a href="/faq" onClick={() => setMobileOpen(false)}>{t.nav.faq || "FAQ"}</a>
          <a href="/events" onClick={() => setMobileOpen(false)}>{t.nav?.events || "Events"} 🎌</a>

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
                    onClick={() => setMobileOpen(false)}>
                    {item.emoji} {item.label}
                  </a>
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
  );
}
