// @ts-nocheck
"use client";
// app/account/shipments/[id]/ShipmentDetailClient.tsx
//
// A package bundles several orders into one shipment: one tracking number,
// one shipping payment. This page is the "what's in this box, where is it,
// do I owe anything" view — the individual order pages link here instead of
// showing their own (now superseded) shipping section.

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../../../components/SiteNav";
import SiteFooter from "../../../components/SiteFooter";
import Maneki from "../../../components/pixel/Maneki";
import { IconBox, IconTruck, IconCheck } from "../../../components/pixel/PixelIcons";
import { copy as t } from "../../../translations";
import { useAuth } from "../../../lib/auth";
import { useShipmentDetail } from "../../../lib/useOrders";
import PayButton from "../../../components/account/PayButton";
import { formatJPY, orderTitle, trackingUrl } from "../../../lib/orderStatus";

const STEPS = [
  { key: "Awaiting Shipping Payment", label: "Shipping payment due", icon: IconBox },
  { key: "Shipped", label: "Shipped", icon: IconTruck },
  { key: "Delivered", label: "Delivered", icon: IconCheck },
];

function stepIndex(status) {
  return STEPS.findIndex(s => s.key === status);
}

export default function ShipmentDetailClient({ shipmentId }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { shipment, orders, payment, loading, reload } = useShipmentDetail(shipmentId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/login");
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap"><p className="acc-loading">Loading…</p></main>
      </>
    );
  }

  if (!shipment) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap">
          <div className="acc-empty">
            <Maneki prop="glass" size={80} />
            <p>Package not found.</p>
            <a href="/account" className="btn btn-outline">BACK TO ORDERS</a>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  const current = stepIndex(shipment.status);
  const itemsTotal = orders.reduce((s, o) => s + (o.item_price_jpy || 0) + (o.service_fee_jpy || 0), 0);
  const track = shipment.tracking_number ? trackingUrl(shipment.tracking_number, shipment.shipping_method) : null;
  const needsPayment = shipment.status === "Awaiting Shipping Payment" && !shipment.shipping_paid && shipment.shipping_cost_jpy > 0;

  return (
    <>
      <SiteNav />
      <main className="acc-wrap">

        <nav className="breadcrumb ord-crumb">
          <a href="/account">My orders</a><span>/</span><span>Package #{shipment.id}</span>
        </nav>

        {/* ── Header ── */}
        <header className="ord-head">
          <div>
            <span className="ord-ref">PACKAGE #{shipment.id}</span>
            <h1 className="ord-title">{orders.length} order{orders.length !== 1 ? "s" : ""} bundled together</h1>
          </div>
          <span className="ord-badge">{shipment.status}</span>
        </header>

        {/* ── Progress ── */}
        <div className="ord-progress">
          <div className="ord-progress-fill" style={{ width: `${Math.round((Math.max(current, 0) / (STEPS.length - 1)) * 100)}%` }} />
        </div>

        {/* ── Payment ── */}
        {needsPayment && (
          <section className="ord-pay">
            <div>
              <span className="ord-pay-label">
                SHIPPING — {shipment.shipping_method || "international"}
              </span>
              <span className="ord-pay-amount">{formatJPY(shipment.shipping_cost_jpy)}</span>
            </div>
            <PayButton
              shipmentId={shipment.id}
              amountJpy={shipment.shipping_cost_jpy}
              paymentId={payment?.id}
              onPaid={reload}
            />
          </section>
        )}

        <div className="ord-grid">

          {/* ── Steps ── */}
          <section className="ord-panel">
            <h2 className="ord-panel-title">PROGRESS</h2>
            <ol className="ord-timeline">
              {STEPS.map((step, i) => {
                const done = current >= 0 && i < current;
                const now = current === i;
                const Ico = step.icon;
                return (
                  <li key={step.key} className={`ord-step${done ? " is-done" : ""}${now ? " is-current" : ""}`}>
                    <span className="ord-step-marker">
                      {done ? <IconCheck size={14} /> : now ? <Ico size={14} /> : null}
                    </span>
                    <div className="ord-step-body">
                      <span className="ord-step-label">{step.label}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ── Details + tracking ── */}
          <div className="ord-side">

            <section className="ord-panel">
              <h2 className="ord-panel-title">DETAILS</h2>
              <dl className="ord-facts">
                <div>
                  <dt>Items &amp; fees</dt>
                  <dd>{formatJPY(itemsTotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>
                    {shipment.shipping_cost_jpy > 0 ? formatJPY(shipment.shipping_cost_jpy) : "Not yet quoted"}
                    {shipment.shipping_paid && <span className="ord-paid">PAID</span>}
                  </dd>
                </div>
                {shipment.shipping_method && (
                  <div><dt>Method</dt><dd>{shipment.shipping_method}</dd></div>
                )}
              </dl>
            </section>

            {shipment.shipping_paid && !shipment.tracking_number && (
              <section className="ord-info">
                <strong>YOUR PACKAGE SHIPS THIS SUNDAY</strong>
                <p>
                  We ship all paid packages on Sundays. Your tracking number
                  will appear here Sunday evening, Japan time.
                </p>
              </section>
            )}

            {shipment.tracking_number && (
              <section className="ord-panel">
                <h2 className="ord-panel-title">TRACKING</h2>
                <div className="ord-tracking">
                  <code>{shipment.tracking_number}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(shipment.tracking_number);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ord-copy"
                  >
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
                {track && (
                  <a href={track.url} target="_blank" rel="noopener noreferrer" className="btn btn-gold ord-track-btn">
                    TRACK ON {track.carrier} →
                  </a>
                )}
                <p className="ord-tracking-hint">
                  Updates can take 24–48 hours to appear after dispatch.
                </p>
              </section>
            )}

          </div>
        </div>

        {/* ── Orders in this package ── */}
        <section className="ord-panel" style={{ marginTop: "1.25rem" }}>
          <h2 className="ord-panel-title">WHAT&apos;S INSIDE ({orders.length})</h2>
          <div className="acc-order-grid">
            {orders.map(o => (
              <a key={o.id} href={`/account/orders/${o.id}`} className="acc-order-card">
                <div className="acc-order-top">
                  <span className="acc-order-ref">{o.public_ref}</span>
                </div>
                <div className="acc-order-items">{orderTitle(o.items)}</div>
                <div className="acc-order-bottom">
                  <span className="acc-order-next">{formatJPY((o.item_price_jpy || 0) + (o.service_fee_jpy || 0))}</span>
                  <span className="acc-order-arrow">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {shipment.notes && (
          <section className="ord-panel" style={{ marginTop: "1.25rem" }}>
            <h2 className="ord-panel-title">A NOTE FROM US</h2>
            <p className="ord-note">{shipment.notes}</p>
          </section>
        )}

      </main>
      <SiteFooter t={t} />
    </>
  );
}
