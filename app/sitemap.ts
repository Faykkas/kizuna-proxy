import type { MetadataRoute } from "next";

const BASE = "https://kizunaproxy.com";

const BLOG_SLUGS = [
  "how-to-buy-from-mercari-japan",
  "yahoo-auctions-japan-guide",
  "best-pokemon-cards-japan-2026",
  "pokemon-center-tokyo-exclusives",
  "supreme-japan-drops-guide",
  "nike-japan-exclusives-guide",
  "anime-figures-japan-guide",
  "japanese-trading-cards-guide-2026",
  "japan-shipping-guide-2026",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const main = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/services`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/pricing`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/how-it-works`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/request`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/reviews`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE}/faq`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/events`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE}/news`, priority: 0.7, changeFrequency: "weekly" as const },
  ];

  const blog = BLOG_SLUGS.map(slug => ({
    url: `${BASE}/blog/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...main, ...blog].map(entry => ({ ...entry, lastModified: now }));
}
