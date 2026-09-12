// @ts-nocheck
// app/api/payment-link/route.ts
//
// Custom one-off payment links: the admin sets an arbitrary JPY amount for
// a client who may not even have a Kizuna account, gets a shareable
// /pay/<token> URL, and the client pays there. No Kizuna login required —
// the token (the row's own uuid) is the only credential, so every action
// here is public by design. The amount always comes from the database,
// never from the request body, same discipline as app/api/paypal/route.ts.
//
// PayPal's own checkout already lets a payer without a PayPal account pay
// by debit/credit card as a guest — nothing extra is needed for that, it's
// just the default "Debit or Credit Card" option PayPal Buttons renders
// alongside the PayPal button, as long as it isn't explicitly disabled
// (it isn't, here or in PayButton.tsx).
//
// Environment variables required (same as app/api/paypal/route.ts):
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_ENV, SUPABASE_SECRET_KEY

import { createClient } from "@supabase/supabase-js";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let _admin = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// ISO 3166-1 alpha-2 → English name, for turning PayPal's shipping
// country_code into the readable string the admin's delivery_country
// field expects (it's plain text, not an enum).
const COUNTRY_NAMES = {
  US: "United States", CA: "Canada", MX: "Mexico", GB: "United Kingdom", IE: "Ireland",
  FR: "France", DE: "Germany", ES: "Spain", PT: "Portugal", IT: "Italy", NL: "Netherlands",
  BE: "Belgium", LU: "Luxembourg", CH: "Switzerland", AT: "Austria", SE: "Sweden",
  NO: "Norway", DK: "Denmark", FI: "Finland", IS: "Iceland", PL: "Poland", CZ: "Czechia",
  SK: "Slovakia", HU: "Hungary", RO: "Romania", BG: "Bulgaria", GR: "Greece", HR: "Croatia",
  SI: "Slovenia", EE: "Estonia", LV: "Latvia", LT: "Lithuania", MT: "Malta", CY: "Cyprus",
  UA: "Ukraine", TR: "Turkey", RU: "Russia", JP: "Japan", KR: "South Korea", CN: "China",
  HK: "Hong Kong", TW: "Taiwan", SG: "Singapore", MY: "Malaysia", TH: "Thailand",
  VN: "Vietnam", PH: "Philippines", ID: "Indonesia", IN: "India", PK: "Pakistan",
  BD: "Bangladesh", AU: "Australia", NZ: "New Zealand", ZA: "South Africa", EG: "Egypt",
  NG: "Nigeria", KE: "Kenya", MA: "Morocco", IL: "Israel", AE: "United Arab Emirates",
  SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait", BR: "Brazil", AR: "Argentina",
  CL: "Chile", CO: "Colombia", PE: "Peru", UY: "Uruguay", EC: "Ecuador", VE: "Venezuela",
  CR: "Costa Rica", PA: "Panama", DO: "Dominican Republic", JM: "Jamaica",
};
function countryNameFromCode(code) {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

// Formats PayPal's shipping object (from a capture response) into a single
// readable address string — the orders table has no separate
// street/city/postal columns, just one free-text field for the admin.
function formatShippingAddress(shipping) {
  if (!shipping?.address) return null;
  const a = shipping.address;
  const lines = [
    shipping.name?.full_name,
    [a.address_line_1, a.address_line_2].filter(Boolean).join(", "),
    [a.admin_area_2, a.admin_area_1, a.postal_code].filter(Boolean).join(", "),
    countryNameFromCode(a.country_code),
  ].filter(Boolean);
  return lines.length ? lines.join(" — ") : null;
}

async function paypalToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    console.error("PayPal auth failed:", res.status, await res.text());
    throw new Error("PayPal auth failed");
  }
  return (await res.json()).access_token;
}

