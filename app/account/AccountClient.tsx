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
import { copy as t } from "../translations";
import { useAuth } from "../lib/auth";
import { useMyOrders, useAccountSummary, useNotifications } from "../lib/useOrders";
import {
  statusMeta, statusColor, progressPercent, nextStep,
  needsCustomerAction, formatJPY, normaliseStatus,
} from "../lib/orderStatus";

function StatusIcon({ name, size = 22 }) {
  const map = { box: IconBox, truck: IconTruck, check: IconCheck, hourglass: IconHourglass };
  const Ico = map[name] || IconHourglass;
  return <Ico size={size} />;
}

function OrderCard({ order }) {
  const meta = statusMeta(order.status);
  const pct = progressPercent(order.status);
  const next = nextStep(order.status);
  const action = needsCustomerAction(order.status);

  return (
    <a href={`/account/orders/${order.id}`} className={`acc-order-card${action ? " is-action" : ""}`}>
      <div className="acc-order-top">
        <span className="acc-order-ref">{order.public_ref}</span>
        <span className="acc-order-status" style={{ color: statusColor(order.status) }}>
          {meta.label}
        </span>
      </div>

      <div className="acc-order-items">{order.items || "Your order"}</div>

      <div className="acc-order-bar">
        <div className="acc-order-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="acc-order-bottom">
        {next ? (
          <span className="acc-order-next">
            <span className="acc-order-next-label">NEXT</span> {next}
          </span>
        ) : (
          <span className="acc-order-next">{meta.hint}</span>
        )}
        <span className="acc-order-arrow">→</span>
      </div>

      {action && (
        <div className="acc-order-flag">
          {order.status === "Awaiting Shipping Payment"
            ? `${formatJPY(order.shipping_cost_jpy)} shipping due`
            : "Needs your attention"}
        </div>
      )}
    </a>
  );
}

export default function AccountClient() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { orders, loading } = useMyOrders();
  const summary = useAccountSummary(orders);
  const { items: notifs, unread, markAllRead } = useNotifications();

  // Not signed in → send to login
  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap">
          <p className="acc-loading">Loading…</p>
        </main>
      </>
    );
  }

  const firstName = (profile?.full_name || "").split(" ")[0];
  const active = orders.filter(o => !["Delivered", "Cancelled"].includes(normaliseStatus(o.status)));
  const past = orders.filter(o => ["Delivered", "Cancelled"].includes(normaliseStatus(o.status)));

  return (
    <>
      <SiteNav />
      <main className="acc-wrap">

        {/* ── Greeting + mascot ── */}
        <header className="acc-head">
          <div className="acc-head-mascot">
            <Maneki
              prop={summary.needsAction.length ? "coins" : "parcel"}
              state={summary.needsAction.length ? "idle" : "success"}
              size={80}
              float
            />
          </div>
          <div>
            <h1 className="acc-head-title">
              {firstName ? `HI ${firstName.toUpperCase()}` : "YOUR ORDERS"}
            </h1>
            <p className="acc-head-lead">
              {summary.needsAction.length > 0
                ? `${summary.needsAction.length} order${summary.needsAction.length > 1 ? "s need" : " needs"} your attention.`
                : summary.activeCount > 0
                  ? `${summary.activeCount} order${summary.activeCount > 1 ? "s" : ""} in progress. Everything on track.`
                  : "No active orders right now."}
            </p>
          </div>
          <button className="acc-signout" onClick={() => { signOut(); router.push("/"); }}>
            SIGN OUT
          </button>
        </header>

        {/* ── Summary strip ── */}
        <section className="acc-stats">
          <div className="acc-stat">
            <span className="acc-stat-num">{summary.activeCount}</span>
            <span className="acc-stat-label">ACTIVE</span>
          </div>
          <div className="acc-stat">
            <span className="acc-stat-num">{summary.totalCount}</span>
            <span className="acc-stat-label">TOTAL</span>
          </div>
          <div className={`acc-stat${summary.outstanding > 0 ? " is-due" : ""}`}>
            <span className="acc-stat-num">{formatJPY(summary.outstanding)}</span>
            <span className="acc-stat-label">DUE</span>
          </div>
        </section>

        {/* ── Notifications ── */}
        {notifs.length > 0 && (
          <section className="acc-section">
            <div className="acc-section-head">
              <h2 className="acc-section-title">UPDATES</h2>
              {unread > 0 && (
                <button className="acc-mark-read" onClick={markAllRead}>
                  MARK ALL READ
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

        {/* ── Active orders ── */}
        <section className="acc-section">
          <h2 className="acc-section-title">IN PROGRESS</h2>
          {loading ? (
            <p className="acc-loading">Loading your orders…</p>
          ) : active.length === 0 ? (
            <div className="acc-empty">
              <Maneki prop="glass" size={72} />
              <p>No orders in progress.</p>
              <a href="/request" className="btn btn-gold">REQUEST AN ITEM</a>
            </div>
          ) : (
            <div className="acc-order-grid">
              {active.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </section>

        {/* ── History ── */}
        {past.length > 0 && (
          <section className="acc-section">
            <h2 className="acc-section-title">HISTORY</h2>
            <div className="acc-order-grid">
              {past.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          </section>
        )}

      </main>
      <SiteFooter t={t} />
    </>
  );
}
