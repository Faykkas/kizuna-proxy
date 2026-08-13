import type { Metadata } from "next";
import CardProxyClient from "./CardProxyClient";

export const metadata: Metadata = {
  title: "Pokémon & One Piece Card Proxy in Japan | Kizuna Proxy",
  description: "Buy Pokémon and One Piece TCG boosters, decks and sealed boxes from authorized Tokyo retailers. Kizuna Proxy respects per-customer purchase limits, ships worldwide, and never guarantees high-demand stock.",
  alternates: { canonical: "https://kizunaproxy.com/pokemon-one-piece-card-proxy-japan" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Pokémon & One Piece Card Proxy in Japan — Kizuna Proxy",
    description: "Official boosters, decks and sealed boxes sourced from authorized Tokyo retailers. Purchase limits respected, shipped worldwide.",
    url: "https://kizunaproxy.com/pokemon-one-piece-card-proxy-japan",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Can you get me 10 boxes of a hot release?", "acceptedAnswer": { "@type": "Answer", "text": "Not from a single store or visit — Japanese retailers cap purchases per customer, often to 1–3 boxes, and we always respect those limits." } },
    { "@type": "Question", "name": "Do you buy rare or vintage cards from Yahoo Auctions?", "acceptedAnswer": { "@type": "Answer", "text": "No — we don't place bids on Yahoo Auctions or any auction platform. We do buy fixed-price listings on Mercari and Rakuma, and can check official retailers and secondhand card shops in Tokyo in person." } },
    { "@type": "Question", "name": "Can you ship cards internationally?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — cards are packed securely with tracked, insured shipping to most countries." } },
    { "@type": "Question", "name": "Are the cards authentic?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We buy from official retailers, Pokémon Center, or in person from established stores — never from third-party resellers whose stock we can't verify ourselves." } },
  ],
};

export default function CardProxyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <CardProxyClient />
    </>
  );
}
