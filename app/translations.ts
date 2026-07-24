// @ts-nocheck
// ─── SITE COPY (English only) ────────────────────────────────────────────────
// Le site est monolingue depuis la v5. Ce fichier conserve le nom
// `translations` et l'objet `t` pour que les composants existants continuent
// de fonctionner sans réécriture — ils lisent simplement toujours l'anglais.

export const copy = {
  hero: {
    eyebrow: "Tokyo-based proxy service",
    title1: "Your trusted",
    title2: "link to Japan",
    desc: "We buy anything from Japan on your behalf — online or in-store — and ship it directly to your door.",
    cta: "Request an item",
    ctaSecondary: "See pricing",
    followUs: "Follow us",
    prop1: "Pokémon Center drops",
    prop2: "Supreme Japan exclusives",
    prop3: "Nintendo Tokyo events",
    prop4: "Mercari & Yahoo Auctions",
    prop5: "Any store in Tokyo — we're there",
  },
  nav: { request: "Request an item", pricing: "Pricing", faq: "FAQ", gallery: "Gallery", events: "Events", services: "Services", howItWorks: "How it works", reviews: "Reviews" },
  whatWeBuy: {
    label: "Services",
    title: "We buy",
    titleEm: "anything from Japan",
    desc: "From the biggest marketplaces to exclusive physical stores — if it exists in Japan, we can get it.",
    items: [
      { title: "Online marketplaces", desc: "Mercari Japan, Yahoo Auctions, Rakuten, Amazon JP — we handle all communication with sellers." },
      { title: "Secondhand & vintage", desc: "Millions of listings daily — collector items, manga, retro games, fashion and more." },
      { title: "Limited drops & collabs", desc: "Nike Japan exclusives, Supreme collabs, BAPE — we queue and visit stores to secure them." },
      { title: "Pokémon & anime goods", desc: "Japan-exclusive Pokémon cards, figures, One Piece, Dragon Ball goods." },
      { title: "Gaming & electronics", desc: "Nintendo Switch Japan titles, retro consoles, PlayStation Japan editions." },
      { title: "Tokyo store visits", desc: "Akihabara, Shibuya, Harajuku, Nakano Broadway — we visit any store in Tokyo on your behalf." },
    ],
  },
  howItWorks: {
    label: "How it works",
    title: "Simple as sending",
    titleEm: "a message",
    desc: "From your first message to delivery at your door — 3 steps.",
    step1Title: "Send your request",
    step1Body: "Share the link, photo, or details of the item you want. The more detail, the better we can help.",
    step2Title: "Confirm & pay",
    step2Body: "We study the request together, confirm every detail, then you pay the item price and our fee before we proceed.",
    step3Title: "Receive your item",
    step3Body: "Once ready, we choose the shipping method together. All costs remain fully transparent and easy to verify.",
    whyKizuna: {
      label: "Why Kizuna",
      title: "Personal service,",
      titleEm: "not a platform",
      desc: "Big proxy services are automated platforms. We are real people in Tokyo — here's why that matters.",
      ticker: "Recent orders",
      cards: [
        { title: "Real person, not a bot", desc: "Every request is handled by us personally. You speak directly with the person buying your item." },
        { title: "Based in Tokyo", desc: "We are physically in Tokyo. We visit stores, attend events, and check items in person." },
        { title: "Direct communication", desc: "WhatsApp, Discord, email — real answers within 24 hours. No chatbots, no automated responses." },
        { title: "Fluent in Japanese", desc: "We communicate directly with Japanese sellers — no translation delays, no misunderstandings." },
        { title: "We find what others can't", desc: "Physical store visits, live shopping calls, exclusive events — we go where automated services cannot." },
        { title: "Shipped to 20+ countries", desc: "Trusted by customers in USA, Canada, France, Germany, Greece, Indonesia and more." },
      ],
    },
  },
  calendar: { label: "Availability", title: "Check", titleEm: "availability", desc: "See when we are available for new orders.", tzNote: "All times are in", upcoming: "Upcoming events", noEvents: "No events this month", noUpcoming: "No upcoming events" },
  reviews: { label: "Customer reviews", title: "Trusted by collectors", titleEm: "worldwide", basedOn: "Based on verified Reddit reviews" },
  pricing: {
    label: "Pricing", title: "Fully", titleEm: "personalised",
    desc: "Every request is unique — our pricing adapts to your order. Contact us for a transparent quote.",
    card1Title: "No hidden fees", card1Desc: "Every cost is communicated clearly before any payment. What we quote is what you pay.",
    card2Title: "Adapted to your order", card2Desc: "One item or a large haul — we study each request individually and offer the fairest rate.",
    card3Title: "Get a quote in 24h", card3Desc: "Send us your request and we reply with a detailed, honest quote — no commitment required.",
    weeklyShipping: "Weekly shipping",
    weeklyShippingDesc: "Packages are consolidated and shipped once a week from Tokyo. Order early in the week for the fastest dispatch.",
    ctaTitle: "Ready to place a request?",
    ctaDesc: "Describe your item and we'll get back to you with a personalised quote as soon as possible.",
    useForm: "Use the form",
    contactUs: "Contact us",
  },
  shipping: {
    label: "Shipping partners",
    ems: "Japan Post EMS", emsDesc: "Express Mail Service — fast, tracked, affordable. Available worldwide.",
    yamato: "Yamato Transport (TA-Q-BIN)",
    fedex: "FedEx International", fedexDesc: "Recommended for high-value orders to USA and Canada. Full tracking, faster customs clearance.",
    dhl: "DHL Express", dhlDesc: "Premium express worldwide delivery. Excellent coverage across Europe.",
    note: "Shipping method and costs are always discussed together before any payment.",
  },
  gallery: { label: "Gallery", title: "Real orders,", titleEm: "real customers", desc: "A selection of items we have purchased and shipped for our customers." },
  request: {
    label: "Request an item", title: "Start your", titleEm: "request",
    desc: "Fill in the form below and we'll get back to you within 24 hours with a quote.",
    sideDesc: "Tell us what you want from Japan and we'll handle everything.",
    detail1Title: "Free quote", detail1Sub: "No commitment required",
    detail2Title: "Reply within 24h", detail2Sub: "Real person, not a bot",
    detail3Title: "Transparent pricing", detail3Sub: "No hidden fees",
    detail4Title: "Worldwide shipping", detail4Sub: "EMS, FedEx, DHL",
    fieldName: "Your name", fieldEmail: "Email", fieldContact: "Preferred contact",
    fieldContactHint: "(optional)", fieldContactPlaceholder: "WhatsApp, Discord, Instagram…",
    fieldPlatform: "Platform", fieldPlatformPlaceholder: "Mercari, Yahoo Auctions, store visit…",
    fieldLink: "Item link", fieldCountry: "Your country",
    fieldCountryPlaceholder: "USA, France, Canada…",
    fieldMessage: "Describe your item",
    fieldMessagePlaceholder: "Item name, colour, size, quantity, any other details…",
    errName: "Name is required", errEmail: "Email is required", errEmailInvalid: "Invalid email",
    errContact: "Contact is required", errCountry: "Country is required", errMessage: "Please describe your item",
    submit: "Send request", sending: "Sending…", errorMsg: "Something went wrong. Please try again.",
    successTitle: "Request sent!", successDesc: "We'll get back to you within 24 hours.", successBtn: "Send another request",
    footNote: "Your information is never shared with third parties.",
  },
  faq: {
    label: "FAQ", title: "Common", titleEm: "questions", contactPrefix: "Can't find your answer?", contactEmail: "Email us", contactSuffix: "— we reply within 24 hours.", ctaTitle: "Still have a question?", ctaDesc: "We reply within 24 hours — real answers, no bots.", ctaBtn: "Contact us →",
    items: [
      { q: "How much does the service cost?", a: "Our pricing is fully personalised. Contact us for a free, transparent quote. No hidden fees. Large orders get a percentage fee instead of per-item charges." },
      { q: "Can you buy from Mercari Japan?", a: "Yes — most Mercari orders are purchased the same day. We handle all Japanese communication with sellers." },
      { q: "Can you visit physical stores in Tokyo?", a: "Yes. Pokémon Center, Nintendo Store, Supreme Japan, Akihabara and any Tokyo store. We can even do a live video call while we shop." },
      { q: "Which countries do you ship to?", a: "Worldwide — USA, Canada, France, UK, Germany, Greece, Indonesia, Korea and more via EMS, FedEx or DHL." },
      { q: "How long does shipping take?", a: "5–10 days via EMS, 2–4 days via FedEx or DHL. Full tracking always provided." },
      { q: "When do I pay?", a: "Payment in two parts: item price + service fee before purchase, then shipping costs once your item is ready." },
    ],
  },
  news: { label: "Latest news", title: "Updates &", titleEm: "announcements" },
  blog: { label: "Guides", title: "Learn how to", titleEm: "buy from Japan", desc: "Practical guides to help you find and buy any item from Japan.", cta: "Read guide →" },
  whyKizuna: { label: "Why Kizuna", title: "Personal service,", titleEm: "not a platform", desc: "Big proxy services are automated. We are real people in Tokyo.", ticker: "Recent orders" },
  footerNav: { howItWorks: "How it works", reviews: "Reviews", events: "Tokyo Events 🎌", tagline: "Tokyo-based proxy service. Your trusted link to Japan." },
  footer: { rights: "© 2026 Kizuna Proxy · Ginza, Tokyo" },
  eventsFloat: { title: "Tokyo Events", desc: "Pokémon Center, Nintendo, Supreme drops & more — we attend in person.", urgency: "⚡ High demand — book early to avoid delays.", cta: "Learn more" },
    announce: { pill: "Notice" },
  trustpilot: "Reviews",
  about: {}
};

/** Objet unique utilisé par tous les composants */
export const t = copy;

/* ── Compatibilité ──────────────────────────────────────────────────────────
   Ces exports permettent au code existant de continuer à fonctionner.
   À supprimer quand plus rien ne les utilise. */
export const translations = { en: copy };
export const LANG_LABELS = { en: "EN" };
export function detectLang() { return "en"; }
export type Lang = "en";
export type T = typeof copy;
