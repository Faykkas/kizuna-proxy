import type { Metadata } from "next";
import CoachOfficialClient from "./CoachOfficialClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Buy Coach Bags in Japan from Official Stores | Kizuna Proxy",
  description: "Kizuna Proxy buys Coach bags for you in official Coach stores all over Japan. Professional, transparent process: request, confirmation, purchase in an official boutique, photos and tracked shipping.",
  alternates: {
    canonical: "/blog/buy-coach-bags-japan",
    languages: blogLanguageAlternates("buy-coach-bags-japan"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Buy Coach Bags in Japan from Official Stores",
    description: "We buy Coach bags in official stores across Japan and ship them to you with tracking. Here is how our professional process works.",
    url: "https://kizunaproxy.com/blog/buy-coach-bags-japan",
  },
};

export default function BlogCoachBags() {
  return <CoachOfficialClient />;
}
