import type { Metadata } from "next";
import BiohazardClient from "./BiohazardClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Resident Evil 30th Anniversary Exhibition Tokyo (THE WORLD OF BIOHAZARD) | Kizuna Proxy",
  description: "THE WORLD OF BIOHAZARD 30th Anniversary Exhibition at Shibuya BEAM, October 30 – December 24, 2026: dates, hours, tickets, goods and how Kizuna buys official goods for you.",
  alternates: {
    canonical: "/blog/resident-evil-30th-anniversary-exhibition-tokyo",
    languages: blogLanguageAlternates("resident-evil-30th-anniversary-exhibition-tokyo"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Resident Evil 30th Anniversary Exhibition in Tokyo",
    description: "Dates, tickets and official goods for THE WORLD OF BIOHAZARD 30th Anniversary Exhibition in Shibuya, and how we buy goods for you.",
    url: "https://kizunaproxy.com/blog/resident-evil-30th-anniversary-exhibition-tokyo",
  },
};

export default function BlogBiohazard30() {
  return <BiohazardClient />;
}
