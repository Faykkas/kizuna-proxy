// @ts-nocheck
"use client";
// app/account/AccountClient.tsx
//
// The customer dashboard. Designed to answer, above the fold and without
// reading: is anything waiting on me, and where are my orders?

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import Maneki from "../components/pixel/Maneki";
import { IconBox, IconTruck, IconCheck, IconHourglass } from "../components/pixel/PixelIcons";
import { useLanguage } from "../lib/language";
import { useAuth } from "../lib/auth";
import { useMyOrders, useMyShipments, useAccountSummary, useNotifications, useMyRequests } from "../lib/useOrders";
import {
  statusMeta, statusColor, progressPercent, nextStep,
  needsCustomerAction, formatJPY, normaliseStatus, orderTitle,
} from "../lib/orderStatus";

function shipmentMeta(status, t) {
  const m = t.account || {};
  const table = {
    "Awaiting Shipping Payment": { label: m.shipDue || "Shipping payment due", hint: m.shipDueHint || "Pay below and we'll send your package out.", color: "var(--px-red)" },
    "Shipped": { label: m.shipped || "Shipped", hint: m.shippedHint || "On its way to you. Track it below.", color: "var(--px-accent2)" },
    "Delivered": { label: m.delivered || "Delivered", hint: m.deliveredHint || "Enjoy! Thanks for trusting us.", color: "var(--px-accent)" },
  };
  return table[status] || table["Awaiting Shipping Payment"];
}

/** Groups orders that share a shipment into one card; everything else stays standalone */
function groupForDisplay(orders, shipments) {
  const byShipment = new Map();
  const standalone = [];

  orders.forEach(o => {
    if (o.shipment_id) {
      if (!byShipment.has(o.shipment_id)) byShipment.set(o.shipment_id, []);
      byShipment.get(o.shipment_id).push(o);
    } else {
      standalone.push(o);
    }
  });

  const shipmentCards = [...byShipment.entries()]
    .map(([shipId, ords]) => {
      const shipment = shipments.find(s => s.id === shipId);
      return shipment ? { type: "shipment", key: `s${shipId}`, shipment, orders: ords } : null;
    })
    .filter(Boolean);

  const orderCards = standalone.map(o => ({ type: "order", key: `o${o.id}`, order: o }));

  return [...shipmentCards, ...orderCards];
}

function ShipmentCard({ shipment, orders }) {
  const { t } = useLanguage();
  const meta = shipmentMeta(shipment.status, t);
  const action = shipment.status === "Awaiting Shipping Payment" && !shipment.shipping_paid && shipment.shipping_cost_jpy > 0;
  const itemsLabel = orders.map(o => orderTitle(o.items)).join(" · ");
  const a = t.account || {};

  return (
    <a href={`/account/shipments/${shipment.id}`} className={`acc-order-card${action ? " is-action" : ""}`}>
      <div className="acc-order-top">
        <span className="acc-order-ref" style={{ display: "inline-flex", alignItems: "center", gap: ".35rem" }}>
          <IconBox size={14} /> {a.packageLabel || "PACKAGE"} · {orders.length} {a.ordersCount || "ORDERS"}
        </span>
        <span className="acc-order-status" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="acc-order-items">{itemsLabel}</div>

      <div className="acc-order-bottom">
        <span className="acc-order-next">{meta.hint}</span>
        <span className="acc-order-arrow">→</span>
      </div>

      {action && (
        <div className="acc-order-flag">
          {formatJPY(shipment.shipping_cost_jpy)} {a.shippingDue || "shipping due"}
        </div>
      )}
    </a>
  );
}

function StatusIcon({ name, size = 22 }) {
  const map = { box: IconBox, truck: IconTruck, check: IconCheck, hourglass: IconHourglass };
  const Ico = map[name] || IconHourglass;
  return <Ico size={size} />;
}

