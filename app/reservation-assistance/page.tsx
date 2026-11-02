import type { Metadata } from "next";
import ReservationClient from "./ReservationClient";

const TITLE = "Japan Hotel & Restaurant Reservation Assistance | Kizuna Proxy";
const DESC = "Need a hotel or restaurant booked in Japan? Kizuna Proxy helps international visitors contact Japanese establishments to request reservations. ¥1,500 per assistance request.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["Japan hotel reservation assistance", "Japan restaurant reservation assistance", "book restaurant in Japan for tourists", "Japan reservation help", "Tokyo restaurant booking service"],
  alternates: { canonical: "https://kizunaproxy.com/reservation-assistance" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: TITLE,
    description: DESC,
    url: "https://kizunaproxy.com/reservation-assistance",
  },
};

// Données structurées : un service à prix fixe (¥1,500 par demande), sans rien promettre de plus.
const SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Japan Hotel & Restaurant Reservation Assistance",
  serviceType: "Reservation assistance",
  description: DESC,
  provider: { "@type": "Organization", name: "Kizuna Proxy", url: "https://kizunaproxy.com" },
  areaServed: "Japan",
  offers: { "@type": "Offer", price: "1500", priceCurrency: "JPY", url: "https://kizunaproxy.com/reservation-assistance" },
};

export default function ReservationAssistancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_LD) }} />
      <ReservationClient />
    </>
  );
}
