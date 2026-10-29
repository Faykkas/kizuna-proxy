// @ts-nocheck
"use client";

// « À la une » : les actualités du moment (boutique, événements, business) sous forme de cartes sobres.
// Les textes sont ceux des promos existantes (translations.ts) : pour changer ce qui est mis en avant, on modifie
// la liste SLOTS ci-dessous (clé de traduction + lien), sans rien retraduire.

const SLOTS = [
  { key: "pokemonStarbucksPromo", href: "/shop", tone: "red" },
  { key: "eventPromo", href: "/shop", tone: "indigo" },
  { key: "comiketPromo", href: "/blog/comiket-japan-guide", tone: "indigo" },
  { key: "comitiaPromo", href: "/blog/comitia-japan-guide", tone: "indigo" },
  { key: "b2bPromo", href: "/business-sourcing", tone: "ink" },
];

export default function HighlightsV3({ t }: { t: any }) {
  const cards = SLOTS.map((s) => ({ ...s, p: t[s.key] })).filter((c) => c.p && c.p.title);
  if (cards.length === 0) return null;
  return (
    <section className="section-sm reveal">
      <div className="wrap">
        <div className="v3-promos">
          {cards.map(({ key, href, tone, p }) => (
            <a key={key} href={href} className={`v3-promo v3-promo-${tone}`}>
              {p.badge ? <span className="v3-badge">{p.badge}</span> : null}
              <strong>{p.title}</strong>
              <p>{p.desc}</p>
              {p.cta ? <span className="v3-promo-cta">{p.cta}</span> : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
