// @ts-nocheck
import type { Metadata } from "next";
import AnimeFiguresClient from "./AnimeFiguresClient";

export const metadata: Metadata = {
  title: "How to Buy Anime Figures from Japan — Kizuna Proxy Guide 2026",
  description: "Buy anime figures directly from Japan — Demon Slayer, One Piece, Dragon Ball, Jujutsu Kaisen. Exclusive Japanese releases shipped worldwide via Kizuna Proxy.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "How to Buy Anime Figures from Japan — Complete Guide 2026",
    description: "Anime figures from Japan shipped worldwide. Exclusive Japanese releases unavailable outside Japan.",
    url: "https://kizunaproxy.com/blog/anime-figures-japan-guide",
  },
};

export default function BlogAnime() {
  return <AnimeFiguresClient />;
}
