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
import { useLanguage } from "../../../lib/language";
import { useAuth } from "../../../lib/auth";
import { useOrderDetail } from "../../../lib/useOrders";
import PayButton from "../../../components/account/PayButton";
import {
  TIMELINE, SPECIAL_STATUSES, statusMeta, statusColor, stepIndex,
  progressPercent, nextStep, needsCustomerAction, formatJPY, normaliseStatus, orderTitle,
  timelineFor, trackingUrl,
} from "../../../lib/orderStatus";

const ICONS = {
  box: IconBox, truck: IconTruck, check: IconCheck,
  hourglass: IconHourglass, card: IconCards,
  coins: IconMarketplace, glass: IconMarketplace,
};

function Timeline({ status, events, order, t }) {
  const steps = timelineFor(order);
  const current = stepIndex(status, order);
  const normalised = normaliseStatus(status);
  const special = SPECIAL_STATUSES[normalised];
  const specialTr = special ? (t?.orderStatusMap?.[normalised] || special) : null;

  // When the order is in a special state (cancelled, action required) the
  // linear timeline would be misleading, so we show the state on its own.
  if (special && special.terminal) {
    return (
      <div className="ord-special">
        <strong>{specialTr.label}</strong>
        <p>{specialTr.hint}</p>
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
      {steps.map((step, i) => {
        const done = current >= 0 && i < current;
        const now = current === i;
        const Ico = ICONS[step.icon] || IconHourglass;
        const date = dates[step.key];
        const stepTr = t?.orderStatusMap?.[step.key] || step;

        return (
          <li
            key={step.key}
            className={`ord-step${done ? " is-done" : ""}${now ? " is-current" : ""}`}
          >
            <span className="ord-step-marker">
              {done ? <IconCheck size={14} /> : now ? <Ico size={14} /> : null}
            </span>
            <div className="ord-step-body">
              <span className="ord-step-label">{stepTr.label}</span>
              {now && <span className="ord-step-hint">{stepTr.hint}</span>}
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
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { order, photos, events, payment, shipment, shipmentOrders, loading, reload } = useOrderDetail(orderId);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/login");
  }, [authLoading, user, router]);

  const od = t.orderDetail || {};

  if (authLoading || loading) {
    return (
      <>
        <SiteNav />
        <main className="acc-wrap"><p className="acc-loading">{od.loading || "Loading…"}</p></main>
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
            <p>{od.orderNotFound || "Order not found."}</p>
            <a href="/account" className="btn btn-outline">{od.backToOrders || "BACK TO ORDERS"}</a>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  const meta = statusMeta(order.status, t);
  const action = needsCustomerAction(order.status);
  const itemTotal = (order.item_price_jpy || 0) + (order.service_fee_jpy || 0);
  const shipping = order.shipping_cost_jpy || 0;

  return (
    <>
      <SiteNav />
      <main className="acc-wrap">

        <nav className="breadcrumb ord-crumb">
          <a href="/account">{od.myOrders || "My orders"}</a><span>/</span><span>{order.public_ref}</span>
        </nav>

        {/* ── Header ── */}
        <header className="ord-head">
          <div>
            <span className="ord-ref">{order.public_ref}</span>
            <h1 className="ord-title">{orderTitle(order.items)}</h1>
          </div>
          <span className="ord-badge" style={{ color: statusColor(order.status) }}>
            {meta.label}
          </span>
        </header>

        {/* ── Progress ── */}
        <div className="ord-progress">
          <div className="ord-progress-fill" style={{ width: `${progressPercent(order.status, order)}%` }} />
        </div>

        {/* ── Bundled into a package: shipping/tracking/payment all live there ── */}
        {shipment && (
          <section className="ord-pay">
            <div>
              <span className="ord-pay-label">
                {od.packagePrefix || "PACKAGE"} — {shipmentOrders.length > 1
                  ? (od.ordersBundledMany || "{n} orders bundled together").replace("{n}", shipmentOrders.length)
                  : (od.ordersBundledOne || "1 order bundled together")}
              </span>
              <span className="ord-pay-amount" style={{ fontSize: ".7rem" }}>
                {shipment.shipping_paid
                  ? (od.shippingPaid || "Shipping paid")
                  : shipment.shipping_cost_jpy > 0
                    ? (od.shippingDue || "{n} shipping due").replace("{n}", formatJPY(shipment.shipping_cost_jpy))
                    : (od.shippingNotQuoted || "Shipping not yet quoted")}
              </span>
            </div>
            <a href={`/account/shipments/${shipment.id}`} className="btn btn-gold">
              {od.viewPackage || "VIEW PACKAGE →"}
            </a>
          </section>
        )}

        {/* ── Payment call to action, first because it blocks everything ── */}
        {!shipment && action && order.status === "Awaiting Shipping Payment" && shipping > 0 && (
          <section className="ord-pay">
            <div className="ord-pay-left">
              <span className="ord-pay-label">
                {od.shippingLabel || "SHIPPING"} — {order.shipping_method || (od.international || "international")}
                {order.delivery_country ? (od.toCountry || " to {country}").replace("{country}", order.delivery_country) : ""}
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

        {normaliseStatus(order.status) === "Awaiting Event" && order.event_date && (
          <section className="ord-event-banner">
            <div>
              <span className="ord-event-label">{od.eventDateLabel || "EVENT DATE"}</span>
              <span className="ord-event-date">
                {new Date(order.event_date).toLocaleDateString("en-US",
                  { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              {order.event_name && <span className="ord-event-name">{order.event_name}</span>}
            </div>
            <span className="ord-event-countdown">
              {(() => {
                const days = Math.ceil(
                  (new Date(order.event_date) - new Date()) / 86400000
                );
                if (days > 1) return (od.inDays || "IN {n} DAYS").replace("{n}", days);
                if (days === 1) return od.tomorrow || "TOMORROW";
                if (days === 0) return od.today || "TODAY";
                return od.passed || "PASSED";
              })()}
            </span>
          </section>
        )}

        {action && order.status === "Action Required" && (
          <section className="ord-alert">
            <strong>{od.needSomething || "We need something from you"}</strong>
            <p>{order.notes || (od.checkEmailOrContact || "Please check your email or get in touch.")}</p>
            <a href="mailto:contact@kizunaproxy.com" className="btn btn-outline">{od.contactUs || "CONTACT US"}</a>
          </section>
        )}

        <div className="ord-grid">

          {/* ── Timeline ── */}
          <section className="ord-panel">
            <h2 className="ord-panel-title">{od.progress || "PROGRESS"}</h2>
            <Timeline status={order.status} events={events} order={order} t={t} />
          </section>

          {/* ── Details ── */}
          <div className="ord-side">

            <section className="ord-panel">
              <h2 className="ord-panel-title">{od.details || "DETAILS"}</h2>
              <dl className="ord-facts">
                <div>
                  <dt>{od.itemAndFee || "Item & fee"}</dt>
                  <dd>{formatJPY(itemTotal)}</dd>
                </div>
                {!shipment && shipping > 0 && (
                  <div>
                    <dt>{od.shippingDt || "Shipping"}</dt>
                    <dd>
                      {formatJPY(shipping)}
                      {order.shipping_paid && <span className="ord-paid">{od.paidBadge || "PAID"}</span>}
                    </dd>
                  </div>
                )}
                {!shipment && order.shipping_method && (
                  <div><dt>{od.method || "Method"}</dt><dd>{order.shipping_method}</dd></div>
                )}
                {order.delivery_country && (
                  <div><dt>{od.destination || "Destination"}</dt><dd>{order.delivery_country}</dd></div>
                )}
                {order.purchase_date && (
                  <div>
                    <dt>{od.ordered || "Ordered"}</dt>
                    <dd>{new Date(order.purchase_date).toLocaleDateString("en-US",
                      { year: "numeric", month: "short", day: "numeric" })}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* ── Paid, waiting to ship: tracking isn't up yet, say when it will be ── */}
            {!shipment && order.shipping_paid && !order.tracking_number && (
              <section className="ord-info">
                <strong>{od.sundayShipTitle || "YOUR PACKAGE SHIPS THIS SUNDAY"}</strong>
                <p>
                  {od.sundayShipBody || "We ship all paid packages on Sundays. Your tracking number will appear here Sunday evening, Japan time."}
                </p>
              </section>
            )}

            {/* ── Tracking (not shown when bundled — tracking lives on the package) ── */}
            {!shipment && order.tracking_number && (
              <section className="ord-panel">
                <h2 className="ord-panel-title">{od.trackingTitle || "TRACKING"}</h2>
                <div className="ord-tracking">
                  <code>{order.tracking_number}</code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(order.tracking_number)}
                    className="ord-copy"
                  >
                    {od.copy || "COPY"}
                  </button>
                </div>
                {(() => {
                  const tr = trackingUrl(order.tracking_number, order.shipping_method);
                  return tr ? (
                    <a
                      href={tr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gold ord-track-btn"
                    >
                      {(od.trackOn || "TRACK ON {carrier} →").replace("{carrier}", tr.carrier)}
                    </a>
                  ) : null;
                })()}
                <p className="ord-tracking-hint">
                  {od.trackingHint || "Updates can take 24–48 hours to appear after dispatch."}
                </p>
              </section>
            )}

            {/* ── Event info ── */}
            {order.event_name && (
              <section className="ord-panel">
                <h2 className="ord-panel-title">{od.eventTitle || "EVENT"}</h2>
                <dl className="ord-facts">
                  <div><dt>{od.name || "Name"}</dt><dd>{order.event_name}</dd></div>
                  {order.event_date && (
                    <div>
                      <dt>{od.date || "Date"}</dt>
                      <dd>{new Date(order.event_date).toLocaleDateString("en-US",
                        { year: "numeric", month: "short", day: "numeric" })}</dd>
                    </div>
                  )}
                  {order.event_status && <div><dt>{od.statusDt || "Status"}</dt><dd>{order.event_status}</dd></div>}
                  {order.event_result && <div><dt>{od.result || "Result"}</dt><dd>{order.event_result}</dd></div>}
                </dl>
              </section>
            )}

          </div>
        </div>

        {/* ── Photos ── */}
        {photos.length > 0 && (
          <section className="ord-panel ord-photos-panel">
            <h2 className="ord-panel-title">{(od.photosTitle || "PHOTOS ({n})").replace("{n}", photos.length)}</h2>
            <p className="ord-photos-hint">
              {od.photosHint || "Taken when your item reached our Tokyo office. Tap to enlarge."}
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
            <h2 className="ord-panel-title">{od.noteFromUs || "A NOTE FROM US"}</h2>
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
