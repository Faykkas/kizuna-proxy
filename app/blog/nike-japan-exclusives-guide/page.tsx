// @ts-nocheck
import type { Metadata } from "next";
import NikeClient from "./NikeClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "How to Buy Nike Japan Exclusives — Kizuna Proxy Guide 2026",
  description: "Nike Japan releases exclusive sneakers, collabs and limited editions unavailable outside Japan. Buy Nike Japan exclusives with Kizuna Proxy — shipped worldwide.",
  alternates: {
    canonical: "/blog/nike-japan-exclusives-guide",
    languages: blogLanguageAlternates("nike-japan-exclusives-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "How to Buy Nike Japan Exclusives — Complete Guide 2026",
    description: "Nike Japan exclusives shipped worldwide via Tokyo proxy service.",
    url: "https://kizunaproxy.com/blog/nike-japan-exclusives-guide",
  },
};

export default function BlogNike() {
  return <NikeClient />;
}
