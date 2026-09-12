// @ts-nocheck
"use client";

import { IconInstagram, IconTiktok } from "../ui";
import Maneki from "../pixel/Maneki";
import { IconStore, IconTruck, IconMarketplace } from "../pixel/PixelIcons";

export default function HeroSection({ t }: { t: any }) {
  return (
      <section className="hero-center">
        <canvas id="hero-canvas" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />

        {/* Kept as a real (but visually hidden) h1 for SEO/accessibility —
            every page needs exactly one, but the tagline itself reads as
            filler now that the explainer + events content leads the page. */}
        <h1 className="sr-only">{t.hero.title1} {t.hero.title2}</h1>

        <div className="hero-topright">
          <Maneki state="idle" size={72} float />
          <span className="hero-kizuna-mark">Kizuna</span>
        </div>

        <div className="hero-center-inner">
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

          {/* Our services, at a glance — three clickable pillars instead of
              a row of plain badges, each linking straight to where you can
              act on it. */}
          <div className="hero-services">
            {[
              { Icon: IconStore,       title: t.hero.prop5 || "Physical stores in Tokyo", desc: "We visit stores, pop-ups & events for you", href: "/services" },
              { Icon: IconTruck,       title: t.hero.prop2 || "Package forwarding & storage", desc: "We hold your purchases until you're ready", href: "/blog/japan-package-forwarding-guide" },
              { Icon: IconMarketplace, title: "Online orders from Japan", desc: "Famous Japanese sites & marketplaces, ordered and shipped for you", href: "/blog/how-to-buy-from-mercari-japan" },
            ].map(({ Icon, title, desc, href }, i) => (
              <a key={i} href={href} className="hero-service-card">
                <Icon size={30} />
                <strong>{title}</strong>
                <span>{desc}</span>
              </a>
            ))}
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
