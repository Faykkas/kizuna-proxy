import type { Metadata } from "next";
import PorterClient from "./PorterClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Buy PORTER Yoshida Bags in Japan from Official Stores | Kizuna Proxy",
  description: "Kizuna Proxy buys PORTER (Yoshida & Co.) bags for you in official stores all over Japan. Request, confirmation, purchase in an official store, photos and tracked shipping.",
  alternates: {
    canonical: "/blog/buy-porter-yoshida-bags-japan",
    languages: blogLanguageAlternates("buy-porter-yoshida-bags-japan"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Buy PORTER Bags in Japan from Official Stores",
    description: "We buy PORTER bags in official stores across Japan and ship them to you with tracking.",
    url: "https://kizunaproxy.com/blog/buy-porter-yoshida-bags-japan",
  },
};

export default function BlogPorter() {
  return <PorterClient />;
}
