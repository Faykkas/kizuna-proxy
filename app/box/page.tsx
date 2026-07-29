import type { Metadata } from "next";
import BoxClient from "./BoxClient";

export const metadata: Metadata = {
  title: "Kizuna Box — A Box of Japan, Coming Soon | Kizuna Proxy",
  description: "Kizuna Box: real Japanese drinks and snacks plus a random gachapon surprise, hand-picked in Tokyo. Coming soon — join the waitlist to be first in line.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Kizuna Box — A Box of Japan, Coming Soon",
    description: "Real Japanese drinks, snacks and a gachapon surprise, hand-picked in Tokyo. Join the waitlist.",
    url: "https://kizunaproxy.com/box",
  },
};

export default function BoxPage() {
  return <BoxClient />;
}
