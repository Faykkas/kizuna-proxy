import type { Metadata } from "next";
import ComiketClient from "./ComiketClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Comiket Proxy Shopping Guide 2026 | Kizuna Proxy",
  description: "Can't make it to Comiket? We queue and buy doujinshi, art books, and merch in person at Tokyo Big Sight, cash in hand, then ship worldwide. Dates, catalog, and how it works.",
  alternates: {
    canonical: "/blog/comiket-japan-guide",
    languages: blogLanguageAlternates("comiket-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Comiket Proxy Shopping Guide 2026",
    description: "We queue and buy at Comiket in person — doujinshi, art books, and indie merch, shipped worldwide.",
    url: "https://kizunaproxy.com/blog/comiket-japan-guide",
  },
};

export default function BlogComiket() {
  return <ComiketClient />;
}
