import type { Metadata } from "next";
import OnitsukaClient from "./OnitsukaClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Buy Onitsuka Tiger in Japan from Official Stores | Kizuna Proxy",
  description: "Kizuna Proxy buys Onitsuka Tiger sneakers and apparel for you in official stores all over Japan. Request, confirmation, purchase in an official store, photos and tracked shipping.",
  alternates: {
    canonical: "/blog/buy-onitsuka-tiger-japan",
    languages: blogLanguageAlternates("buy-onitsuka-tiger-japan"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Buy Onitsuka Tiger in Japan from Official Stores",
    description: "We buy Onitsuka Tiger in official stores across Japan and ship it to you with tracking.",
    url: "https://kizunaproxy.com/blog/buy-onitsuka-tiger-japan",
  },
};

export default function BlogOnitsuka() {
  return <OnitsukaClient />;
}
