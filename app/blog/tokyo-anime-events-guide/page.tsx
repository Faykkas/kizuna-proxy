import type { Metadata } from "next";
import AnimeEventsClient from "./AnimeEventsClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "AnimeJapan, Jump Festa & Wonder Festival Proxy Guide 2026 | Kizuna Proxy",
  description: "Can't make it to AnimeJapan, Jump Festa, or Wonder Festival? We handle tickets and lotteries, queue at the right booths, and buy exclusive merch in person — then ship worldwide.",
  alternates: {
    canonical: "/blog/tokyo-anime-events-guide",
    languages: blogLanguageAlternates("tokyo-anime-events-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Tokyo's Biggest Anime Events — Proxy Guide 2026",
    description: "We attend AnimeJapan, Jump Festa, and Wonder Festival in person — tickets, queuing, and exclusive merch, shipped worldwide.",
    url: "https://kizunaproxy.com/blog/tokyo-anime-events-guide",
  },
};

export default function BlogAnimeEvents() {
  return <AnimeEventsClient />;
}