function OrderCard({ order }) {
  const { t } = useLanguage();
  const a = t.account || {};
  const meta = statusMeta(order.status, t);
  const pct = progressPercent(order.status, order);
  const next = nextStep(order.status, order, t);
  const action = needsCustomerAction(order.status);

  return (
    <a href={`/account/orders/${order.id}`} className={`acc-order-card${action ? " is-action" : ""}`}>
      <div className="acc-order-top">
        <span className="acc-order-ref">{order.public_ref}</span>
        <span className="acc-order-status" style={{ color: statusColor(order.status) }}>
          {meta.label}
        </span>
      </div>

      <div className="acc-order-items">{orderTitle(order.items)}</div>

      <div className="acc-order-bar">
        <div className="acc-order-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="acc-order-bottom">
        {next ? (
          <span className="acc-order-next">
            <span className="acc-order-next-label">{a.nextLabel || "NEXT"}</span> {next}
          </span>
        ) : (
          <span className="acc-order-next">{meta.hint}</span>
        )}
        <span className="acc-order-arrow">→</span>
      </div>

      {normaliseStatus(order.status) === "Awaiting Event" && order.event_date && (
        <div className="acc-order-event">
          {order.event_name || "Event"} — {new Date(order.event_date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
        </div>
      )}

      {action && (
        <div className="acc-order-flag">
          {order.status === "Awaiting Shipping Payment"
            ? `${formatJPY(order.shipping_cost_jpy)} ${a.shippingDue || "shipping due"}`
            : (a.needsAttention || "Needs your attention")}
        </div>
      )}
    </a>
  );
}

export default function AccountClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { orders, loading } = useMyOrders();
  const { shipments } = useMyShipments();
  const summary = useAccountSummary(orders, shipments);
  const { items: notifs, unread, markAllRead } = useNotifications();
  const { requests } = useMyRequests();

  // Not signed in → login. Admins → the admin panel, since the customer
  // dashboard would show them every order in the database, which is not
  // what they need.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/account/login"); return; }
    if (user.user_metadata?.role === "admin") router.replace("/admin");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap">
          <p className="acc-loading">{t.orderDetail?.loading || "Loading…"}</p>
        </main>
      </>
    );
  }

  const firstName = (profile?.full_name || "").split(" ")[0];
  const cards = groupForDisplay(orders, shipments);
  const active = cards.filter(c =>
    c.type === "shipment"
      ? c.shipment.status !== "Delivered"
      : !["Delivered", "Cancelled"].includes(normaliseStatus(c.order.status))
  );
  const past = cards.filter(c =>
    c.type === "shipment"
      ? c.shipment.status === "Delivered"
      : ["Delivered", "Cancelled"].includes(normaliseStatus(c.order.status))
  );
  const attentionCount = summary.needsAction.length + summary.shipmentsNeedingPayment.length;
  const a = t.account || {};

  return (
    <>
      <SiteNav />
      <main className="acc-wrap">

        {/* ── Greeting + mascot ── */}
        <header className="acc-head">
          <div className="acc-head-mascot">
            <Maneki
              prop={attentionCount ? "coins" : "parcel"}
              state={attentionCount ? "idle" : "success"}
              size={80}
              float
            />
          </div>
          <div>
            <h1 className="acc-head-title">
              {firstName ? `${a.hi || "HI"} ${firstName.toUpperCase()}` : (a.greeting || "YOUR ORDERS")}
            </h1>
            <p className="acc-head-lead">
              {attentionCount > 0
                ? (attentionCount > 1 ? (a.attentionMany || "{n} orders need your attention.") : (a.attentionOne || "1 order needs your attention.")).replace("{n}", attentionCount)
                : summary.activeCount > 0
                  ? (summary.activeCount > 1 ? (a.activeMany || "{n} orders in progress. Everything on track.") : (a.activeOne || "1 order in progress. Everything on track.")).replace("{n}", summary.activeCount)
                  : (a.noActive || "No active orders right now.")}
            </p>
          </div>
          <button className="acc-signout" onClick={() => { signOut(); router.push("/"); }}>
            {a.signOut || "SIGN OUT"}
          </button>
        </header>

        {/* ── Summary strip ── */}
        <section className="acc-stats">
          <div className="acc-stat">
            <span className="acc-stat-num">{summary.activeCount}</span>
            <span className="acc-stat-label">{a.active || "ACTIVE"}</span>
          </div>
          <div className="acc-stat">
            <span className="acc-stat-num">{summary.totalCount}</span>
            <span className="acc-stat-label">{a.total || "TOTAL"}</span>
          </div>
          <div className={`acc-stat${summary.outstanding > 0 ? " is-due" : ""}`}>
            <span className="acc-stat-num">{formatJPY(summary.outstanding)}</span>
            <span className="acc-stat-label">{a.due || "DUE"}</span>
          </div>
        </section>

        {/* ── Notifications ── */}
        {notifs.length > 0 && (
          <section className="acc-section">
            <div className="acc-section-head">
              <h2 className="acc-section-title">{a.updates || "UPDATES"}</h2>
              {unread > 0 && (
                <button className="acc-mark-read" onClick={markAllRead}>
                  {a.markAllRead || "MARK ALL READ"}
                </button>
              )}
            </div>
            <div className="acc-notif-list">
              {notifs.slice(0, 4).map(n => (
                <div key={n.id} className={`acc-notif${n.read ? "" : " is-unread"}`}>
                  <span className="acc-notif-dot" />
                  <div>
                    <div className="acc-notif-title">{n.title}</div>
                    {n.body && <div className="acc-notif-body">{n.body}</div>}
                  </div>
                  <span className="acc-notif-date">
                    {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Pending requests ──
             A request that has not become an order yet still needs to be
             visible, otherwise the customer thinks it was lost. */}
        {requests.filter(r => r.status !== "converted" && r.status !== "declined").length > 0 && (
          <section className="acc-section">
            <h2 className="acc-section-title">{a.awaitingReply || "AWAITING OUR REPLY"}</h2>
            <div className="acc-req-list">
              {requests
                .filter(r => r.status !== "converted" && r.status !== "declined")
                .map(r => (
                  <div key={r.id} className="acc-req">
                    <div className="acc-req-top">
                      <span className="acc-req-date">
                        {new Date(r.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </span>
                      <span className="acc-req-status">
                        {r.status === "new" ? (a.waiting || "WAITING") : (a.reviewing || "REVIEWING")}
                      </span>
                    </div>
                    <p className="acc-req-items">{r.items}</p>
                    <p className="acc-req-hint">
                      {a.replyHint || "We reply within 24 hours with a quote."}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── Active orders ── */}
        <section className="acc-section">
          <h2 className="acc-section-title">{a.inProgress || "IN PROGRESS"}</h2>
          {loading ? (
            <p className="acc-loading">{a.loadingOrders || "Loading your orders…"}</p>
          ) : active.length === 0 ? (
            <div className="acc-empty">
              <Maneki prop="glass" size={72} />
              <p>
                {requests.some(r => r.status === "new" || r.status === "read")
                  ? (a.nothingConfirmed || "Nothing confirmed yet — see your request above.")
                  : (a.noOrders || "No orders in progress.")}
              </p>
              <a href="/request" className="btn btn-gold">{a.requestItem || "REQUEST AN ITEM"}</a>
            </div>
          ) : (
            <div className="acc-order-grid">
              {active.map(c => c.type === "shipment"
                ? <ShipmentCard key={c.key} shipment={c.shipment} orders={c.orders} />
                : <OrderCard key={c.key} order={c.order} />
              )}
            </div>
          )}
        </section>

        {/* ── History ── */}
        {past.length > 0 && (
          <section className="acc-section">
            <h2 className="acc-section-title">{a.history || "HISTORY"}</h2>
            <div className="acc-order-grid">
              {past.map(c => c.type === "shipment"
                ? <ShipmentCard key={c.key} shipment={c.shipment} orders={c.orders} />
                : <OrderCard key={c.key} order={c.order} />
              )}
            </div>
          </section>
        )}

      </main>
      <SiteFooter t={t} />
    </>
  );
}
