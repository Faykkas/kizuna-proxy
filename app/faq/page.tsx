import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Kizuna Proxy | Your Questions Answered",
  description: "Everything you need to know about Kizuna Proxy — pricing, shipping, Mercari Japan, Rakuma, Tokyo store visits, and more.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "FAQ — Kizuna Proxy",
    description: "Your questions about our Japan proxy service answered.",
    url: "https://kizunaproxy.com/faq",
  },
};

export default function FAQPage() {
  return <FaqClient />;
}
