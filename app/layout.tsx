import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kizuna Proxy — Buy Any Item from Japan | Personal Shopper Tokyo",
  description: "Tokyo-based Japan proxy & personal shopping service. We buy any item from Japan for you — Mercari, Yahoo Auctions, Pokémon Center, Nintendo Store, Supreme drops, anime figures, rare collectibles. Worldwide shipping. Fast replies. Trusted by customers in 20+ countries.",
  keywords: [
    "japan proxy service", "buy from japan", "mercari japan proxy", "yahoo auctions japan proxy",
    "japan personal shopper", "tokyo shopping service", "pokemon cards japan", "anime figures japan",
    "limited sneakers japan", "supreme japan proxy", "nintendo japan exclusive", "japanese collectibles",
    "proxy shopping japan", "buy mercari japan", "japan proxy worldwide",
    "service proxy japon", "acheter au japon", "proxy mercari japon", "achat japon",
    "日本 代行", "メルカリ 代行", "日本 買い物 代行", "日本 個人輸入",
    "kizuna proxy", "kizunaproxy"
  ],
  authors: [{ name: "Kizuna Proxy" }],
  creator: "Kizuna Proxy",
  metadataBase: new URL("https://kizunaproxy.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kizunaproxy.com",
    siteName: "Kizuna Proxy",
    title: "Kizuna Proxy — Your Trusted Link to Japan",
    description: "Buy any item from Japan, shipped worldwide. Mercari, Yahoo Auctions, Tokyo stores, Pokémon cards, Supreme drops, limited sneakers, rare collectibles. Personal, fast, transparent.",
    images: [{ url: "https://kizunaproxy.com/og-image.png", width: 1200, height: 630, alt: "Kizuna Proxy — Buy from Japan, shipped worldwide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kizuna Proxy — Buy Any Item from Japan",
    description: "Tokyo-based Japan proxy service. Mercari, Yahoo Auctions, Tokyo stores, Pokémon cards, Supreme drops. Worldwide shipping. Reply within 24h.",
    images: ["https://kizunaproxy.com/og-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
  },
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
      "x-default": "https://kizunaproxy.com",
    }
  },
  verification: {
    google: "eou6qlkIJeT1H_3trXZM2gx3Nc_XJYGWw9i5l",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500&family=Noto+Serif+JP:wght@300;400;700&display=swap" rel="stylesheet" />

        {/* LocalBusiness + Reviews */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Kizuna Proxy",
          "description": "Tokyo-based Japan proxy and personal shopping service. We buy any item from Japan — Mercari, Yahoo Auctions, Tokyo store visits, Pokémon cards, limited sneakers, anime figures — and ship worldwide.",
          "url": "https://kizunaproxy.com",
          "email": "kizunaproxy@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "1-12-4 Ginza N&E BLD. 6F",
            "addressLocality": "Chuo-ku",
            "addressRegion": "Tokyo",
            "postalCode": "104-0061",
            "addressCountry": "JP"
          },
          "areaServed": "Worldwide",
          "serviceType": "Japan Proxy Shopping Service",
          "knowsLanguage": ["fr", "ja", "en", "es", "de", "it", "ko", "zh"],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "11",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            { "@type": "Review", "author": { "@type": "Person", "name": "u/ikorean123" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Best proxy service for any products from Japan. Very attentive and took great care in getting my products shipped over.", "datePublished": "2026-04-01" },
            { "@type": "Review", "author": { "@type": "Person", "name": "u/grimmia" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Visited the Pokémon Center and Nintendo Store with absolute success. Extremely polite, professional, very good prices.", "datePublished": "2026-03-15" },
            { "@type": "Review", "author": { "@type": "Person", "name": "u/No_Seaworthiness7119" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Flawless experience. 3/15 ordered, 3/18 shipped, 3/24 delivered. Cannot recommend highly enough.", "datePublished": "2026-03-24" },
            { "@type": "Review", "author": { "@type": "Person", "name": "u/Snupkin" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Fast responses, flexible shipping, securely packaged. The whole experience was great.", "datePublished": "2026-03-20" },
            { "@type": "Review", "author": { "@type": "Person", "name": "u/Crrexxx" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "So sweet and helpful. Packaging was carefully wrapped and secure. Will definitely use again!", "datePublished": "2026-04-05" }
          ],
          "sameAs": [
            "https://www.instagram.com/kizuna_proxy/",
            "https://www.tiktok.com/@kizunaproxy",
            "https://fr.trustpilot.com/review/kizunaproxy.com",
            "https://www.reddit.com/user/Faycas"
          ],
        })}} />

        {/* FAQ Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is a Japan proxy service?", "acceptedAnswer": { "@type": "Answer", "text": "A Japan proxy service purchases items on your behalf from Japan — online (Mercari, Yahoo Auctions) or in physical stores in Tokyo. Kizuna Proxy acts as your trusted local representative in Tokyo." } },
            { "@type": "Question", "name": "How does Kizuna Proxy work?", "acceptedAnswer": { "@type": "Answer", "text": "Send us your request with item details, we confirm availability and provide a personalised quote, you pay, we purchase and ship directly to your door worldwide." } },
            { "@type": "Question", "name": "How long does it take to get items from Japan?", "acceptedAnswer": { "@type": "Answer", "text": "For online orders we generally purchase within the same day. Shipping takes 5-14 days depending on the method chosen. We always reply within 24 hours." } },
            { "@type": "Question", "name": "Can you buy Pokémon cards from Japan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we buy Japanese Pokémon card sets, exclusive booster packs, and limited edition products directly from Pokémon Center Tokyo and ship worldwide." } },
            { "@type": "Question", "name": "Can you buy from Mercari Japan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we purchase from Mercari Japan on your behalf, handling all Japanese communication with sellers, payment, and international shipping." } },
            { "@type": "Question", "name": "Do you attend Tokyo events like Supreme drops?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — we physically attend Supreme Japan drops, Pokémon Center events, Nintendo Store releases, and other exclusive Tokyo events on your behalf." } },
            { "@type": "Question", "name": "Which countries do you ship to?", "acceptedAnswer": { "@type": "Answer", "text": "We ship worldwide — USA, Canada, France, Germany, Italy, UK, Australia, Greece, Indonesia, South Korea and many more countries via EMS, Yamato, FedEx or DHL." } }
          ]
        })}} />

        {/* Service Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Japan Proxy Shopping — Kizuna Proxy",
          "provider": { "@type": "Organization", "name": "Kizuna Proxy", "url": "https://kizunaproxy.com" },
          "areaServed": "Worldwide",
          "description": "Personal proxy shopping service based in Tokyo. We buy any item from Japan — Mercari, Yahoo Auctions, physical stores, exclusive events — and ship worldwide.",
          "serviceType": "Proxy Shopping",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Japan Proxy Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Online Proxy (Mercari, Yahoo Auctions)" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tokyo Store Visits" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tokyo Events & Exclusive Drops" } }
            ]
          }
        })}} />
      </head>
      <body>
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
              a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
              tp('register', '08lU7DhAN84FqIu4');
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              Tawk_API.onLoad = function() { Tawk_API.hideWidget(); };
              Tawk_API.onStatusChange = function() { Tawk_API.hideWidget(); };
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/69d4bd230846fc1c371afcfe/1jljg5kpl';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
