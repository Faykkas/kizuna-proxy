import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Tokyo Events & Exclusive Releases — Kizuna Proxy",
  description:
    "Pokémon Center drops, Nintendo Store Tokyo exclusives, Supreme Japan releases, and pop-up events — we queue and buy in person in Tokyo, then ship worldwide.",
  keywords: [
    "tokyo events proxy", "pokemon center tokyo drop", "supreme japan drop proxy",
    "nintendo store tokyo exclusive", "japan pop-up event proxy", "tokyo store queue service",
  ],
  alternates: { canonical: "https://kizunaproxy.com/events" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Tokyo Events & Exclusive Releases — Kizuna Proxy",
    description:
      "Pokémon Center drops, Nintendo Store Tokyo exclusives, Supreme Japan releases — we queue in Tokyo and ship worldwide.",
    url: "https://kizunaproxy.com/events",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
