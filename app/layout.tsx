import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kizuna Proxy — Buy Items from Japan | Mercari, Yahoo Auctions, Tokyo Stores",
  description: "Franco-Japanese proxy service. We buy any item from Japan on your behalf — Mercari Japan, Yahoo Auctions, limited sneakers, anime figures, rare collectibles, Tokyo store visits. Fast, transparent, personal.",
  keywords: [
    "proxy japan", "buy from japan", "mercari japan proxy", "yahoo auctions japan",
    "japan proxy service", "tokyo shopping service", "anime figures japan",
    "limited sneakers japan", "japanese collectibles", "buy japan online",
    "service proxy japon", "acheter au japon", "proxy mercari japon"
  ],
  authors: [{ name: "Kizuna Proxy" }],
  creator: "Kizuna Proxy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kizunaproxy.com",
    siteName: "Kizuna Proxy",
    title: "Kizuna Proxy — Your Trusted Link to Japan",
    description: "Buy any item from Japan — Mercari, Yahoo Auctions, Tokyo stores, limited releases. Personal Franco-Japanese proxy service.",
    images: [
      {
        url: "https://kizunaproxy.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kizuna Proxy — Your Link to Japan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kizuna Proxy — Buy Items from Japan",
    description: "Franco-Japanese proxy service. Mercari, Yahoo Auctions, Tokyo stores, limited releases.",
    images: ["https://kizunaproxy.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://kizunaproxy.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500&family=Noto+Serif+JP:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Kizuna Proxy",
              "description": "Franco-Japanese proxy service — buy any item from Japan on your behalf.",
              "url": "https://kizunaproxy.com",
              "email": "contact@kizunaproxy.com",
              "areaServed": "Worldwide",
              "serviceType": "Proxy Shopping Service",
              "sameAs": [
                "https://www.instagram.com/kizuna_proxy/",
                "https://www.tiktok.com/@kizunaproxy",
                "https://fr.trustpilot.com/review/kizunaproxy.com"
              ],
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Online Orders",
                  "description": "Mercari, Yahoo Auctions, Japanese websites",
                  "price": "1500",
                  "priceCurrency": "JPY"
                },
                {
                  "@type": "Offer",
                  "name": "Physical Store Purchases",
                  "description": "Tokyo store visits, limited releases",
                  "price": "3000",
                  "priceCurrency": "JPY"
                }
              ]
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
