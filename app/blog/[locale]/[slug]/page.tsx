// @ts-nocheck
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUPPORTED_LANGS } from "../../../translations";
import { guideTranslations } from "../../../guideTranslations";
import { GUIDE_ROUTES, BLOG_SLUGS } from "../../guideRoutes";
import { blogLanguageAlternates } from "../../hreflang";

const LOCALES = SUPPORTED_LANGS.filter((l) => l !== "en");

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    BLOG_SLUGS.map((slug) => ({ locale, slug }))
  );
}

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = GUIDE_ROUTES[slug];
  if (!route || !LOCALES.includes(locale)) return {};

  const data = guideTranslations[route.key];
  const g = data[locale] || data.en;
  const title = `${g.title} ${g.titleEm} | Kizuna Proxy`;

  return {
    title,
    description: g.lead,
    alternates: {
      canonical: `/blog/${locale}/${slug}`,
      languages: blogLanguageAlternates(slug),
    },
    openGraph: {
      images: ["https://kizunaproxy.com/og-image.png"],
      title,
      description: g.lead,
      url: `https://kizunaproxy.com/blog/${locale}/${slug}`,
    },
  };
}

export default async function LocaleBlogPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const route = GUIDE_ROUTES[slug];
  if (!route || !LOCALES.includes(locale)) notFound();

  const { Component } = route;
  return <Component locale={locale} />;
}
