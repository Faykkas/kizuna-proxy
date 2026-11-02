import type { Metadata } from "next";
import PricingClient from "./PricingClient";

const TITLE = "Japan Proxy Buying & Personal Shopper Pricing | Kizuna Proxy";
const DESC =
  "Transparent service fees for Japan proxy buying: Mercari online orders at ¥2,500 per item, Tokyo in-store shopping, Onitsuka Tiger, Coach Japan sourcing, package storage, store pickup and business sourcing. All prices in yen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "Japan proxy buying service", "Japan personal shopper", "Mercari Japan proxy", "Japan in-store shopping service",
    "Tokyo personal shopper", "Coach Japan sourcing", "Japan package forwarding", "Japanese store pickup service",
    "Onitsuka Tiger Japan proxy", "Japan business sourcing", "Japan hotel reservation assistance", "Japan restaurant reservation assistance",
  ],
  alternates: { canonical: "https://kizunaproxy.com/pricing" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Transparent Pricing for Shopping in Japan — Kizuna Proxy",
    description: DESC,
    url: "https://kizunaproxy.com/pricing",
  },
};

// Données structurées : seulement les services à prix fixe ou « à partir de », tels qu'affichés sur la page.
const provider = { "@type": "Organization", name: "Kizuna Proxy", url: "https://kizunaproxy.com" };
const fixed = (name: string, price: number, description: string, area = "Japan") => ({
  "@type": "Service",
  name,
  description,
  provider,
  areaServed: area,
  offers: { "@type": "Offer", price: String(price), priceCurrency: "JPY", url: "https://kizunaproxy.com/pricing" },
});
const from = (name: string, minPrice: number, description: string) => ({
  "@type": "Service",
  name,
  description,
  provider,
  areaServed: "Japan",
  offers: { "@type": "Offer", priceCurrency: "JPY", url: "https://kizunaproxy.com/pricing", priceSpecification: { "@type": "PriceSpecification", priceCurrency: "JPY", minPrice } },
});

const LD = {
  "@context": "https://schema.org",
  "@graph": [
    from("Japan online proxy shopping (Mercari and other platforms)", 500, "Service fee of ¥2,500 per item; ¥500 per item for high-volume customers ordering at least 10 items per month."),
    fixed("Onitsuka Tiger & Japanese store online purchases", 5000, "¥5,000 service fee per order, regardless of the number of items in the order."),
    fixed("Tokyo in-store personal shopping reservation", 5000, "¥5,000 per reservation plus ¥1,000 per successfully collected item."),
    fixed("Japan store pickup service", 5000, "¥5,000 per pickup request."),
    fixed("Package receiving in Japan", 5000, "¥5,000 per received box, by prior arrangement."),
    fixed("Seller communication on Japanese marketplaces", 500, "¥500 per message sent to a seller on the customer's behalf."),
    from("Package storage & forwarding in Japan", 3000, "Storage from ¥3,000 per month, quoted individually according to the space required."),
    fixed("Japan hotel & restaurant reservation assistance", 1500, "¥1,500 per reservation assistance request."),
  ],
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <PricingClient />
    </>
  );
}
