// @ts-nocheck
"use client";

import { IconInstagram, IconTiktok } from "../ui";

export default function HeroSection({ t }: { t: any }) {
  return (
      <section className="hero-center">
        <canvas id="hero-canvas" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />
        <div className="hero-center-inner">
          <div className="hero-kana">絆</div>

          {/* Rotating badge */}
          <div className="hero-badge-row">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">{t.hero.eyebrow}</span>
          </div>

          {/* Main headline */}
          <h1 className="hero-h1">
            {t.hero.title1}<br/>
            <em>{t.hero.title2}</em>
          </h1>

          {/* Animated rotating value props */}
          <div className="hero-rotating-wrap">
            <div className="hero-rotating-track">
              {[
                t.hero.prop1 || "Pokémon Center drops",
                t.hero.prop2 || "Supreme Japan exclusives",
                t.hero.prop3 || "Nintendo Tokyo events",
                t.hero.prop4 || "Mercari & Yahoo Auctions",
                t.hero.prop5 || "Any store in Tokyo",
              ].map((prop, i) => (
                <span key={i} className="hero-rotating-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--red)" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                  {prop}
                </span>
              ))}
              {[
                t.hero.prop1 || "Pokémon Center drops",
                t.hero.prop2 || "Supreme Japan exclusives",
                t.hero.prop3 || "Nintendo Tokyo events",
                t.hero.prop4 || "Mercari & Yahoo Auctions",
                t.hero.prop5 || "Any store in Tokyo",
              ].map((prop, i) => (
                <span key={`b${i}`} className="hero-rotating-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--red)" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                  {prop}
                </span>
              ))}
            </div>
          </div>

          <p className="hero-desc">{t.hero.desc}</p>

          <div className="hero-btns hero-btns-center">
            <a href="/request" className="btn btn-gold">{t.hero.cta}</a>
            <a href="/pricing" className="btn btn-outline">{t.hero.ctaSecondary}</a>
          </div>

          <div className="hero-social-row hero-social-center">
            <span className="social-label">{t.hero.followUs}</span>
            <a className="hero-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer"><IconInstagram /></a>
            <a className="hero-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer"><IconTiktok /></a>
          </div>
        </div>
      </section>
  );
}
