import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kizuna Proxy — Buy Items from Japan | Mercari, Yahoo Auctions, Tokyo Stores",
  description: "Franco-Japanese proxy service. We buy any item from Japan on your behalf — Mercari Japan, Yahoo Auctions, limited sneakers, Pokémon cards, anime figures, rare collectibles, Tokyo store visits. Fast, transparent, personal. Reply within 24 hours.",
  keywords: [
    "proxy japan", "japan proxy service", "buy from japan", "mercari japan proxy",
    "yahoo auctions japan proxy", "japan proxy shopping", "anime figures japan",
    "pokemon cards japan", "limited sneakers japan", "japanese collectibles",
    "buy japan online", "tokyo shopping service", "japan personal shopper",
    "service proxy japon", "acheter au japon", "proxy mercari japon",
    "日本 代行", "メルカリ 代行", "日本 買い物 代行"
  ],
  authors: [{ name: "Kizuna Proxy" }],
  creator: "Kizuna Proxy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kizunaproxy.com",
    siteName: "Kizuna Proxy",
    title: "Kizuna Proxy — Your Trusted Link to Japan",
    description: "Buy any item from Japan — Mercari, Yahoo Auctions, Tokyo stores, Pokémon cards, limited sneakers. Personal Franco-Japanese proxy service. Reply within 24h.",
    images: [{ url: "https://kizunaproxy.com/og-image.png", width: 1200, height: 630, alt: "Kizuna Proxy — Your Link to Japan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kizuna Proxy — Buy Items from Japan",
    description: "Franco-Japanese proxy service. Mercari, Yahoo Auctions, Tokyo stores, Pokémon cards, limited sneakers. Reply within 24h.",
    images: ["https://kizunaproxy.com/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: {
    canonical: "https://kizunaproxy.com",
    languages: {
      "en": "https://kizunaproxy.com",
      "fr": "https://kizunaproxy.com",
      "ja": "https://kizunaproxy.com",
      "es": "https://kizunaproxy.com",
      "de": "https://kizunaproxy.com",
      "it": "https://kizunaproxy.com",
      "ko": "https://kizunaproxy.com",
      "zh": "https://kizunaproxy.com",
    }
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500&family=Noto+Serif+JP:wght@300;400;700&display=swap" rel="stylesheet" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Kizuna Proxy",
          "description": "Franco-Japanese proxy service. Buy any item from Japan — Mercari, Yahoo Auctions, Tokyo store visits, Pokémon cards, limited sneakers, anime figures.",
          "url": "https://kizunaproxy.com",
          "email": "contact@kizunaproxy.com",
          "areaServed": "Worldwide",
          "serviceType": "Proxy Shopping Service",
          "priceRange": "¥1500–¥3000",
          "knowsLanguage": ["fr", "ja", "en"],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "4",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            { "@type": "Review", "author": { "@type": "Person", "name": "Thomas R." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Response was quick, got confirmation the same day. Package arrived in perfect condition.", "datePublished": "2026-01-14" },
            { "@type": "Review", "author": { "@type": "Person", "name": "Jessica M." }, "reviewRating": { "@type": "Rating", "ratingValue": "4" }, "reviewBody": "Found the card sets I was looking for. Communication was clear and costs were explained before anything.", "datePublished": "2026-02-03" },
            { "@type": "Review", "author": { "@type": "Person", "name": "Matteo C." }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "They found exactly what I described. Kept me updated throughout.", "datePublished": "2026-02-21" },
            { "@type": "Review", "author": { "@type": "Person", "name": "Yuki T." }, "reviewRating": { "@type": "Rating", "ratingValue": "4" }, "reviewBody": "Used them for multiple Yahoo Auctions items. Really smooth experience overall.", "datePublished": "2026-03-08" }
          ],
          "sameAs": [
            "https://www.instagram.com/kizuna_proxy/",
            "https://www.tiktok.com/@kizunaproxy",
            "https://fr.trustpilot.com/review/kizunaproxy.com"
          ],
          "offers": [
            { "@type": "Offer", "name": "Online Orders", "description": "Mercari, Yahoo Auctions, Japanese websites", "price": "1500", "priceCurrency": "JPY" },
            { "@type": "Offer", "name": "Physical Store Purchases", "description": "Tokyo store visits, limited releases", "price": "3000", "priceCurrency": "JPY" }
          ]
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is a Japan proxy service?", "acceptedAnswer": { "@type": "Answer", "text": "A Japan proxy service purchases items on your behalf from Japan — online (Mercari, Yahoo Auctions) or in physical stores in Tokyo. We act as your trusted local representative." } },
            { "@type": "Question", "name": "How much does Kizuna Proxy charge?", "acceptedAnswer": { "@type": "Answer", "text": "Online orders cost ¥1,500 per item. Physical store visits in Tokyo cost ¥3,000 per item. Shipping is discussed separately and always transparent." } },
            { "@type": "Question", "name": "How long does it take to get items from Japan?", "acceptedAnswer": { "@type": "Answer", "text": "For online orders, we generally purchase within the same day. We always reply to requests within 24 hours." } },
            { "@type": "Question", "name": "Can you buy Pokémon cards from Japan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we buy any Japanese Pokémon card sets, exclusive booster packs, and limited edition products directly from Japanese retailers and ship worldwide." } },
            { "@type": "Question", "name": "Can you buy from Mercari Japan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we purchase from Mercari Japan on your behalf, handling communication with Japanese sellers, payment, and international shipping." } }
          ]
        })}} />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
