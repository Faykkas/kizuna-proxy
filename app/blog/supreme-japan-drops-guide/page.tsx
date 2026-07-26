// @ts-nocheck
import type { Metadata } from "next";
import SupremeClient from "./SupremeClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "How to Buy Supreme Japan Drops — Kizuna Proxy Guide 2026",
  description: "Supreme Japan drops every Thursday. Limited stock, no international shipping. Learn how to get Supreme Japan exclusives delivered worldwide with Kizuna Proxy.",
  alternates: {
    canonical: "/blog/supreme-japan-drops-guide",
    languages: blogLanguageAlternates("supreme-japan-drops-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "How to Buy Supreme Japan Drops — Complete Guide 2026",
    description: "Supreme Japan drops every Thursday — we queue for you and ship worldwide.",
    url: "https://kizunaproxy.com/blog/supreme-japan-drops-guide",
  },
};

export default function BlogSupreme() {
  return <SupremeClient />;
}
