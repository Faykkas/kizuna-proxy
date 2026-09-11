// @ts-nocheck
"use client";

import { IconInstagram, IconTiktok } from "../ui";
import Maneki from "../pixel/Maneki";
import { IconStore, IconTruck, IconMarketplace, IconCards, IconEvent } from "../pixel/PixelIcons";

export default function HeroSection({ t }: { t: any }) {
  return (
      <section className="hero-center">
        <canvas id="hero-canvas" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />
        <div className="hero-center-inner">
          <div className="hero-kana">絆</div>

          {/* Main headline */}
          <h1 className="hero-h1">
            {t.hero.title1}<br/>
            <em>{t.hero.title2}</em>
          </h1>

          {/* What we do — static and visible on load, not a scrolling
              marquee someone can miss on first paint. */}
          <div className="hero-badges">
            {[
              { Icon: IconCards,       label: t.hero.prop1 || "Pokémon Center drops" },
              { Icon: IconTruck,       label: t.hero.prop2 || "Package forwarding & storage" },
              { Icon: IconEvent,       label: t.hero.prop3 || "Nintendo Tokyo events" },
              { Icon: IconMarketplace, label: t.hero.prop4 || "Mercari & Rakuma" },
              { Icon: IconStore,       label: t.hero.prop5 || "Physical stores in Tokyo" },
            ].map(({ Icon, label }, i) => (
              <span key={i} className="hero-badge">
                <Icon size={18} />
                {label}
              </span>
            ))}
          </div>

          <p className="hero-desc">{t.hero.desc}</p>

          <div className="hero-btns hero-btns-center">
            <a href="/request" className="btn btn-gold">{t.hero.cta}</a>
            <a href="/pricing" className="btn btn-outline">{t.hero.ctaSecondary}</a>
          </div>

          <a
            href="https://fr.trustpilot.com/review/kizunaproxy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-trust-badge"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{color:"#00b67a",flexShrink:0}}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <span className="hero-trust-stars">★★★★★</span>
            <span>{t.hero.trustBadge || "Rated Excellent on Trustpilot"}</span>
          </a>

          <div className="hero-social-row hero-social-center">
            <span className="social-label">{t.hero.followUs}</span>
            <a className="hero-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer"><IconInstagram /></a>
            <a className="hero-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer"><IconTiktok /></a>
          </div>
        </div>
        <button
          className="px-scroll-hint"
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" })}
          aria-label="Scroll down"
        >
          <span>SCROLL</span>
          <span className="px-scroll-hint-arrow" aria-hidden="true" />
        </button>
        <div className="px-mascot-hero">
          <Maneki state="idle" size={130} float />
        </div>
      </section>
  );
}
