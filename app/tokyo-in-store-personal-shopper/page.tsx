import type { Metadata } from "next";
import TokyoInStoreClient from "./TokyoInStoreClient";

export const metadata: Metadata = {
  title: "Tokyo In-Store Personal Shopper — Physical Store Visits | Kizuna Proxy",
  description: "Need someone to visit a store in Tokyo for you? Kizuna Proxy is a real, in-person personal shopper — Akihabara, Shibuya, Harajuku, Pokémon Center, Mandarake and more. Upfront pricing, live updates, worldwide shipping.",
  alternates: { canonical: "https://kizunaproxy.com/tokyo-in-store-personal-shopper" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Tokyo In-Store Personal Shopper — Kizuna Proxy",
    description: "A real, in-person personal shopper for physical stores across Tokyo. Upfront pricing, live updates, worldwide shipping.",
    url: "https://kizunaproxy.com/tokyo-in-store-personal-shopper",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Do you guarantee you'll find the item?", "acceptedAnswer": { "@type": "Answer", "text": "No. We confirm what we can before going, but availability is never guaranteed until we've physically checked the shelf — items can sell out or be relisted without notice." } },
    { "@type": "Question", "name": "Can you visit stores outside Tokyo?", "acceptedAnswer": { "@type": "Answer", "text": "Right now, in-person visits are limited to Tokyo." } },
    { "@type": "Question", "name": "How much does a store visit cost?", "acceptedAnswer": { "@type": "Answer", "text": "It's a personalised quote based on the store, location, and how much time the visit takes — there's no flat rate. The service fee is paid upfront to reserve the visit." } },
    { "@type": "Question", "name": "What if the item is sold out when you arrive?", "acceptedAnswer": { "@type": "Answer", "text": "The visit fee still applies, since it covers our time and transport rather than the item itself. We'll never buy anything without your confirmation first." } },
  ],
};

export default function TokyoInStorePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <TokyoInStoreClient />
    </>
  );
}
