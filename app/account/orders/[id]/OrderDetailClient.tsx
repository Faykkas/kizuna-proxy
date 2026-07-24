// @ts-nocheck
"use client";
// app/account/orders/[id]/OrderDetailClient.tsx
//
// Everything about one order, on one screen. No tabs, no accordions —
// a customer checking on their parcel should not have to hunt.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../../../components/SiteNav";
import SiteFooter from "../../../components/SiteFooter";
import Maneki from "../../../components/pixel/Maneki";
import { IconBox, IconTruck, IconCheck, IconHourglass, IconCards, IconMarketplace }
  from "../../../components/pixel/PixelIcons";
import { copy as t } from "../../../translations";
import { useAuth } from "../../../lib/auth";
import { useOrderDetail } from "../../../lib/useOrders";
import PayButton from "../../../components/account/PayButton";
import {
  TIMELINE, SPECIAL_STATUSES, statusMeta, statusColor, stepIndex,
  progressPercent, nextStep, needsCustomerAction, formatJPY, normaliseStatus,
} from "../../../lib/orderStatus";

const ICONS = {
  box: IconBox, truck: IconTruck, check: IconCheck,
  hourglass: IconHourglass, card: IconCards,
  coins: IconMarketplace, glass: IconMarketplace,
};

function Timeline({ status, events }) {
  const current = stepIndex(status);
  const special = SPECIAL_STATUSES[normaliseStatus(status)];

  // When the order is in a special state (cancelled, action required) the
  // linear timeline would be misleading, so we show the state on its own.
  if (special && special.terminal) {
    return (
      <div className="ord-special">
        <strong>{special.label}</strong>
        <p>{special.hint}</p>
      </div>
    );
  }

  // Map each step to the date it happened, when we know it
  const dates = {};
  events.forEach(e => {
    if (!dates[normaliseStatus(e.status)]) dates[normaliseStatus(e.status)] = e.created_at;
  });

  return (
    <ol className="ord-timeline">
      {TIMELINE.map((step, i) => {
        const done = current >= 0 && i < current;
        const now = current === i;
        const Ico = ICONS[step.icon] || IconHourglass;
        const date = dates[step.key];

        return (
          <li
            key={step.key}
            className={`ord-step${done ? " is-done" : ""}${now ? " is-current" : ""}`}
          >
            <span className="ord-step-marker">
              {done ? <IconCheck size={14} /> : now ? <Ico size={14} /> : null}
            </span>
            <div className="ord-step-body">
              <span className="ord-step-label">{step.label}</span>
              {now && <span className="ord-step-hint">{step.hint}</span>}
            </div>
            {date && (
              <span className="ord-step-date">
                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailClient({ orderId }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { order, photos, events, payment, loading, reload } = useOrderDetail(orderId);
  const [lightbox, setLightbox] = useState(null);

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

  if (!order) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap">
          <div className="acc-empty">
            <Maneki prop="glass" size={80} />
            <p>Order not found.</p>
            <a href="/account" className="btn btn-outline">BACK TO ORDERS</a>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  const meta = statusMeta(order.status);
  const action = needsCustomerAction(order.status);
  const itemTotal = (order.item_price_jpy || 0) + (order.service_fee_jpy || 0);
  const shipping = order.shipping_cost_jpy || 0;

  return (
    <>
      <SiteNav />
      <main className="acc-wrap">

        <nav className="breadcrumb ord-crumb">
          <a href="/account">My orders</a><span>/</span><span>{order.public_ref}</span>
        </nav>

        {/* ── Header ── */}
        <header className="ord-head">
          <div>
            <span className="ord-ref">{order.public_ref}</span>
            <h1 className="ord-title">{order.items || "Your order"}</h1>
          </div>
          <span className="ord-badge" style={{ color: statusColor(order.status) }}>
            {meta.label}
          </span>
        </header>

        {/* ── Progress ── */}
        <div className="ord-progress">
          <div className="ord-progress-fill" style={{ width: `${progressPercent(order.status)}%` }} />
        </div>

        {/* ── Payment call to action, first because it blocks everything ── */}
        {action && order.status === "Awaiting Shipping Payment" && shipping > 0 && (
          <section className="ord-pay">
            <div className="ord-pay-left">
              <span className="ord-pay-label">
                SHIPPING — {order.shipping_method || "international"}
                {order.delivery_country ? ` to ${order.delivery_country}` : ""}
              </span>
              <span className="ord-pay-amount">{formatJPY(shipping)}</span>
            </div>
            <PayButton
              orderId={order.id}
              amountJpy={shipping}
              paymentId={payment?.id}
              onPaid={reload}
            />
          </section>
        )}

        {action && order.status === "Action Required" && (
          <section className="ord-alert">
            <strong>We need something from you</strong>
            <p>{order.notes || "Please check your email or get in touch."}</p>
            <a href="mailto:contact@kizunaproxy.com" className="btn btn-outline">CONTACT US</a>
          </section>
        )}

        <div className="ord-grid">

          {/* ── Timeline ── */}
          <section className="ord-panel">
            <h2 className="ord-panel-title">PROGRESS</h2>
            <Timeline status={order.status} events={events} />
          </section>

          {/* ── Details ── */}
          <div className="ord-side">

            <section className="ord-panel">
              <h2 className="ord-panel-title">DETAILS</h2>
              <dl className="ord-facts">
                <div>
                  <dt>Item &amp; fee</dt>
                  <dd>{formatJPY(itemTotal)}</dd>
                </div>
                {shipping > 0 && (
                  <div>
                    <dt>Shipping</dt>
                    <dd>
                      {formatJPY(shipping)}
                      {order.shipping_paid && <span className="ord-paid">PAID</span>}
                    </dd>
                  </div>
                )}
                {order.shipping_method && (
                  <div><dt>Method</dt><dd>{order.shipping_method}</dd></div>
                )}
                {order.delivery_country && (
                  <div><dt>Destination</dt><dd>{order.delivery_country}</dd></div>
                )}
                {order.purchase_date && (
                  <div>
                    <dt>Ordered</dt>
                    <dd>{new Date(order.purchase_date).toLocaleDateString("en-US",
                      { year: "numeric", month: "short", day: "numeric" })}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* ── Tracking ── */}
            {order.tracking_number && (
              <section className="ord-panel">
                <h2 className="ord-panel-title">TRACKING</h2>
                <div className="ord-tracking">
                  <code>{order.tracking_number}</code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(order.tracking_number)}
                    className="ord-copy"
                  >
                    COPY
                  </button>
                </div>
                <p className="ord-tracking-hint">
                  Track it on the carrier&apos;s website with this number.
                </p>
              </section>
            )}

            {/* ── Event info ── */}
            {order.event_name && (
              <section className="ord-panel">
                <h2 className="ord-panel-title">EVENT</h2>
                <dl className="ord-facts">
                  <div><dt>Name</dt><dd>{order.event_name}</dd></div>
                  {order.event_date && (
                    <div>
                      <dt>Date</dt>
                      <dd>{new Date(order.event_date).toLocaleDateString("en-US",
                        { year: "numeric", month: "short", day: "numeric" })}</dd>
                    </div>
                  )}
                  {order.event_status && <div><dt>Status</dt><dd>{order.event_status}</dd></div>}
                  {order.event_result && <div><dt>Result</dt><dd>{order.event_result}</dd></div>}
                </dl>
              </section>
            )}

          </div>
        </div>

        {/* ── Photos ── */}
        {photos.length > 0 && (
          <section className="ord-panel ord-photos-panel">
            <h2 className="ord-panel-title">PHOTOS ({photos.length})</h2>
            <p className="ord-photos-hint">
              Taken when your item reached our Tokyo office. Tap to enlarge.
            </p>
            <div className="ord-photos">
              {photos.map(p => (
                <button key={p.id} className="ord-photo" onClick={() => setLightbox(p)}>
                  <img src={p.url} alt={p.caption || "Order photo"} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Note from us ── */}
        {order.notes && !action && (
          <section className="ord-panel">
            <h2 className="ord-panel-title">A NOTE FROM US</h2>
            <p className="ord-note">{order.notes}</p>
          </section>
        )}

      </main>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="ord-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption || "Order photo"} />
          {lightbox.caption && <p>{lightbox.caption}</p>}
          <button className="ord-lightbox-close" aria-label="Close">×</button>
        </div>
      )}

      <SiteFooter t={t} />
    </>
  );
}
