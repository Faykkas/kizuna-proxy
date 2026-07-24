import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "What We Buy from Japan — Mercari, Yahoo Auctions, Tokyo Stores | Kizuna Proxy",
  description: "We buy anything from Japan on your behalf: Mercari, Yahoo Auctions, Rakuten, Amazon JP, Pokémon Center, Nintendo Store, Supreme drops, anime figures and Tokyo store visits. Shipped worldwide.",
  alternates: { canonical: "https://kizunaproxy.com/services" },
  openGraph: {
    title: "What We Buy from Japan — Kizuna Proxy",
    description: "We buy anything from Japan on your behalf: Mercari, Yahoo Auctions, Rakuten, Amazon JP, Pokémon Center, Nintendo Store, Supreme drops, anime figures and Tokyo store visits. Shipped worldwide.",
    url: "https://kizunaproxy.com/services",
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
