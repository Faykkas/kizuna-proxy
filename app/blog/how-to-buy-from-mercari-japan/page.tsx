import type { Metadata } from "next";
import MercariClient from "./MercariClient";

export const metadata: Metadata = {
  title: "How to Buy from Mercari Japan Without Living in Japan | Kizuna Proxy",
  description: "A complete guide to buying from Mercari Japan in 2026 — what you can find, how bidding works, and how a proxy service like Kizuna Proxy makes it simple for international buyers.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "How to Buy from Mercari Japan Without Living in Japan",
    description: "Complete guide to Mercari Japan for international buyers in 2026.",
    url: "https://kizunaproxy.com/blog/how-to-buy-from-mercari-japan",
  },
};

export default function BlogMercari() {
  return <MercariClient />;
}
