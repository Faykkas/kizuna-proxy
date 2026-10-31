import type { Metadata } from "next";
import AgfClient from "./AgfClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Animate Girls Festival (AGF) 2026 Ikebukuro Guide | Kizuna Proxy",
  description: "Animate Girls Festival (AGF) 2026 in Ikebukuro, November 7–8: tickets and face recognition, shopper bags, exclusive booth goods, rules, and how Kizuna buys booth goods for you.",
  alternates: {
    canonical: "/blog/agf-ikebukuro-animate-girls-festival-2026",
    languages: blogLanguageAlternates("agf-ikebukuro-animate-girls-festival-2026"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Animate Girls Festival (AGF) 2026 in Ikebukuro",
    description: "Tickets, shopper bags and booth goods at AGF 2026 in Ikebukuro, and how we buy goods for you.",
    url: "https://kizunaproxy.com/blog/agf-ikebukuro-animate-girls-festival-2026",
  },
};

export default function BlogAgf2026() {
  return <AgfClient />;
}
