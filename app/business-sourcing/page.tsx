import type { Metadata } from "next";
import BusinessSourcingClient from "./BusinessSourcingClient";
import { landingLanguageAlternates } from "../landingHreflang";

export const metadata: Metadata = {
  title: "Japan Product Sourcing for Businesses | Kizuna Proxy",
  description: "Professional retail sourcing in Tokyo for international stores, resellers and group-order managers. Access Japan-exclusive products, pop-up stores and limited events with Kizuna Proxy.",
  alternates: {
    canonical: "https://kizunaproxy.com/business-sourcing",
    languages: landingLanguageAlternates("business-sourcing"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Product Sourcing for Businesses | Kizuna Proxy",
    description: "Professional retail sourcing in Tokyo for international stores, resellers and group-order managers.",
    url: "https://kizunaproxy.com/business-sourcing",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Japan product sourcing for businesses",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Kizuna Proxy",
    "url": "https://kizunaproxy.com",
    "areaServed": "Tokyo, Japan",
  },
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "K-pop, anime, collectibles and Japanese fashion retailers, e-commerce sellers, group-order managers",
  },
  "areaServed": "Worldwide",
  "description": "Local sourcing and purchasing support in Tokyo for international businesses and resellers — targeted store and pop-up visits, online purchasing, consolidation and tracked international shipping.",
};

export default function BusinessSourcingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <BusinessSourcingClient />
    </>
  );
}
