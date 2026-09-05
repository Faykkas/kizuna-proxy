import type { Metadata } from "next";
import ComitiaClient from "./ComitiaClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "COMITIA Original Doujinshi Proxy Guide 2026 | Kizuna Proxy",
  description: "COMITIA is Tokyo's market for wholly original self-published work — cash-only, Japanese-only, and easy to miss from abroad. We queue and buy in person at Tokyo Big Sight, then ship worldwide.",
  alternates: {
    canonical: "/blog/comitia-japan-guide",
    languages: blogLanguageAlternates("comitia-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "COMITIA Original Doujinshi Proxy Guide 2026",
    description: "We queue and buy at COMITIA in person — original self-published manga, novels, and art books, shipped worldwide.",
    url: "https://kizunaproxy.com/blog/comitia-japan-guide",
  },
};

export default function BlogComitia() {
  return <ComitiaClient />;
}
