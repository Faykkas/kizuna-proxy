// @ts-nocheck
import type { Metadata } from "next";
import ShippingGuideClient from "./ShippingGuideClient";

export const metadata: Metadata = {
  title: "Japan International Shipping Guide 2026 — EMS, FedEx, DHL | Kizuna Proxy",
  description: "Complete guide to shipping from Japan in 2026. EMS, FedEx, DHL, Yamato compared. USA $100 gift limit explained. How to choose the best shipping method for your order.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Shipping Guide 2026 — EMS vs FedEx vs DHL",
    description: "Which shipping method from Japan is best for you? Complete 2026 guide.",
    url: "https://kizunaproxy.com/blog/japan-shipping-guide-2026",
  },
};

export default function BlogShippingGuide() {
  return <ShippingGuideClient />;
}
