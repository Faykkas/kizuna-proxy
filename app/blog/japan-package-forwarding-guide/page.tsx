import type { Metadata } from "next";
import ForwardingClient from "./ForwardingClient";
import { blogLanguageAlternates } from "../hreflang";

export const metadata: Metadata = {
  title: "Japan Package Forwarding & Storage | Kizuna Proxy",
  description: "Buy from any Japanese store or seller and ship it to our Tokyo address — we receive, store, and consolidate your packages on a flexible monthly plan, then ship everything worldwide when you're ready.",
  alternates: {
    canonical: "/blog/japan-package-forwarding-guide",
    languages: blogLanguageAlternates("japan-package-forwarding-guide"),
  },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Japan Package Forwarding & Storage",
    description: "Ship your Japanese purchases to our Tokyo address — we store and consolidate them on a monthly plan, then ship worldwide.",
    url: "https://kizunaproxy.com/blog/japan-package-forwarding-guide",
  },
};

export default function BlogForwarding() {
  return <ForwardingClient />;
}
