// @ts-nocheck
import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Kizuna Proxy | Japan Proxy Service Questions",
  description: "All your questions about Kizuna Proxy answered. How it works, pricing, shipping, Mercari Japan, Yahoo Auctions, Tokyo store visits and more.",
};

export default function FAQPage() {
  return <FaqClient />;
}
