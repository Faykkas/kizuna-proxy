import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing & Shipping — Japan Proxy Service | Kizuna Proxy",
  description: "Transparent, personalised pricing for our Japan proxy service. No hidden fees, free quote within 24h. Shipping worldwide via EMS.",
  alternates: { canonical: "https://kizunaproxy.com/pricing" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Pricing & Shipping — Kizuna Proxy",
    description: "Transparent, personalised pricing for our Japan proxy service. No hidden fees, free quote within 24h. Shipping worldwide via EMS.",
    url: "https://kizunaproxy.com/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
