// @ts-nocheck
import type { Metadata } from "next";
import ShippingGuideClient from "./ShippingGuideClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Japan International Shipping Guide 2026 — EMS & Yamato | Kizuna Proxy",
  description: "Complete guide to shipping from Japan in 2026: EMS for international parcels, Yamato inside Japan, and how US customers pay import duties through Zonos before shipping.",
  alternates: {
    canonical: "/blog/japan-shipping-guide-2026",
    languages: blogLanguageAlternates("japan-shipping-guide-2026"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Shipping Guide 2026 — EMS, Yamato and Zonos",
    description: "Which shipping method from Japan is best for you? Complete 2026 guide.",
    url: "https://kizunaproxy.com/blog/japan-shipping-guide-2026",
  },
};

export default function BlogShippingGuide() {
  return <ShippingGuideClient />;
}
