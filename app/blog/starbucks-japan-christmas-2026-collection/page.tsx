import type { Metadata } from "next";
import StarbucksXmasClient from "./StarbucksXmasClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Starbucks Japan Christmas 2026 Collection: Dates, Prices and Proxy Buying | Kizuna Proxy",
  description: "Starbucks Japan Holiday 2026: online pre-sale October 30, stores from November 2. Main goods with prices, Reserve Roastery Tokyo exclusives, and how Kizuna buys them for you.",
  alternates: {
    canonical: "/blog/starbucks-japan-christmas-2026-collection",
    languages: blogLanguageAlternates("starbucks-japan-christmas-2026-collection"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Starbucks Japan Christmas 2026 collection",
    description: "Dates, prices and how we buy the Holiday 2026 goods for you in Japan.",
    url: "https://kizunaproxy.com/blog/starbucks-japan-christmas-2026-collection",
  },
};

export default function Page() {
  return <StarbucksXmasClient />;
}
