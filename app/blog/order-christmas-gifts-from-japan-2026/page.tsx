import type { Metadata } from "next";
import ChristmasClient from "./ChristmasClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Christmas Orders from Japan 2026: Order Now, Requests Accepted Until December 5 | Kizuna Proxy",
  description: "Kizuna Proxy accepts Christmas orders until December 5, 2026. Order now: limited holiday items sell out, and shipping and customs take time in December.",
  alternates: {
    canonical: "/blog/order-christmas-gifts-from-japan-2026",
    languages: blogLanguageAlternates("order-christmas-gifts-from-japan-2026"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Christmas orders from Japan: order now, until December 5",
    description: "We accept Christmas orders until December 5, 2026. Send your request now.",
    url: "https://kizunaproxy.com/blog/order-christmas-gifts-from-japan-2026",
  },
};

export default function Page() {
  return <ChristmasClient />;
}
