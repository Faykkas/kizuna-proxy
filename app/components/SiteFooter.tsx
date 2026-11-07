// @ts-nocheck
"use client";

// Pied de page « pro » : marque + réseaux, 4 colonnes de liens, bandeau paiement/expédition, barre légale.
// Titres : navFooterCopy.ts (12 langues). Libellés de liens : translations.ts (t.nav, t.footerNav…).

import Image from "next/image";
import { IconInstagram, IconTiktok } from "./ui";
import { reopenCookiePreferences } from "./CookieConsent";
import { useLanguage } from "../lib/language";
import { couponsCopy } from "../coupons/couponsCopy";
import { footerCopy } from "./navFooterCopy";
import { homeCopy } from "./sections/homeCopy";

const GUIDES = [
  { href: "/blog/how-to-buy-from-mercari-japan", label: "Mercari Japan Guide" },
  { href: "/blog/yahoo-auctions-japan-guide", label: "Yahoo Auctions Guide" },
  { href: "/blog/best-pokemon-cards-japan-2026", label: "Pokémon Cards Japan" },
  { href: "/blog/nike-japan-exclusives-guide", label: "Nike Japan Exclusives" },
  { href: "/blog/anime-figures-japan-guide", label: "Anime Figures Japan" },
  { href: "/blog/buy-coach-bags-japan", label: "Coach Bags Japan" },
  { href: "/blog/japan-shipping-guide-2026", label: "Shipping Guide 2026" },
  { href: "/blog/japan-package-forwarding-guide", label: "Package Forwarding & Storage" },
];

export default function SiteFooter({ t }: { t: any }) {
  const { lang } = useLanguage();
  const f = footerCopy(lang);
  const h = homeCopy(lang);
  return (
    <footer className="fx">
      <div className="fx-grid">
        <div className="fx-brand">
          <div className="footer-logo-wrap">
            <Image src="/logo.png" alt="Kizuna Proxy" width={38} height={38} style={{imageRendering:"pixelated"}} />
            <div className="footer-logo"><span className="g">Kizuna</span> Proxy</div>
          </div>
          <p className="footer-tagline">{t.footerNav?.tagline || "Tokyo-based proxy service. Your trusted link to Japan."}</p>
          <a className="fx-trust" href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer">
            <span className="v3-stars" aria-hidden="true">★★★★★</span>
            <span>{t.hero?.trustBadge || "Trustpilot"}</span>
          </a>
          <div className="footer-social">
            <a className="footer-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram size={15} /></a>
            <a className="footer-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok size={15} /></a>
          </div>
        </div>

        <div>
          <p className="footer-col-title">{f.shop}</p>
          <a href="/shop" className="footer-link">{t.nav?.shop || "Shop"}</a>
          <a href="/services" className="footer-link">{t.nav?.services || "Services"}</a>
          <a href="/pricing" className="footer-link">{t.nav?.pricing || "Pricing"}</a>
          <a href="/shipping" className="footer-link">{t.nav?.shipping || "Shipping"}</a>
          <a href="/reservation-assistance" className="footer-link">Reservation Assistance</a>
          <a href="/coupons" className="footer-link">{couponsCopy(lang).nav}</a>
          <a href="/tokyo-in-store-personal-shopper" className="footer-link">Tokyo In-Store Shopper</a>
          <a href="/business-sourcing" className="footer-link">Business Sourcing</a>
        </div>

        <div>
          <p className="footer-col-title">{f.help}</p>
          <a href="/how-it-works" className="footer-link">{t.footerNav?.howItWorks || "How it works"}</a>
          <a href="/faq" className="footer-link">{t.nav?.faq || "FAQ"}</a>
          <a href="/good-to-know" className="footer-link">{t.serviceRules?.label || "Good to know"}</a>
          <a href="/why-kizuna" className="footer-link">{t.whyKizunaHome?.label || "Why Kizuna"}</a>
          <a href="/reviews" className="footer-link">{t.footerNav?.reviews || "Reviews"}</a>
          <a href="/news" className="footer-link">Announcements</a>
          <a href="/events" className="footer-link">{t.footerNav?.events || "Tokyo Events"}</a>
        </div>

        <div>
          <p className="footer-col-title">{f.guides}</p>
          {GUIDES.map(g => <a key={g.href} href={g.href} className="footer-link">{g.label}</a>)}
          <a href="/blog" className="footer-link fx-more">{f.allGuides} →</a>
        </div>

        <div>
          <p className="footer-col-title">{f.contact}</p>
          <a href="/request" className="btn btn-gold fx-cta">{t.nav?.request || f.request}</a>
          <a href="mailto:kizunaproxy@gmail.com" className="footer-link">kizunaproxy@gmail.com</a>
          <a href="https://wa.me/819044595568" target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
          <a href="https://discord.com/users/Faykas" target="_blank" rel="noopener noreferrer" className="footer-link">Discord</a>
          <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer" className="footer-link">Trustpilot</a>
        </div>
      </div>

      <div className="fx-badges">
        <span className="fx-badges-title">{f.pay}</span>
        <ul>
          <li>PayPal</li>
          <li>EMS</li>
          <li>Yamato</li>
          <li>{h.trust[1].t}</li>
          <li>Tokyo, Japan</li>
        </ul>
      </div>

      <div className="footer-bottom">
        <p>{t.footer?.rights}</p>
        <p style={{ display: "flex", gap: ".8rem", alignItems: "center", flexWrap: "wrap" }}>
          <a href="/privacy-policy" className="footer-link" style={{ fontSize: "inherit", margin: 0 }}>Privacy &amp; Cookies</a>
          <button
            type="button"
            onClick={() => reopenCookiePreferences()}
            className="footer-link"
            style={{ fontSize: "inherit", background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0, margin: 0 }}
          >
            Cookie preferences
          </button>
        </p>
        <p>kizunaproxy.com</p>
      </div>
    </footer>
  );
}
