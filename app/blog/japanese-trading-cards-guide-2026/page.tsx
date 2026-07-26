// @ts-nocheck
import type { Metadata } from "next";
import TcgClient from "./TcgClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Buy Japanese Trading Cards from Japan 2026 — Pokémon, One Piece, Dragon Ball | Kizuna Proxy",
  description: "Buy Japanese trading cards directly from Japan. Pokémon, One Piece TCG, Dragon Ball Super, Yu-Gi-Oh Japanese sets. Cheaper than Western prices, faster than international shipping.",
  alternates: {
    canonical: "/blog/japanese-trading-cards-guide-2026",
    languages: blogLanguageAlternates("japanese-trading-cards-guide-2026"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japanese Trading Cards — Buy Direct from Japan 2026",
    description: "Pokémon, One Piece, Dragon Ball Super cards from Japan. Cheaper, faster, exclusive sets.",
    url: "https://kizunaproxy.com/blog/japanese-trading-cards-guide-2026",
  },
};

export default function BlogTCG() {
  return <TcgClient />;
}
