import type { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Announcements — Kizuna Proxy | Shipping & Service Updates",
  description: "Latest news from Kizuna Proxy — shipping schedule changes, service updates, and Tokyo events, all in one place.",
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Announcements — Kizuna Proxy",
    description: "Shipping news, service changes and Tokyo events from Kizuna Proxy.",
    url: "https://kizunaproxy.com/news",
  },
};

export default function NewsArchivePage() {
  return <NewsClient />;
}
