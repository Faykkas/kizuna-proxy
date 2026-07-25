import type { Metadata } from "next";
import PokemonCardsClient from "./PokemonCardsClient";

export const metadata: Metadata = {
  title: "Best Pokémon Cards to Buy from Japan in 2026 | Kizuna Proxy",
  description: "The most sought-after Japanese Pokémon card sets in 2026 — exclusive booster packs, vintage cards, and promo sets only available in Japan. Learn how to get them shipped worldwide.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Best Pokémon Cards to Buy from Japan in 2026",
    description: "Japanese exclusive Pokémon cards you can't get outside Japan — and how to buy them.",
    url: "https://kizunaproxy.com/blog/best-pokemon-cards-japan-2026",
  },
};

export default function BlogPokemon() {
  return <PokemonCardsClient />;
}
