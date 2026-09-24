import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop — Items Ready to Ship | Kizuna Proxy",
  description: "Items we've already secured in Japan and can ship right away — no waiting on a store visit or a lottery. Photo and price, first come first served.",
  alternates: { canonical: "https://kizunaproxy.com/shop" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Shop — Items Ready to Ship | Kizuna Proxy",
    description: "Items we've already secured in Japan and can ship right away — no waiting on a store visit or a lottery.",
    url: "https://kizunaproxy.com/shop",
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
