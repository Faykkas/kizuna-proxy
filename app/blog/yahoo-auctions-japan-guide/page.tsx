import type { Metadata } from "next";
import YahooClient from "./YahooClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Yahoo Auctions Japan Guide for International Buyers 2026 | Kizuna Proxy",
  description: "Complete guide to buying from Yahoo Auctions Japan in 2026 — how bidding works, what you can find, fees explained, and how a proxy service handles everything for you.",
  alternates: {
    canonical: "/blog/yahoo-auctions-japan-guide",
    languages: blogLanguageAlternates("yahoo-auctions-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Yahoo Auctions Japan Guide for International Buyers 2026",
    description: "Everything you need to know about Yahoo Auctions Japan — bidding, fees, and how to buy without a Japanese account.",
    url: "https://kizunaproxy.com/blog/yahoo-auctions-japan-guide",
  },
};

export default function BlogYahoo() {
  return <YahooClient />;
}