export async function POST(request) {
  try {
    const admin = getAdmin();
    if (!admin) {
      return Response.json({ error: "Payments are not configured yet." }, { status: 503 });
    }
    const body = await request.json();
    const { action, token, paypalOrderId, phone, shippingAddress } = body;
    if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

    // ── Fetch label/amount/status for the public page to render ──
    if (action === "get") {
      const { data: link } = await admin
        .from("payment_links")
        .select("label, amount_jpy, item_amount_jpy, fee_amount_jpy, paypal_fee_jpy, status")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      return Response.json({
        label: link.label,
        amountJpy: link.amount_jpy,
        itemAmountJpy: link.item_amount_jpy,
        feeAmountJpy: link.fee_amount_jpy,
        paypalFeeAmountJpy: link.paypal_fee_jpy,
        status: link.status,
      });
    }

    // ── Create the PayPal order ──
    if (action === "create") {
      if (!phone || !String(phone).trim()) {
        return Response.json({ error: "Phone number is required" }, { status: 400 });
      }

      const { data: link } = await admin
        .from("payment_links")
        .select("id, label, amount_jpy, item_amount_jpy, fee_amount_jpy, paypal_fee_jpy, status")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      if (link.status !== "pending") {
        return Response.json({ error: "This link is no longer payable" }, { status: 400 });
      }

      // Save the payer's phone (required) and optional alternate shipping
      // address before starting checkout, so they're on file even if the
      // payer abandons PayPal's own approval step.
      await admin
        .from("payment_links")
        .update({
          client_phone: String(phone).trim(),
          ...(shippingAddress && String(shippingAddress).trim() ? { shipping_address: String(shippingAddress).trim() } : {}),
        })
        .eq("id", token);

      // Break the order into a "product" line and separate "Kizuna fee" /
      // "PayPal G&S fee" lines whenever set, so the payer's PayPal review
      // page and receipt show each charge explicitly instead of one opaque
      // total.
      const feeAmount = link.fee_amount_jpy || 0;
      const paypalFeeAmount = link.paypal_fee_jpy || 0;
      const hasBreakdown = link.item_amount_jpy > 0 && (feeAmount > 0 || paypalFeeAmount > 0);
      const purchaseUnit = {
        reference_id: `LINK-${link.id}`,
        description: (link.label || "Kizuna Proxy payment").slice(0, 127),
        amount: { currency_code: "JPY", value: String(link.amount_jpy) },
      };
      if (hasBreakdown) {
        purchaseUnit.amount.breakdown = {
          item_total: { currency_code: "JPY", value: String(link.item_amount_jpy + feeAmount + paypalFeeAmount) },
        };
        purchaseUnit.items = [
          { name: (link.label || "Item").slice(0, 127), quantity: "1", unit_amount: { currency_code: "JPY", value: String(link.item_amount_jpy) } },
          ...(feeAmount > 0 ? [{ name: "Kizuna Proxy — service fee", quantity: "1", unit_amount: { currency_code: "JPY", value: String(feeAmount) } }] : []),
          ...(paypalFeeAmount > 0 ? [{ name: "PayPal Goods & Services fee", quantity: "1", unit_amount: { currency_code: "JPY", value: String(paypalFeeAmount) } }] : []),
        ];
      }

      const ppToken = await paypalToken();
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ppToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [purchaseUnit],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("PayPal create order failed:", res.status, JSON.stringify(data));
        return Response.json({ error: "PayPal rejected the order" }, { status: 502 });
      }

      await admin.from("payment_links").update({ paypal_order_id: data.id }).eq("id", token);
      return Response.json({ id: data.id });
    }

    // ── Capture after the payer approves ──
    if (action === "capture") {
      const { data: link } = await admin
        .from("payment_links")
        .select("id, status, label, client_name, client_email, client_phone, shipping_address, item_amount_jpy, fee_amount_jpy, paypal_fee_jpy")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      if (link.status === "paid") return Response.json({ ok: true }); // already done, idempotent

      const ppToken = await paypalToken();
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ppToken}`, "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.status !== "COMPLETED") {
        console.error("PayPal capture not completed:", res.status, JSON.stringify(data));
        return Response.json({ error: "Payment not completed" }, { status: 402 });
      }

      // The payer's real PayPal email/name — this is the one place we can
      // actually get it, since guest card checkouts don't always surface
      // the payer's email in the PayPal merchant dashboard.
      const payerEmail = data.payer?.email_address || null;
      const payerName = [data.payer?.name?.given_name, data.payer?.name?.surname].filter(Boolean).join(" ") || null;

      // PayPal collects a shipping address as part of its own checkout by
      // default (we never set shipping_preference to skip it) — read it
      // back here instead of asking the payer to type it in a second time.
      const shipping = data.purchase_units?.[0]?.shipping;
      const deliveryCountry = countryNameFromCode(shipping?.address?.country_code);
      const paypalShippingAddress = formatShippingAddress(shipping);

      await admin
        .from("payment_links")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          ...(payerEmail && { client_email: payerEmail }),
          ...(payerName && { client_name: payerName }),
        })
        .eq("id", token);

      // Turn the paid link into a regular order, same pipeline as everything
      // else in the admin — only ever runs here, on the transition into
      // "paid", so links that were already paid before this existed are
      // never retroactively converted.
      //
      // The customer's own "ship to a different address" override (if they
      // used it) wins over PayPal's captured address for where the parcel
      // actually goes, but the destination country still comes from PayPal
      // since that's the one address we know is verified.
      await admin.from("orders").insert({
        client_name: payerName || link.client_name || null,
        client_email: payerEmail || link.client_email || null,
        client_phone: link.client_phone || null,
        delivery_country: deliveryCountry,
        shipping_address: link.shipping_address || paypalShippingAddress,
        items: link.label,
        status: "Pending",
        purchase_date: new Date().toISOString().split("T")[0],
        platform: "Payment link",
        item_price_jpy: link.item_amount_jpy || 0,
        service_fee_jpy: link.fee_amount_jpy || 0,
        admin_notes: `From payment link: item ¥${link.item_amount_jpy || 0}, Kizuna fee ¥${link.fee_amount_jpy || 0}, PayPal fee ¥${link.paypal_fee_jpy || 0}.`,
      });

      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("payment-link route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
