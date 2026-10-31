// @ts-nocheck
"use client";

import Maneki from "../pixel/Maneki";
import { eventPromos } from "../../eventPromos";

// « À la une » : une grande vitrine pour l'actualité principale (la première de la liste) puis une liste claire pour les autres.
// Les textes sont ceux des promos existantes (translations.ts, 12 langues) : pour changer ce qui est mis en avant, on modifie
// la liste SLOTS ci-dessous (clé de traduction + lien), sans rien retraduire. Le premier élément devient la vitrine.

const SLOTS = [
  { key: "pokemonStarbucksPromo", href: "/shop", tone: "red" },
  { key: "agfPromo", href: "/blog/agf-ikebukuro-animate-girls-festival-2026", tone: "red" },
  { key: "biohazardPromo", href: "/blog/resident-evil-30th-anniversary-exhibition-tokyo", tone: "indigo" },
  { key: "eventPromo", href: "/shop", tone: "indigo" },
  { key: "comiketPromo", href: "/blog/comiket-japan-guide", tone: "indigo" },
  { key: "comitiaPromo", href: "/blog/comitia-japan-guide", tone: "indigo" },
  { key: "b2bPromo", href: "/business-sourcing", tone: "ink" },
];

export default function HighlightsV3({ t, lang }: { t: any; lang?: string }) {
  const extra = eventPromos[lang || "en"] || eventPromos.en;
  const cards = SLOTS.map((s) => ({ ...s, p: t[s.key] || extra[s.key] })).filter((c) => c.p && c.p.title);
  if (cards.length === 0) return null;
  const [lead, ...rest] = cards;
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <a href={lead.href} className="v3-feature">
          <div className="v3-feature-copy">
            {lead.p.badge ? <span className="v3-badge v3-badge-live">{lead.p.badge}</span> : null}
            <strong>{lead.p.title}</strong>
            <p>{lead.p.desc}</p>
            {lead.p.cta ? <span className="btn btn-gold v3-feature-cta">{lead.p.cta}</span> : null}
          </div>
          <div className="v3-feature-art" aria-hidden="true">
            <Maneki state="success" prop="bag" size={170} float />
          </div>
        </a>

        {rest.length > 0 ? (
          <ul className="v3-feed">
            {rest.map(({ key, href, tone, p }) => (
              <li key={key}>
                <a href={href} className={`v3-feed-row v3-feed-${tone}`}>
                  <span className="v3-feed-bar" aria-hidden="true" />
                  {p.badge ? <span className="v3-badge">{p.badge}</span> : <span />}
                  <span className="v3-feed-main">
                    <strong>{p.title}</strong>
                    <span>{p.desc}</span>
                  </span>
                  <span className="v3-feed-go" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
