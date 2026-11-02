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
import { resolveOpenOrder } from "../../lib/paymentOrderTarget";
import { checkCoupon, normalizeCode, normalizeEmail, priceWithCoupon } from "../../lib/coupons";

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

// Ce que la page de paiement a le droit de voir d'un lien (jamais l'email, le téléphone ni le nom complet).
function publicLink(link) {
  // Prénom seulement (pour « Demande de paiement pour Anna ») : jamais le nom complet ni l'email.
  const clientFirstName = String(link.client_name || "").trim().split(/\s+/)[0].slice(0, 40) || null;
  return {
    clientFirstName,
    label: link.label,
    amountJpy: link.amount_jpy,
    itemAmountJpy: link.item_amount_jpy,
    feeAmountJpy: link.fee_amount_jpy,
    paypalFeeAmountJpy: link.paypal_fee_jpy,
    taxAmountJpy: link.tax_amount_jpy || 0,
    itemsBreakdown: link.items_breakdown || null,
    isShipping: !!link.is_shipping,
    status: link.status,
    couponCode: link.coupon_code || null,
    couponDiscountJpy: link.coupon_discount_jpy || 0,
    // Le coupon ne s'applique qu'aux frais de service d'un lien « articles » non payé.
    couponAllowed: !link.is_shipping && link.status === "pending" && (link.fee_before_coupon_jpy ?? link.fee_amount_jpy ?? 0) > 0,
    knowsEmail: !!link.client_email,
  };
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
        // "*" on purpose: tax_amount_jpy is an optional column (see supabase/migrations/20261101120000).
        .select("*")
        .eq("id", token)
        .single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      return Response.json(publicLink(link));
    }

    // ── Coupon : le client applique (ou retire) un code sur son lien, avant de payer ──
    // Le serveur recalcule les frais de service, les frais PayPal et le total ; rien ne vient du navigateur sauf le code.
    // Un coupon = une seule utilisation par client (son email) : voir lib/coupons.ts et le SQL 20261102120000_coupons.sql.
    if (action === "coupon-apply" || action === "coupon-remove") {
      const { data: link } = await admin.from("payment_links").select("*").eq("id", token).single();
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      if (link.status !== "pending") return Response.json({ error: "This link is no longer payable", reason: "not_eligible" }, { status: 400 });

      // Libère la réservation en cours de CE lien (changement de coupon, ou retrait).
      const releaseOwn = () => admin.from("coupon_redemptions").update({ status: "released" }).eq("payment_link_id", token).eq("status", "reserved");
      const original = link.fee_before_coupon_jpy ?? link.fee_amount_jpy ?? 0;
      const item = link.item_amount_jpy || 0;
      const tax = link.tax_amount_jpy || 0;

      const restore = async () => {
        const priced = priceWithCoupon({ itemAmount: item, fee: original, tax, couponAmount: 0 });
        const { error } = await admin
          .from("payment_links")
          .update({ fee_amount_jpy: priced.fee, paypal_fee_jpy: priced.paypal, amount_jpy: priced.total, coupon_code: null, coupon_discount_jpy: 0, fee_before_coupon_jpy: null })
          .eq("id", token);
        return error;
      };

      if (action === "coupon-remove") {
        if (!link.coupon_code) return Response.json(publicLink(link));
        await releaseOwn();
        const err = await restore();
        if (err) return Response.json({ error: "Could not remove the coupon", reason: "error" }, { status: 500 });
        const { data: fresh } = await admin.from("payment_links").select("*").eq("id", token).single();
        return Response.json(publicLink(fresh));
      }

      const code = normalizeCode(body.code);
      const email = normalizeEmail(body.email || link.client_email);
      if (!code) return Response.json({ error: "Enter a code", reason: "invalid" }, { status: 400 });

      const { data: coupon, error: couponErr } = await admin.from("coupons").select("*").eq("code", code).maybeSingle();
      if (couponErr) {
        // Table absente : le SQL des coupons n'est pas encore exécuté.
        console.error("coupon lookup failed:", couponErr.message);
        return Response.json({ error: "Coupons are not available yet", reason: "invalid" }, { status: 400 });
      }

      // Réservations oubliées depuis plus de 48 h : elles ne bloquent plus le client (lien jamais payé).
      if (coupon && email) {
        const stale = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
        await admin.from("coupon_redemptions").update({ status: "released" }).eq("coupon_id", coupon.id).eq("client_email", email).eq("status", "reserved").lt("created_at", stale);
      }

      let usedByThisEmail = false;
      let totalUsed = 0;
      if (coupon) {
        const { count: total } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", coupon.id).neq("payment_link_id", token).in("status", ["reserved", "used"]);
        totalUsed = total || 0;
        if (email) {
          const { count: mine } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", coupon.id).eq("client_email", email).neq("payment_link_id", token).in("status", ["reserved", "used"]);
          usedByThisEmail = (mine || 0) > 0;
        }
      }

      const verdict = checkCoupon({ coupon, email, now: new Date(), usedByThisEmail, totalUsed, link: { isShipping: !!link.is_shipping, feeBeforeCoupon: original } });
      if (!verdict.ok) {
        return Response.json({ error: "Coupon refused", reason: verdict.reason }, { status: 400 });
      }

      const priced = priceWithCoupon({ itemAmount: item, fee: original, tax, couponAmount: coupon.amount_jpy });
      if (priced.discount <= 0) return Response.json({ error: "Coupon refused", reason: "not_eligible" }, { status: 400 });

      // Le nouveau coupon est valide : on libère celui que ce lien avait déjà (changement de code), puis on réserve.
      if (link.coupon_code) await releaseOwn();
      const { error: insErr } = await admin.from("coupon_redemptions").insert({ coupon_id: coupon.id, client_email: email, payment_link_id: token, discount_jpy: priced.discount, status: "reserved" });
      if (insErr) {
        // Index unique : un autre appel simultané a déjà réservé ce coupon pour ce client.
        return Response.json({ error: "Coupon refused", reason: "used" }, { status: 400 });
      }
      const { error: updErr } = await admin
        .from("payment_links")
        .update({ fee_before_coupon_jpy: original, coupon_code: coupon.code, coupon_discount_jpy: priced.discount, fee_amount_jpy: priced.fee, paypal_fee_jpy: priced.paypal, amount_jpy: priced.total })
        .eq("id", token);
      if (updErr) {
        await releaseOwn();
        console.error("coupon apply failed:", updErr.message);
        return Response.json({ error: "Coupons are not available yet", reason: "invalid" }, { status: 400 });
      }
      const { data: fresh } = await admin.from("payment_links").select("*").eq("id", token).single();
      return Response.json(publicLink(fresh));
    }

    // ── Create the PayPal order ──
    if (action === "create") {
      if (!phone || !String(phone).trim()) {
        return Response.json({ error: "Phone number is required" }, { status: 400 });
      }

      const { data: link } = await admin
        .from("payment_links")
        // "*" on purpose: tax_amount_jpy is an optional column (see supabase/migrations/20261101120000).
        .select("*")
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

      // Break the order into one line per item (when set — a reservation
      // fee paid before we've bought anything has none) plus separate
      // "Kizuna fee" / "Fee" lines, so the payer's PayPal review
      // page and receipt show each charge explicitly instead of one opaque
      // total.
      const feeAmount = link.fee_amount_jpy || 0;
      const paypalFeeAmount = link.paypal_fee_jpy || 0;
      const taxAmount = link.tax_amount_jpy || 0; // taxes / droits Zonos facturés avec la livraison
      const items = Array.isArray(link.items_breakdown) ? link.items_breakdown : [];
      const lineCount = items.length + (feeAmount > 0 ? 1 : 0) + (taxAmount > 0 ? 1 : 0) + (paypalFeeAmount > 0 ? 1 : 0);
      const hasBreakdown = lineCount > 1;
      const purchaseUnit = {
        reference_id: `LINK-${link.id}`,
        description: (link.label || "Kizuna Proxy payment").slice(0, 127),
        amount: { currency_code: "JPY", value: String(link.amount_jpy) },
      };
      if (hasBreakdown) {
        purchaseUnit.amount.breakdown = {
          item_total: { currency_code: "JPY", value: String(link.item_amount_jpy + feeAmount + taxAmount + paypalFeeAmount) },
        };
        purchaseUnit.items = [
          ...(items.length > 0
            ? items.map(it => ({ name: (it.name || "Item").slice(0, 127), quantity: "1", unit_amount: { currency_code: "JPY", value: String(it.price_jpy) } }))
            : (link.item_amount_jpy > 0 ? [{ name: (link.label || "Item").slice(0, 127), quantity: "1", unit_amount: { currency_code: "JPY", value: String(link.item_amount_jpy) } }] : [])),
          ...(feeAmount > 0 ? [{ name: link.is_shipping ? "Shipping" : "Kizuna Proxy — service fee", quantity: "1", unit_amount: { currency_code: "JPY", value: String(feeAmount) } }] : []),
          ...(taxAmount > 0 ? [{ name: "Taxes (Zonos)", quantity: "1", unit_amount: { currency_code: "JPY", value: String(taxAmount) } }] : []),
          ...(paypalFeeAmount > 0 ? [{ name: "Fee", quantity: "1", unit_amount: { currency_code: "JPY", value: String(paypalFeeAmount) } }] : []),
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
        // "*" on purpose: target_order_id / new_order are optional columns, and an explicit
        // column list would make every payment fail if they don't exist yet.
        .select("*")
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

      // The actual fee PayPal kept for this transaction, straight from its
      // own capture response — separate from paypal_fee_jpy, which is the
      // flat 6% we charge the client. The gap between the two is tracked so
      // the admin can see the real margin without changing what's billed.
      const captureInfo = data.purchase_units?.[0]?.payments?.captures?.[0];
      const capturedValue = captureInfo?.amount?.value != null ? Math.round(Number(captureInfo.amount.value)) : null;
      const amountMismatch = capturedValue != null && capturedValue !== Math.round(Number(link.amount_jpy));
      const realFeeValue = captureInfo?.seller_receivable_breakdown?.paypal_fee?.value;
      const realPaypalFeeJpy = realFeeValue != null ? Math.round(Number(realFeeValue)) : null;

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
          ...(realPaypalFeeJpy != null && { paypal_real_fee_jpy: realPaypalFeeJpy }),
          ...(payerEmail && { client_email: payerEmail }),
          ...(payerName && { client_name: payerName }),
        })
        .eq("id", token);

      // Coupon appliqué sur ce lien : la réservation devient une utilisation (ignoré si la table n'existe pas encore).
      if (link.coupon_code) {
        await admin.from("coupon_redemptions").update({ status: "used", used_at: new Date().toISOString(), payer_email: payerEmail }).eq("payment_link_id", token).eq("status", "reserved");
      }

      // Turn the paid link into a regular order, same pipeline as everything
      // else in the admin — only ever runs here, on the transition into
      // "paid", so links that were already paid before this existed are
      // never retroactively converted.
      //
      // The customer's own "ship to a different address" override (if they
      // used it) wins over PayPal's captured address for where the parcel
      // actually goes, but the destination country still comes from PayPal
      // since that's the one address we know is verified.
      const shippingAddressForOrder = link.shipping_address || paypalShippingAddress;
      const email = payerEmail || link.client_email || null;
      const isShippingPayment = !!link.is_shipping;
      const couponNote = link.coupon_code ? ` (coupon ${link.coupon_code} −¥${link.coupon_discount_jpy || 0})` : "";
      const mismatchNote = amountMismatch ? ` ⚠ PayPal captured ¥${capturedValue}, link total was ¥${link.amount_jpy}: check this payment.` : "";
      const feeNote = (isShippingPayment
        ? `shipping ¥${link.fee_amount_jpy || 0}, PayPal fee ¥${link.paypal_fee_jpy || 0}`
        : `item ¥${link.item_amount_jpy || 0}, Kizuna fee ¥${link.fee_amount_jpy || 0}${couponNote}, PayPal fee ¥${link.paypal_fee_jpy || 0}`) + mismatchNote;

      // A customer who already has an order still in progress gets this
      // purchase folded into it instead of starting a second one — but only
      // while that order hasn't shipped yet. Once it's Shipped, Delivered,
      // or Cancelled, that shipment is done and a new payment starts a
      // fresh order instead of reopening a closed one. Item payments from a
      // different month than the open order also start a fresh order.
      //
      // The admin can override all of that when creating the link: pick a specific
      // order (link.target_order_id — even from another month or already shipped)
      // or force a brand-new one (link.new_order). See lib/paymentOrderTarget.ts.
      const ORDER_COLUMNS = "id, items, item_price_jpy, service_fee_jpy, shipping_cost_jpy, admin_notes, status, client_name, client_phone, delivery_country, shipping_address, purchase_date, created_at";
      let existingOrders = [];
      if (email && !link.new_order) {
        const { data } = await admin
          .from("orders")
          .select(ORDER_COLUMNS)
          .ilike("client_email", email)
          .order("created_at", { ascending: false });
        existingOrders = data || [];
      }
      let targetOrder = null;
      if (link.target_order_id != null && !link.new_order) {
        const { data } = await admin.from("orders").select(ORDER_COLUMNS).eq("id", link.target_order_id).maybeSingle();
        targetOrder = data || null;
      }
      // An item payment only folds into an order from the same calendar
      // month, so revenue lands in the month it was actually paid. A
      // shipping payment isn't revenue, so it always joins the open order.
      const openOrder = resolveOpenOrder({
        link,
        existingOrders,
        targetOrder,
        isShippingPayment,
        thisMonth: new Date().toISOString().slice(0, 7),
      });

      // A shipping payment never touches item/service-fee totals — it's
      // its own tracked field on the order (same one OrderManager's
      // "Request payment" button uses), so it never gets double-counted as
      // revenue from the item itself.
      if (openOrder) {
        await admin.from("orders").update({
          items: isShippingPayment ? openOrder.items : [openOrder.items, link.label].filter(Boolean).join("\n"),
          ...(isShippingPayment
            ? { shipping_cost_jpy: (openOrder.shipping_cost_jpy || 0) + (link.fee_amount_jpy || 0), shipping_paid: true }
            : {
                item_price_jpy: (openOrder.item_price_jpy || 0) + (link.item_amount_jpy || 0),
                service_fee_jpy: (openOrder.service_fee_jpy || 0) + (link.fee_amount_jpy || 0),
              }),
          client_name: openOrder.client_name || payerName || link.client_name || null,
          client_phone: openOrder.client_phone || link.client_phone || null,
          delivery_country: openOrder.delivery_country || deliveryCountry,
          shipping_address: openOrder.shipping_address || shippingAddressForOrder,
          admin_notes: [openOrder.admin_notes, `+ payment link (${new Date().toISOString().split("T")[0]}): ${feeNote}.`].filter(Boolean).join(" "),
        }).eq("id", openOrder.id);
      } else {
        await admin.from("orders").insert({
          client_name: payerName || link.client_name || null,
          client_email: email,
          client_phone: link.client_phone || null,
          delivery_country: deliveryCountry,
          shipping_address: shippingAddressForOrder,
          items: isShippingPayment ? "Shipping payment" : link.label,
          status: "Pending",
          purchase_date: new Date().toISOString().split("T")[0],
          platform: "Payment link",
          item_price_jpy: isShippingPayment ? 0 : (link.item_amount_jpy || 0),
          service_fee_jpy: isShippingPayment ? 0 : (link.fee_amount_jpy || 0),
          ...(isShippingPayment ? { shipping_cost_jpy: link.fee_amount_jpy || 0, shipping_paid: true } : {}),
          admin_notes: `From payment link: ${feeNote}.`,
        });
      }

      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("payment-link route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
