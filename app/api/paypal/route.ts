// @ts-nocheck
// app/api/paypal/route.ts
//
// PayPal runs entirely server-side. This matters: the amount to charge is
// read from the database, never from the browser. If it came from the
// client, anyone could edit the request and pay ¥1 for a ¥10,000 shipment.
//
// Environment variables required (Vercel → Settings → Environment Variables):
//   PAYPAL_CLIENT_ID
//   PAYPAL_SECRET
//   PAYPAL_ENV            "sandbox" or "live"
//   SUPABASE_SECRET_KEY   secret key (sb_secret_…) — server only, never NEXT_PUBLIC_

import { createClient } from "@supabase/supabase-js";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// service_role bypasses RLS. Safe here because this code only ever runs on
// the server and we scope every query by the authenticated user's id.
//
// Created lazily so the app still builds when the key is absent — the route
// simply returns a clear error at runtime instead of breaking the build.
let _admin = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // New key format is SUPABASE_SECRET_KEY; the old name is kept as fallback
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

  if (!res.ok) throw new Error("PayPal auth failed");
  const data = await res.json();
  return data.access_token;
}

/** Verify the caller owns the order before doing anything with it */
async function requireOwnedOrder(request, orderId) {
  const admin = getAdmin();
  if (!admin) return { error: "Payments not configured", status: 503 };
  const authHeader = request.headers.get("authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) return { error: "Not signed in", status: 401 };

  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) return { error: "Invalid session", status: 401 };

  const { data: order } = await admin
    .from("orders")
    .select("id, public_ref, customer_id, shipping_cost_jpy, shipping_paid")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found", status: 404 };
  if (order.customer_id !== user.id) return { error: "Not your order", status: 403 };

  return { user, order };
}

export async function POST(request) {
  try {
    const admin = getAdmin();
    if (!admin) {
      return Response.json(
        { error: "Payments are not configured yet." },
        { status: 503 }
      );
    }
    const body = await request.json();
    const { action, orderId, paypalOrderId } = body;

    // ── Create a PayPal order ──
    if (action === "create") {
      const check = await requireOwnedOrder(request, orderId);
      if (check.error) {
        return Response.json({ error: check.error }, { status: check.status });
      }
      const { order } = check;

      if (order.shipping_paid) {
        return Response.json({ error: "Already paid" }, { status: 400 });
      }

      // The amount comes from the database, not the request body
      const amount = order.shipping_cost_jpy;
      if (!amount || amount <= 0) {
        return Response.json({ error: "Nothing to pay" }, { status: 400 });
      }

      const token = await paypalToken();
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: order.public_ref,
              description: `Shipping — ${order.public_ref}`,
              amount: {
                currency_code: "JPY",
                // JPY has no decimal subunit, so the value is a whole number
                value: String(amount),
              },
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return Response.json({ error: "PayPal rejected the order" }, { status: 502 });
      }

      // Record the pending payment so the dashboard can show it
      await admin.from("payments").upsert(
        {
          order_id: order.id,
          amount_jpy: amount,
          kind: "shipping",
          status: "pending",
          paypal_order_id: data.id,
        },
        { onConflict: "paypal_order_id" }
      );

      return Response.json({ id: data.id });
    }

    // ── Capture after the customer approves ──
    if (action === "capture") {
      const check = await requireOwnedOrder(request, orderId);
      if (check.error) {
        return Response.json({ error: check.error }, { status: check.status });
      }
      const { order } = check;

      const token = await paypalToken();
      const res = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.status !== "COMPLETED") {
        await admin
          .from("payments")
          .update({ status: "failed" })
          .eq("paypal_order_id", paypalOrderId);
        return Response.json({ error: "Payment not completed" }, { status: 402 });
      }

      // Only trust PayPal's own confirmation, never the browser's word
      await admin
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("paypal_order_id", paypalOrderId);

      await admin
        .from("orders")
        .update({ shipping_paid: true, status: "Shipped" })
        .eq("id", order.id);

      // The status trigger writes the timeline entry and the notification

      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PayPal route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
