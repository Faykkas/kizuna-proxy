import type { Metadata } from "next";
import SanrioClient from "./SanrioClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Buy Sanrio in Japan from Official Stores | Kizuna Proxy",
  description: "Kizuna Proxy buys Sanrio items (Hello Kitty, My Melody, Cinnamoroll, Kuromi) for you in official stores all over Japan. Request, confirmation, purchase, photos and tracked shipping.",
  alternates: {
    canonical: "/blog/buy-sanrio-japan",
    languages: blogLanguageAlternates("buy-sanrio-japan"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Buy Sanrio in Japan from Official Stores",
    description: "We buy Sanrio items in official stores across Japan and ship them to you with tracking.",
    url: "https://kizunaproxy.com/blog/buy-sanrio-japan",
  },
};

export default function BlogSanrio() {
  return <SanrioClient />;
}
