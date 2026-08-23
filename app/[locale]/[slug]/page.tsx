// @ts-nocheck
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUPPORTED_LANGS } from "../../translations";
import { landingTranslations } from "../../landingTranslations";
import { businessSourcingTranslations } from "../../businessSourcingTranslations";
import { LANDING_ROUTES, LANDING_SLUGS } from "../../landingRoutes";
import { landingLanguageAlternates } from "../../landingHreflang";

// businessSourcing lives in its own translations file (not the shared
// landingTranslations.ts) — merged here so route.key lookups work the same
// way regardless of which file a landing page's content lives in.
const ALL_LANDING_TRANSLATIONS = { ...landingTranslations, businessSourcing: businessSourcingTranslations };

const LOCALES = SUPPORTED_LANGS.filter((l) => l !== "en");

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    LANDING_SLUGS.map((slug) => ({ locale, slug }))
  );
}

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = LANDING_ROUTES[slug];
  if (!route || !LOCALES.includes(locale)) return {};

  const data = ALL_LANDING_TRANSLATIONS[route.key];
  const g = data[locale] || data.en;

  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: {
      canonical: `/${locale}/${slug}`,
      languages: landingLanguageAlternates(slug),
    },
    openGraph: {
      images: ["https://kizunaproxy.com/og-image.png"],
      title: g.ogTitle,
      description: g.ogDescription,
      url: `https://kizunaproxy.com/${locale}/${slug}`,
    },
  };
}

export default async function LocaleLandingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const route = LANDING_ROUTES[slug];
  if (!route || !LOCALES.includes(locale)) notFound();

  const { Component } = route;
  return <Component locale={locale} />;
}
