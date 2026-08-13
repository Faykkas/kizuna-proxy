import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Personal Shopper in Tokyo — Stores, Pop-Ups & Japanese Online Shopping | Kizuna Proxy",
  description: "Your personal shopper in Tokyo: physical store visits, pop-up releases, fixed-price Mercari & Rakuma listings, and Japanese online stores. Real people, transparent quotes, shipped worldwide.",
  alternates: { canonical: "https://kizunaproxy.com/services" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Personal Shopper in Tokyo — Kizuna Proxy",
    description: "Physical store visits, pop-up releases, fixed-price Mercari & Rakuma listings, and Japanese online stores. Shipped worldwide.",
    url: "https://kizunaproxy.com/services",
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
