// @ts-nocheck
// app/lib/orderStatus.ts
//
// Single source of truth for order statuses. The customer dashboard, the
// admin panel and the email templates all read from here, so a status can
// never mean two different things in two places.

/**
 * The timeline the customer sees. Order matters — it is the progression.
 *
 * `terminal: true` marks statuses that end the journey (delivered/cancelled)
 * and so are not drawn as steps on the progress bar.
 */
export const TIMELINE = [
  {
    key: "Pending",
    label: "Request received",
    hint: "We're reviewing your request and checking availability.",
    icon: "hourglass",
  },
  {
    key: "Purchasing",
    label: "Purchasing",
    hint: "We're buying your item right now.",
    icon: "glass",
  },
  {
    key: "Purchased",
    label: "Purchased",
    hint: "Your item is bought and on its way to us.",
    icon: "check",
  },
  {
    key: "Seller Shipped",
    label: "Seller shipped",
    hint: "The seller has dispatched the item to our Tokyo address.",
    icon: "truck",
  },
  {
    key: "Received in Japan",
    label: "Received in Japan",
    hint: "Your item has arrived at our Tokyo office.",
    icon: "box",
  },
  {
    key: "Photos Uploaded",
    label: "Photos uploaded",
    hint: "Check the photos below before we pack it.",
    icon: "card",
  },
  {
    key: "Packing",
    label: "Packing",
    hint: "We're packing your item securely for its trip.",
    icon: "box",
  },
  {
    key: "Awaiting Shipping Payment",
    label: "Shipping payment due",
    hint: "Shipping is quoted. Pay below and we'll send it out.",
    icon: "coins",
    needsAction: true,
  },
  {
    key: "Shipped",
    label: "Shipped",
    hint: "On its way to you. Track it below.",
    icon: "truck",
  },
  {
    key: "Delivered",
    label: "Delivered",
    hint: "Enjoy! Thanks for trusting us.",
    icon: "check",
    terminal: true,
  },
];

/** Statuses that sit outside the normal flow */
export const SPECIAL_STATUSES = {
  "Action Required": {
    label: "Action needed",
    hint: "We need something from you — check your email or contact us.",
    tone: "alert",
  },
  "Purchased — Awaiting Event": {
    label: "Waiting for event",
    hint: "We'll attend the event on your behalf. See the date below.",
    tone: "info",
  },
  Cancelled: {
    label: "Cancelled",
    hint: "This order was cancelled.",
    tone: "muted",
    terminal: true,
  },
};

/** Legacy statuses from the old admin, mapped onto the new timeline */
const LEGACY_MAP = {
  "Purchased — Awaiting Delivery": "Seller Shipped",
};

export function normaliseStatus(status) {
  return LEGACY_MAP[status] || status;
}

/** Every status the admin can pick, in a sensible order */
export const ALL_STATUSES = [
  ...TIMELINE.map(s => s.key),
  ...Object.keys(SPECIAL_STATUSES),
];

/** How far along the timeline is this order? Returns -1 for special statuses. */
export function stepIndex(status) {
  return TIMELINE.findIndex(s => s.key === normaliseStatus(status));
}

/** Percentage for the progress bar */
export function progressPercent(status) {
  const i = stepIndex(status);
  if (i < 0) return 0;
  return Math.round((i / (TIMELINE.length - 1)) * 100);
}

/** What happens next — answers "where is my order?" without a support message */
export function nextStep(status) {
  const s = normaliseStatus(status);
  if (SPECIAL_STATUSES[s]) return SPECIAL_STATUSES[s].hint;

  const i = stepIndex(s);
  if (i < 0) return null;
  if (i >= TIMELINE.length - 1) return null;
  return TIMELINE[i + 1].label;
}

export function statusMeta(status) {
  const s = normaliseStatus(status);
  return (
    TIMELINE.find(t => t.key === s) ||
    SPECIAL_STATUSES[s] || { label: s, hint: "", icon: "hourglass" }
  );
}

/** Does this status require the customer to do something? */
export function needsCustomerAction(status) {
  const s = normaliseStatus(status);
  return s === "Awaiting Shipping Payment" || s === "Action Required";
}

/** Theme colour for a status badge */
export function statusColor(status) {
  const s = normaliseStatus(status);
  if (s === "Delivered") return "var(--px-accent)";
  if (s === "Cancelled") return "var(--px-muted)";
  if (needsCustomerAction(s)) return "var(--px-red)";
  if (s === "Shipped") return "var(--px-accent2)";
  return "var(--px-muted)";
}

/** Yen formatting, used everywhere amounts appear */
export function formatJPY(n) {
  if (n == null) return "—";
  return "¥" + Number(n).toLocaleString("en-US");
}

/**
 * Order titles come from a free-text field the admin fills in, so they are
 * often a raw URL pasted from Mercari or Yahoo. Showing that to a customer
 * is unreadable — this turns it into something they can recognise.
 */
const SITE_NAMES = {
  "mercari.com": "Mercari",
  "jp.mercari.com": "Mercari",
  "auctions.yahoo.co.jp": "Yahoo Auctions",
  "page.auctions.yahoo.co.jp": "Yahoo Auctions",
  "rakuten.co.jp": "Rakuten",
  "amazon.co.jp": "Amazon JP",
  "hmv.co.jp": "HMV",
  "suruga-ya.jp": "Suruga-ya",
  "bookoff.co.jp": "Book Off",
  "pokemoncenter-online.com": "Pokémon Center",
  "store-jp.nintendo.com": "Nintendo Store",
  "mandarake.co.jp": "Mandarake",
  "yodobashi.com": "Yodobashi",
  "essential-japan.com": "Essential Japan",
};

export function orderTitle(items, fallback = "Your order") {
  if (!items || !items.trim()) return fallback;

  const text = items.trim();
  const urls = text.match(/https?:\/\/[^\s]+/g);

  // No URL at all — the admin wrote a real description
  if (!urls) return text;

  // Some description alongside the links: keep the description
  const withoutUrls = text.replace(/https?:\/\/[^\s]+/g, "").trim();
  if (withoutUrls.length > 3) return withoutUrls;

  // Pure links — name the shop instead
  const shops = [...new Set(urls.map(u => {
    try {
      const host = new URL(u).hostname.replace(/^www\./, "");
      return SITE_NAMES[host] || host;
    } catch { return null; }
  }).filter(Boolean))];

  if (shops.length === 0) return fallback;
  if (urls.length === 1) return `${shops[0]} item`;
  return `${urls.length} items from ${shops.join(", ")}`;
}
