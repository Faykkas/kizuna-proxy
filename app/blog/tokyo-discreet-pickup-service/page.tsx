import type { Metadata } from "next";
import DiscreetPickupClient from "./DiscreetPickupClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Discreet Item Pickup in Tokyo | Kizuna Proxy",
  description: "Need a reserved item, a pre-order, or a waiting parcel collected in Tokyo without anyone noticing? We handle pickups quietly and professionally — trusted by public figures and high-profile clients before.",
  alternates: {
    canonical: "/blog/tokyo-discreet-pickup-service",
    languages: blogLanguageAlternates("tokyo-discreet-pickup-service"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Discreet Item Pickup in Tokyo",
    description: "Quiet, professional pickups in Tokyo — no branding, no questions asked, no trace unless you want one.",
    url: "https://kizunaproxy.com/blog/tokyo-discreet-pickup-service",
  },
};

export default function BlogDiscreetPickup() {
  return <DiscreetPickupClient />;
}
