// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── SEARCH WIDGET ───────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "mercari",  label: "Mercari",        url: (q: string) => `https://jp.mercari.com/search?keyword=${encodeURIComponent(q)}&status=on_sale`,          color: "#ff0211", logo: "M" },
  { id: "yahoo",    label: "Yahoo Auctions", url: (q: string) => `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(q)}&va=${encodeURIComponent(q)}`, color: "#720099", logo: "Y" },
  { id: "rakuten",  label: "Rakuten",        url: (q: string) => `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/`,                      color: "#BF0000", logo: "R" },
  { id: "amazon",   label: "Amazon JP",      url: (q: string) => `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`,                                  color: "#FF9900", logo: "A" },
  { id: "surugaya", label: "Suruga-ya",      url: (q: string) => `https://www.suruga-ya.jp/search?search_word=${encodeURIComponent(q)}`,                    color: "#e65c00", logo: "S" },
  { id: "bookoff",  label: "Book Off",       url: (q: string) => `https://shopping.bookoff.co.jp/search/keyword/${encodeURIComponent(q)}/`,                 color: "#00a550", logo: "B" },
];

const SEARCH_LABELS = {
  en: { title: "Search Japanese marketplaces", placeholder: "Pokémon cards, Nike Japan, Mercari vintage...", btn: "Search", sub: "Find your item, then send us the link", copy: "Found something? Send us the link →" },
  fr: { title: "Chercher sur les sites japonais", placeholder: "Cartes Pokémon, Nike Japan, vintage Mercari...", btn: "Chercher", sub: "Trouvez votre article, puis envoyez-nous le lien", copy: "Vous avez trouvé ? Envoyez-nous le lien →" },
  ja: { title: "日本のマーケットプレイスで検索", placeholder: "ポケモンカード、ナイキ、メルカリ...", btn: "検索", sub: "商品を見つけてリンクを送ってください", copy: "見つけましたか？リンクを送ってください →" },
  de: { title: "Japanische Marktplätze durchsuchen", placeholder: "Pokémon Karten, Nike Japan, Vintage...", btn: "Suchen", sub: "Finden Sie Ihren Artikel und senden Sie uns den Link", copy: "Gefunden? Senden Sie uns den Link →" },
  es: { title: "Buscar en mercados japoneses", placeholder: "Cartas Pokémon, Nike Japan, vintage...", btn: "Buscar", sub: "Encuentra tu artículo y envíanos el enlace", copy: "¿Encontraste algo? Envíanos el enlace →" },
  it: { title: "Cerca sui marketplace giapponesi", placeholder: "Carte Pokémon, Nike Japan, vintage...", btn: "Cerca", sub: "Trova il tuo articolo e mandaci il link", copy: "Trovato qualcosa? Mandaci il link →" },
  ko: { title: "일본 마켓플레이스 검색", placeholder: "포켓몬 카드, 나이키 재팬, 빈티지...", btn: "검색", sub: "아이템을 찾은 후 링크를 보내주세요", copy: "찾으셨나요? 링크를 보내주세요 →" },
  zh: { title: "搜索日本购物平台", placeholder: "宝可梦卡牌、日本Nike、二手...", btn: "搜索", sub: "找到商品后将链接发给我们", copy: "找到了？把链接发给我们 →" },
};

export default function SearchWidget({ lang, t }: { lang: string; t: any }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("mercari");
  const labels = SEARCH_LABELS[lang] || SEARCH_LABELS.en;
  const current = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];

  function handleSearch() {
    if (!query.trim()) return;
    window.open(current.url(query.trim()), "_blank", "noopener");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="sw-wrap">
      <div className="sw-header">
        <p className="sw-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          {labels.title}
        </p>
      </div>

      {/* Platform selector */}
      <div className="sw-platforms">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            className={`sw-platform-btn${platform === p.id ? " active" : ""}`}
            onClick={() => setPlatform(p.id)}
            style={platform === p.id ? { borderColor: p.color, color: p.color } : {}}
          >
            <span className="sw-platform-dot" style={{ background: p.color }} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="sw-bar">
        <input
          className="sw-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder={labels.placeholder}
        />
        <button className="sw-btn" onClick={handleSearch}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          {labels.btn}
        </button>
      </div>

      {/* Sub text */}
      <div className="sw-footer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{labels.sub}</span>
        <a href="/request" className="sw-cta">{labels.copy}</a>
      </div>
    </div>
  );
}
