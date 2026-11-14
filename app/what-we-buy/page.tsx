import type { Metadata } from "next";
import WhatWeBuyClient from "./WhatWeBuyClient";

const DESC =
  "Everything we buy for you in Japan: trading cards, anime figures, gachapon, plush, luxury bags, sneakers, Japanese sweets, vintage cameras, skincare, matcha, retro games and more. Free quote within 24 hours.";

export const metadata: Metadata = {
  title: "What We Buy in Japan for You: Cards, Figures, Luxury Bags & More | Kizuna Proxy",
  description: DESC,
  alternates: { canonical: "https://kizunaproxy.com/what-we-buy" },
  openGraph: { images: ["https://kizunaproxy.com/og-image.png"], title: "Everything we buy for you in Japan", description: DESC, url: "https://kizunaproxy.com/what-we-buy" },
};

export default function WhatWeBuyPage() {
  return <WhatWeBuyClient />;
}
