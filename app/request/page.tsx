import type { Metadata } from "next";
import RequestClient from "./RequestClient";

export const metadata: Metadata = {
  title: "Request an Item from Japan — Free Quote in 24h | Kizuna Proxy",
  description: "Tell us what you want from Japan and get a free personalised quote within 24 hours. No commitment, transparent pricing, worldwide shipping from Tokyo.",
  alternates: { canonical: "https://kizunaproxy.com/request" },
  openGraph: {
    title: "Request an Item from Japan — Kizuna Proxy",
    description: "Tell us what you want from Japan and get a free personalised quote within 24 hours. No commitment, transparent pricing, worldwide shipping from Tokyo.",
    url: "https://kizunaproxy.com/request",
  },
};

export default function RequestPage() {
  return <RequestClient />;
}
