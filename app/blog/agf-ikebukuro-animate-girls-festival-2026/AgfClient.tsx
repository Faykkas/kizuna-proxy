// @ts-nocheck
"use client";

import EventGuideClient from "../EventGuideClient";

export default function AgfClient({ locale } = {}) {
  return <EventGuideClient guideKey="agf2026" locale={locale} />;
}
