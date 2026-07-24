import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works — Buy from Japan in 3 Steps | Kizuna Proxy",
  description: "Buying from Japan with Kizuna Proxy in three steps: send your request, confirm and pay, receive your item. Real people in Tokyo, replies within 24 hours.",
  alternates: { canonical: "https://kizunaproxy.com/how-it-works" },
  openGraph: {
    title: "How It Works — Kizuna Proxy",
    description: "Buying from Japan with Kizuna Proxy in three steps: send your request, confirm and pay, receive your item. Real people in Tokyo, replies within 24 hours.",
    url: "https://kizunaproxy.com/how-it-works",
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
