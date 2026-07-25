import type { Metadata } from "next";
import ShippingClient from "./ShippingClient";

export const metadata: Metadata = {
  title: "Shipping Cost Calculator — EMS from Japan | Kizuna Proxy",
  description:
    "Work out what shipping from Japan will cost you. Official Japan Post EMS rates by weight and country, plus a clear explanation of import taxes for the USA, EU, UK, Canada and Australia.",
  keywords: [
    "ems shipping cost japan", "japan post ems calculator", "shipping from japan to usa cost",
    "japan import tax usa", "customs fees japan package", "de minimis japan usa",
    "ems rates by country", "how much to ship from japan",
  ],
  alternates: { canonical: "https://kizunaproxy.com/shipping" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "What shipping from Japan really costs — Kizuna Proxy",
    description:
      "EMS rates by weight and country, and the import taxes nobody explains until the parcel is at your door.",
    url: "https://kizunaproxy.com/shipping",
  },
};

export default function ShippingPage() {
  return <ShippingClient />;
}
