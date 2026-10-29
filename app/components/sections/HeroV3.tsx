// @ts-nocheck
"use client";

import { useState } from "react";
import MiniRequestForm from "../MiniRequestForm";
import { IconInstagram, IconTiktok } from "../ui";
import Maneki from "../pixel/Maneki";

// Accueil v3 : à gauche la promesse (titre, description, boutons, confiance), à droite le formulaire de demande
// déjà prêt à remplir. Tous les textes viennent de translations.ts (12 langues) : rien de nouveau à traduire ici.

export default function HeroV3({ t, lang }: { t: any; lang: string }) {
  const h = t.hero || {};
  // la mascotte sourit (yeux contents + étincelles) quand le visiteur approche ou remplit le formulaire
  const [happy, setHappy] = useState(false);
  return (
    <section className="v3-hero">
      <div className="v3-hero-grid">
        <div className="v3-hero-copy">
          <div className="v3-hero-mascot">
            <Maneki state={happy ? "success" : "idle"} prop="bag" size={92} float />
            <p className="v3-eyebrow">{h.eyebrow}</p>
          </div>
          <h1>
            {h.title1} <em>{h.title2}</em>
          </h1>
          <p className="v3-lead">{h.desc}</p>

          <div className="v3-hero-btns">
            <a href="/request" className="btn btn-gold">{h.cta}</a>
            <a href="/pricing" className="btn btn-outline">{h.ctaSecondary}</a>
          </div>

          <ul className="v3-trust">
            <li>
              <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer">
                <span className="v3-stars" aria-hidden="true">★★★★★</span>
                <span>{h.trustBadge}</span>
              </a>
            </li>
            <li className="v3-social">
              <span>{h.followUs}</span>
              <a href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </li>
          </ul>
        </div>

        <div className="v3-hero-form" onMouseEnter={() => setHappy(true)} onMouseLeave={() => setHappy(false)} onFocus={() => setHappy(true)} onBlur={() => setHappy(false)}>
          <MiniRequestForm lang={lang} />
        </div>
      </div>
    </section>
  );
}
