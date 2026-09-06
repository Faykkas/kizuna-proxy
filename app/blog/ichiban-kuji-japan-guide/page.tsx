import type { Metadata } from "next";
import IchibanKujiClient from "./IchibanKujiClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Ichiban Kuji Proxy Buying Guide 2026 | Kizuna Proxy",
  description: "Want us to draw an Ichiban Kuji for you? We check stock, draw in person at convenience stores and kuji shops, and can buy out full boxes — then ship worldwide.",
  alternates: {
    canonical: "/blog/ichiban-kuji-japan-guide",
    languages: blogLanguageAlternates("ichiban-kuji-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Ichiban Kuji Proxy Buying Guide 2026",
    description: "We draw Ichiban Kuji in person in Japan — real random draws, full box buyouts where available, shipped worldwide.",
    url: "https://kizunaproxy.com/blog/ichiban-kuji-japan-guide",
  },
};

export default function BlogIchibanKuji() {
  return <IchibanKujiClient />;
}
