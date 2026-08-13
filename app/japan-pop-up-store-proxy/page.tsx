import type { Metadata } from "next";
import PopUpProxyClient from "./PopUpProxyClient";
import { landingLanguageAlternates } from "../landingHreflang";

export const metadata: Metadata = {
  title: "Japan Pop-Up Store Proxy — Limited Drops & Collabs | Kizuna Proxy",
  description: "Missed a Tokyo pop-up or limited collab? Kizuna Proxy queues and buys in person for pop-up stores, exclusive events and collab drops across Tokyo. Upfront pricing, honest updates, no guarantees.",
  alternates: {
    canonical: "https://kizunaproxy.com/japan-pop-up-store-proxy",
    languages: landingLanguageAlternates("japan-pop-up-store-proxy"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Pop-Up Store Proxy — Kizuna Proxy",
    description: "We queue and buy in person for pop-up stores, exclusive events and collab drops across Tokyo.",
    url: "https://kizunaproxy.com/japan-pop-up-store-proxy",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Can you guarantee you'll get the item before it sells out?", "acceptedAnswer": { "@type": "Answer", "text": "No. Pop-ups and limited drops can sell out within minutes, and we can only queue and buy once we're physically there — nothing is guaranteed in advance." } },
    { "@type": "Question", "name": "Do you queue overnight for drops?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on the event — tell us the details and we'll let you know what's realistic and what it would cost." } },
    { "@type": "Question", "name": "What if I don't know the exact release time?", "acceptedAnswer": { "@type": "Answer", "text": "Tell us what you know and we'll research the rest before confirming a quote." } },
    { "@type": "Question", "name": "Can you ship the item within Japan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — if you're based in Japan, we can ship domestically to your address instead of internationally." } },
  ],
};

export default function PopUpProxyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PopUpProxyClient />
    </>
  );
}
