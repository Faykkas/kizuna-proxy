import type { Metadata } from "next";
import FukubukuroClient from "./FukubukuroClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Fukubukuro 2027: Japan's New Year Lucky Bags, Dates and Lotteries | Kizuna Proxy",
  description: "Fukubukuro 2027 in Japan: in-store dates (January 1–3), pre-order lotteries, Starbucks Japan's lucky bag rules and what Kizuna can and cannot do for you.",
  alternates: {
    canonical: "/blog/fukubukuro-japan-lucky-bags-2027-guide",
    languages: blogLanguageAlternates("fukubukuro-japan-lucky-bags-2027-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Fukubukuro 2027: Japan's New Year lucky bags",
    description: "Dates, lotteries and rules for Japan's New Year lucky bags.",
    url: "https://kizunaproxy.com/blog/fukubukuro-japan-lucky-bags-2027-guide",
  },
};

export default function Page() {
  return <FukubukuroClient />;
}
