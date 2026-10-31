import type { Metadata } from "next";
import StarbucksJapanClient from "./StarbucksJapanClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "How to Buy Starbucks Japan Tumblers and Mugs from Abroad | Kizuna Proxy",
  description: "Starbucks Japan's online store does not ship abroad. How releases work, the rules, Reserve Roastery Tokyo, and how Kizuna buys tumblers and mugs for you in Japan.",
  alternates: {
    canonical: "/blog/buy-starbucks-japan-tumblers-guide",
    languages: blogLanguageAlternates("buy-starbucks-japan-tumblers-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Buying Starbucks Japan tumblers and mugs from abroad",
    description: "How releases work and how we buy Starbucks Japan goods for you.",
    url: "https://kizunaproxy.com/blog/buy-starbucks-japan-tumblers-guide",
  },
};

export default function Page() {
  return <StarbucksJapanClient />;
}
