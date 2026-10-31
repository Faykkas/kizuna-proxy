import type { Metadata } from "next";
import InfoPage from "../components/InfoPage";

export const metadata: Metadata = {
  title: "Good to know — service rules | Kizuna Proxy",
  description: "Payment, shipping, customs and purchase rules explained honestly before you send your first request to Kizuna Proxy.",
  alternates: { canonical: "https://kizunaproxy.com/good-to-know" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Good to know — Kizuna Proxy",
    description: "The service rules, explained honestly before you send your first request.",
    url: "https://kizunaproxy.com/good-to-know",
  },
};

export default function GoodToKnowPage() {
  return <InfoPage which="rules" />;
}
