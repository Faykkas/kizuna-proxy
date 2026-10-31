// @ts-nocheck
"use client";

import EventGuideClient from "../EventGuideClient";

export default function BiohazardClient({ locale } = {}) {
  return <EventGuideClient guideKey="biohazard30" locale={locale} />;
}
