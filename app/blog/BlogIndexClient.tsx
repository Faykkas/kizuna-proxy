// @ts-nocheck
"use client";

import { useLanguage } from "../lib/language";
import { guideTranslations } from "../guideTranslations";
import {
  IconShoppingBag, IconAuction, IconCards, IconStore, IconApparel,
  IconSneaker, IconFigure, IconBox, IconEvent, IconBook, IconGacha, IconMusicNote,
} from "../components/pixel/PixelIcons";

const GUIDES = [
  { slug: "how-to-buy-from-mercari-japan",    key: "mercari",       Icon: IconShoppingBag },
  { slug: "yahoo-auctions-japan-guide",        key: "yahoo",         Icon: IconAuction },
  { slug: "best-pokemon-cards-japan-2026",     key: "pokemonCards",  Icon: IconCards },
  { slug: "pokemon-center-tokyo-exclusives",   key: "pokemonCenter", Icon: IconStore },
  { slug: "supreme-japan-drops-guide",         key: "supreme",       Icon: IconApparel },
  { slug: "nike-japan-exclusives-guide",       key: "nike",          Icon: IconSneaker },
  { slug: "anime-figures-japan-guide",         key: "animeFigures",  Icon: IconFigure },
  { slug: "japanese-trading-cards-guide-2026", key: "tcg",           Icon: IconCards },
  { slug: "japan-shipping-guide-2026",         key: "shippingGuide", Icon: IconBox },
  { slug: "comiket-japan-guide",               key: "comiket",       Icon: IconBook },
  { slug: "comitia-japan-guide",               key: "comitia",       Icon: IconBook },
  { slug: "ichiban-kuji-japan-guide",          key: "ichibanKuji",   Icon: IconGacha },
  { slug: "tokyo-anime-events-guide",          key: "animeEvents",   Icon: IconEvent },
  { slug: "kpop-photocards-japan-guide",       key: "kpop",          Icon: IconMusicNote },
];

export default function BlogIndexClient() {
  const { lang, t } = useLanguage();

  return (
    <main className="blog-page">
      <div className="blog-wrap" style={{ maxWidth: "1040px" }}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{t.blog?.label || "Guides"}</span>
        </nav>
        <div className="blog-eyebrow">{t.blog?.label || "Guides"}</div>
        <h1>{t.blog?.title || "Learn how to"} <em>{t.blog?.titleEm || "buy from Japan"}</em></h1>
        <p className="blog-lead">{t.blog?.desc || "Practical guides to help you find and buy from Japan."}</p>

        <hr className="blog-hr" />

        <div className="ev-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {GUIDES.map(({ slug, key, Icon }) => {
            const data = guideTranslations[key];
            const g = data[lang] || data.en;
            return (
              <a key={slug} href={`/blog/${slug}`} className="ev-card" style={{ display: "block", textDecoration: "none" }}>
                <div className="ev-icon"><Icon size={40} /></div>
                <h3>{g.title}{g.titleEm}</h3>
                <p>{g.lead}</p>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
