// @ts-nocheck
"use client";

// Shown under every guide (rendered once by blog/layout.tsx, so no guide file needs editing):
//  - related guides (internal links), a pricing link
//  - a short FAQ taken from the site's existing, already translated FAQ page
//  - JSON-LD: BlogPosting + BreadcrumbList (the site-wide FAQPage already comes from the root layout; a second one would conflict)
// It only renders on guide URLs (/blog/<slug> and /blog/<locale>/<slug>), not on the blog index.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language";
import { translations } from "../translations";
import { guideTranslations } from "../guideTranslations";
import { GUIDE_KEYS, relatedGuides, parseGuidePath, guideUrl } from "./guideMeta";

const BASE = "https://kizunaproxy.com";

const LABELS = {
  en: { more: "More guides", faq: "Frequently asked questions", pricing: "See our pricing →", guides: "Guides", home: "Home" },
  fr: { more: "Autres guides", faq: "Questions fréquentes", pricing: "Voir nos tarifs →", guides: "Guides", home: "Accueil" },
  ja: { more: "関連ガイド", faq: "よくある質問", pricing: "料金を見る →", guides: "ガイド", home: "ホーム" },
  es: { more: "Más guías", faq: "Preguntas frecuentes", pricing: "Ver nuestros precios →", guides: "Guías", home: "Inicio" },
  it: { more: "Altre guide", faq: "Domande frequenti", pricing: "Vedi i nostri prezzi →", guides: "Guide", home: "Home" },
  de: { more: "Weitere Ratgeber", faq: "Häufige Fragen", pricing: "Unsere Preise ansehen →", guides: "Ratgeber", home: "Startseite" },
  ko: { more: "다른 가이드", faq: "자주 묻는 질문", pricing: "요금 보기 →", guides: "가이드", home: "홈" },
  zh: { more: "更多指南", faq: "常见问题", pricing: "查看我们的价格 →", guides: "指南", home: "首页" },
  pt: { more: "Mais guias", faq: "Perguntas frequentes", pricing: "Ver nossos preços →", guides: "Guias", home: "Início" },
  id: { more: "Panduan lainnya", faq: "Pertanyaan umum", pricing: "Lihat harga kami →", guides: "Panduan", home: "Beranda" },
  vi: { more: "Hướng dẫn khác", faq: "Câu hỏi thường gặp", pricing: "Xem bảng giá →", guides: "Hướng dẫn", home: "Trang chủ" },
  nl: { more: "Meer gidsen", faq: "Veelgestelde vragen", pricing: "Bekijk onze prijzen →", guides: "Gidsen", home: "Home" },
};

// [category index, item index] in translations[lang].faqPage — what a proxy is, hidden fees, when to pay, damaged items.
const FAQ_PICKS = [[0, 0], [1, 1], [1, 2], [4, 1]];

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const titleOf = (g) => clean(`${g?.title ?? ""}${g?.titleEm ?? ""}`);

function faqFor(lang) {
  const cats = (translations[lang] || translations.en).faqPage || [];
  return FAQ_PICKS.map(([c, i]) => cats[c]?.items?.[i]).filter(Boolean);
}

export default function GuideExtras() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const hit = parseGuidePath(pathname || "");
  if (!hit) return null;

  const { slug, locale } = hit;
  const shown = locale || lang; // same choice the guide itself makes
  const L = LABELS[shown] || LABELS.en;
  const data = guideTranslations[GUIDE_KEYS[slug]] || {};
  const own = data[locale || "en"] || data.en || {};
  const faqs = faqFor(shown);
  const related = relatedGuides(slug)
    .map((s) => {
      const d = guideTranslations[GUIDE_KEYS[s]] || {};
      const g = d[shown] || d.en;
      return g ? { slug: s, title: titleOf(g) } : null;
    })
    .filter(Boolean);

  // JSON-LD uses the URL's own language (not the visitor's saved one) so the markup is stable.
  const url = `${BASE}${guideUrl(slug, locale)}`;
  const inLanguage = locale || "en";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: titleOf(own),
      description: own.lead,
      inLanguage,
      mainEntityOfPage: url,
      image: `${BASE}/og-image.png`,
      author: { "@type": "Organization", name: "Kizuna Proxy", url: BASE },
      publisher: { "@type": "Organization", name: "Kizuna Proxy", url: BASE, logo: { "@type": "ImageObject", url: `${BASE}/logo-512.png` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: (LABELS[inLanguage] || LABELS.en).home, item: BASE },
        { "@type": "ListItem", position: 2, name: (LABELS[inLanguage] || LABELS.en).guides, item: `${BASE}/blog` },
        { "@type": "ListItem", position: 3, name: titleOf(own), item: url },
      ],
    },
  ];

  return (
    <section className="blog-page" style={{ paddingTop: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="blog-wrap">
        <hr className="blog-hr" />
        {faqs.length ? (
          <>
            <h2>{L.faq}</h2>
            {faqs.map((f, i) => (
              <details key={i} style={{ marginBottom: ".7rem" }}>
                <summary style={{ cursor: "pointer", fontSize: ".9rem", fontWeight: 500 }}>{f.q}</summary>
                <p style={{ marginTop: ".5rem" }}>{f.a}</p>
              </details>
            ))}
          </>
        ) : null}
        {related.length ? (
          <>
            <h2>{L.more}</h2>
            <ul className="blog-list">
              {related.map((r) => (
                <li key={r.slug}><Link href={guideUrl(r.slug, locale)}>{r.title}</Link></li>
              ))}
              <li><Link href="/pricing">{L.pricing}</Link></li>
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
