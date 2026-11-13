import type { Metadata } from "next";
import ChristmasClient from "./ChristmasClient";

const TITLE = "Christmas Gifts from Japan 2026: Gift Finder & Order Deadline (Dec 5) | Kizuna Proxy";
const DESC =
  "Find a Christmas gift from Japan in 30 seconds: anime, Pokémon, Coach bags, Japanese sweets, Sanrio, traditional crafts. A real person in Tokyo buys and ships it. Christmas orders until December 5, 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "https://kizunaproxy.com/christmas" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Find a Christmas gift from Japan in 30 seconds",
    description: DESC,
    url: "https://kizunaproxy.com/christmas",
  },
};

export default function ChristmasPage() {
  return <ChristmasClient />;
}
