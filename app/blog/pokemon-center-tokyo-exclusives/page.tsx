// @ts-nocheck
import type { Metadata } from "next";
import PokemonCenterClient from "./PokemonCenterClient";

export const metadata: Metadata = {
  title: "Pokémon Center Tokyo — Exclusive Items Guide 2026 | Kizuna Proxy",
  description: "Pokémon Center Tokyo carries exclusive plush, cards, and merchandise unavailable outside Japan. Buy Pokémon Center Tokyo exclusives shipped worldwide via Kizuna Proxy.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Pokémon Center Tokyo Exclusives — Buy & Ship Worldwide 2026",
    description: "Pokémon Center Tokyo exclusive merchandise shipped worldwide.",
    url: "https://kizunaproxy.com/blog/pokemon-center-tokyo-exclusives",
  },
};

export default function BlogPokemonCenter() {
  return <PokemonCenterClient />;
}
