import type { Metadata } from "next";
import KpopClient from "./KpopClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "K-pop Photocards & Japan-Exclusive Albums Proxy Guide 2026 | Kizuna Proxy",
  description: "Want a Japan-exclusive K-pop release or a specific tokuten photocard? We visit Tower Records, HMV, and pop-up stores in Tokyo in person — then ship worldwide.",
  alternates: {
    canonical: "/blog/kpop-photocards-japan-guide",
    languages: blogLanguageAlternates("kpop-photocards-japan-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "K-pop Photocards & Japan Exclusives — Proxy Guide 2026",
    description: "We pick up Japan-exclusive K-pop albums and tokuten photocards in Tokyo, in person, then ship worldwide.",
    url: "https://kizunaproxy.com/blog/kpop-photocards-japan-guide",
  },
};

export default function BlogKpop() {
  return <KpopClient />;
}
