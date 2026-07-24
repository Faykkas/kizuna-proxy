import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing & Shipping — Japan Proxy Service | Kizuna Proxy",
  description: "Transparent, personalised pricing for our Japan proxy service. No hidden fees, free quote within 24h. Shipping worldwide via EMS, Yamato, FedEx and DHL.",
  alternates: { canonical: "https://kizunaproxy.com/pricing" },
  openGraph: {
    title: "Pricing & Shipping — Kizuna Proxy",
    description: "Transparent, personalised pricing for our Japan proxy service. No hidden fees, free quote within 24h. Shipping worldwide via EMS, Yamato, FedEx and DHL.",
    url: "https://kizunaproxy.com/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
