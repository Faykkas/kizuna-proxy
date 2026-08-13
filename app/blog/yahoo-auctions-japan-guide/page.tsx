import type { Metadata } from "next";
import YahooClient from "./YahooClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Yahoo Auctions Japan — What We Actually Offer | Kizuna Proxy",
  description: "Kizuna Proxy doesn't bid on Yahoo Auctions Japan. Here's why, and what to buy instead: fixed-price Mercari & Rakuma listings, physical store visits in Tokyo, and official retailers.",
  alternates: {
    canonical: "/blog/yahoo-auctions-japan-guide",
    languages: blogLanguageAlternates("yahoo-auctions-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Yahoo Auctions Japan — What We Actually Offer",
    description: "We don't bid on Yahoo Auctions or any auction platform. Here's what we buy instead: fixed-price Mercari & Rakuma listings and in-person Tokyo store visits.",
    url: "https://kizunaproxy.com/blog/yahoo-auctions-japan-guide",
  },
};

export default function BlogYahoo() {
  return <YahooClient />;
}
