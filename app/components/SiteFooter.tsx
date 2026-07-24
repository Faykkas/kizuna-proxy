// @ts-nocheck
"use client";

import { IconInstagram, IconTiktok } from "./ui";

export default function SiteFooter({ t }: { t: any }) {
  return (
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo-wrap">
              <img src="/logo.png" alt="Kizuna Proxy" style={{height:"34px",width:"34px",imageRendering:"pixelated"}} />
              <div className="footer-logo"><span className="g">Kizuna</span> Proxy</div>
            </div>
<p className="footer-tagline">{t.footerNav?.tagline || "Tokyo-based proxy service. Your trusted link to Japan."}</p>
            <div className="footer-social">
              <a className="footer-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer"><IconInstagram size={13} /></a>
              <a className="footer-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer"><IconTiktok size={13} /></a>
            </div>
          </div>
          <div>
            <p className="footer-col-title">Navigate</p>
            <a href="/services" className="footer-link">{t.whatWeBuy?.label}</a>
<a href="/how-it-works" className="footer-link">{t.footerNav?.howItWorks || "How it works"}</a>
            <a href="/news" className="footer-link">Announcements</a>
<a href="/reviews" className="footer-link">{t.footerNav?.reviews || "Reviews"}</a>
            <a href="/pricing" className="footer-link">{t.nav.pricing}</a>
            <a href="/faq" className="footer-link">FAQ</a>
<a href="/events" className="footer-link">{t.footerNav?.events || "Tokyo Events 🎌"}</a>
          </div>
          <div>
            <p className="footer-col-title">Guides</p>
            <a href="/blog/how-to-buy-from-mercari-japan" className="footer-link">Mercari Japan Guide</a>
            <a href="/blog/yahoo-auctions-japan-guide" className="footer-link">Yahoo Auctions Guide</a>
            <a href="/blog/best-pokemon-cards-japan-2026" className="footer-link">Pokémon Cards Japan</a>
            <a href="/blog/pokemon-center-tokyo-exclusives" className="footer-link">Pokémon Center Tokyo</a>
            <a href="/blog/supreme-japan-drops-guide" className="footer-link">Supreme Japan Drops</a>
            <a href="/blog/nike-japan-exclusives-guide" className="footer-link">Nike Japan Exclusives</a>
            <a href="/blog/anime-figures-japan-guide" className="footer-link">Anime Figures Japan</a>
            <a href="/blog/japanese-trading-cards-guide-2026" className="footer-link">Trading Cards Japan</a>
            <a href="/blog/japan-shipping-guide-2026" className="footer-link">Shipping Guide 2026</a>
          </div>
          <div>
            <p className="footer-col-title">Contact</p>
            <a href="/request" className="footer-link">{t.nav.request}</a>
            <a href="mailto:kizunaproxy@gmail.com" className="footer-link">kizunaproxy@gmail.com</a>
            <a href="https://wa.me/33788432501" target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
            <a href="https://discord.com/users/Faykas" target="_blank" rel="noopener noreferrer" className="footer-link">Discord</a>
            <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer" className="footer-link">Trustpilot</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.footer?.rights}</p>
          <p>kizunaproxy.com</p>
        </div>
      </footer>
  );
}
