import type { Metadata } from "next";
import InfoPage from "../components/InfoPage";

export const metadata: Metadata = {
  title: "Why Kizuna — a personal shopper in Tokyo, not a platform | Kizuna Proxy",
  description: "Real people in Tokyo, direct communication and transparent costs: why customers choose Kizuna Proxy over automated proxy platforms.",
  alternates: { canonical: "https://kizunaproxy.com/why-kizuna" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Why Kizuna — Kizuna Proxy",
    description: "A personal shopper in Tokyo, not a platform: real people, direct communication, transparent costs.",
    url: "https://kizunaproxy.com/why-kizuna",
  },
};

export default function WhyKizunaPage() {
  return <InfoPage which="why" />;
}
