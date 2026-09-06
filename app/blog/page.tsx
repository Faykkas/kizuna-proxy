import type { Metadata } from "next";
import BlogIndexClient from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Japan Shopping Guides | Kizuna Proxy",
  description: "Practical guides to buying from Japan — Mercari, Yahoo Auctions, Pokémon cards, anime figures, Comiket, Ichiban Kuji, K-pop exclusives, and more, from a Tokyo-based proxy service.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Shopping Guides",
    description: "Practical guides to buying from Japan, from a Tokyo-based proxy service.",
    url: "https://kizunaproxy.com/blog",
  },
};

export default function BlogIndex() {
  return <BlogIndexClient />;
}
