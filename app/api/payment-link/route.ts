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
    const { action, token, paypalOrderId } = body;
    if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

    // ── Fetch label/amount/status for the public page to render ──
    if (action === "get") {
      const { data: link } = await admin
        .from("payment_links")
        .select("label, amount_jpy, item_amount_jpy, fee_amount_jpy, status")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      return Response.json({
        label: link.label,
        amountJpy: link.amount_jpy,
        itemAmountJpy: link.item_amount_jpy,
        feeAmountJpy: link.fee_amount_jpy,
        status: link.status,
      });
    }

    // ── Create the PayPal order ──
    if (action === "create") {
      const { data: link } = await admin
        .from("payment_links")
        .select("id, label, amount_jpy, item_amount_jpy, fee_amount_jpy, status")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      if (link.status !== "pending") {
        return Response.json({ error: "This link is no longer payable" }, { status: 400 });
      }

      // Break the order into a "product" line and a separate "Kizuna fee"
      // line whenever both are set, so the payer's PayPal review page and
      // receipt show the fee explicitly instead of one opaque total.
      const hasBreakdown = link.item_amount_jpy > 0 && link.fee_amount_jpy > 0;
      const purchaseUnit = {
        reference_id: `LINK-${link.id}`,
        description: (link.label || "Kizuna Proxy payment").slice(0, 127),
        amount: { currency_code: "JPY", value: String(link.amount_jpy) },
      };
      if (hasBreakdown) {
        purchaseUnit.amount.breakdown = {
          item_total: { currency_code: "JPY", value: String(link.item_amount_jpy + link.fee_amount_jpy) },
        };
        purchaseUnit.items = [
          { name: (link.label || "Item").slice(0, 127), quantity: "1", unit_amount: { currency_code: "JPY", value: String(link.item_amount_jpy) } },
          { name: "Kizuna Proxy — service fee", quantity: "1", unit_amount: { currency_code: "JPY", value: String(link.fee_amount_jpy) } },
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
        .select("id, status")
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

      await admin
        .from("payment_links")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          ...(payerEmail && { client_email: payerEmail }),
          ...(payerName && { client_name: payerName }),
        })
        .eq("id", token);

      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("payment-link route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
