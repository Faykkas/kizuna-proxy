// @ts-nocheck
"use client";
// app/components/admin/ShipmentManager.tsx
//
// A shipment bundles several orders into one physical package: one tracking
// number, one shipping cost, one PayPal payment for the customer — instead
// of asking them to pay shipping separately for every item they bought.
//
// Orders keep their own item price and service fee (that revenue is still
// tracked per order); only the shipping side moves to the shipment.

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { formatJPY } from "../../lib/orderStatus";

const SHIPMENT_STATUSES = ["Awaiting Shipping Payment", "Shipped", "Delivered"];

export default function ShipmentManager({ shipment, orderIds, onClose, onSaved }) {
  // Editing an existing shipment vs. creating one from a fresh selection
  const isNew = !shipment;

  const [form, setForm] = useState(
    shipment || {
      tracking_number: "",
      shipping_method: "",
      shipping_cost_jpy: 0,
      shipping_paid: false,
      status: "Awaiting Shipping Payment",
      notes: "",
    }
  );
  const [linkedOrders, setLinkedOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { load(); }, [shipment?.id]);

  async function load() {
    const ids = shipment
      ? null
      : orderIds;

    const query = supabase
      .from("orders")
      .select("id, public_ref, items, client_name, item_price_jpy, service_fee_jpy");

    const { data } = shipment
      ? await query.eq("shipment_id", shipment.id)
      : await query.in("id", ids || []);

    setLinkedOrders(data || []);
  }

  async function save() {
    setSaving(true);
    const payload = {
      tracking_number: form.tracking_number || null,
      shipping_method: form.shipping_method || null,
      shipping_cost_jpy: form.shipping_cost_jpy || 0,
      shipping_paid: !!form.shipping_paid,
      status: form.status,
      notes: form.notes || null,
    };

    if (isNew) {
      const { data, error } = await supabase
        .from("shipments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setSaving(false);
        setMsg("Error: " + error.message);
        return;
      }

      await supabase.from("orders").update({ shipment_id: data.id }).in("id", orderIds);
      setSaving(false);
      setMsg("Package created");
      onSaved?.(data);
    } else {
      const { error } = await supabase
        .from("shipments")
        .update(payload)
        .eq("id", shipment.id);

      if (error) {
        setSaving(false);
        setMsg("Error: " + error.message);
        return;
      }

      // Keep each order's own status in step — a customer's order card
      // reads its own status, not the shipment's, so this has to move too.
      if (payload.status === "Shipped" || payload.status === "Delivered") {
        await supabase.from("orders").update({ status: payload.status }).eq("shipment_id", shipment.id);
      }

      setSaving(false);
      setMsg("Saved");
      onSaved?.();
    }
    setTimeout(() => setMsg(""), 2500);
  }

  async function removeOrder(orderId) {
    if (!confirm("Remove this order from the package? It will need its own shipping.")) return;
    await supabase.from("orders").update({ shipment_id: null }).eq("id", orderId);
    load();
    onSaved?.();
  }

  async function deleteShipment() {
    if (!confirm("Delete this package? Orders are kept, just unlinked from it.")) return;
    await supabase.from("orders").update({ shipment_id: null }).eq("shipment_id", shipment.id);
    await supabase.from("shipments").delete().eq("id", shipment.id);
    onSaved?.();
    onClose();
  }

  const totalRevenue = linkedOrders.reduce(
    (s, o) => s + (o.item_price_jpy || 0) + (o.service_fee_jpy || 0),
    0
  );
  const customerNames = [...new Set(linkedOrders.map(o => o.client_name).filter(Boolean))];

  return (
    <div className="adm-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-panel">

        <header className="adm-panel-head">
          <div>
            <span className="adm-ref">{isNew ? "NEW PACKAGE" : `PACKAGE #${shipment.id}`}</span>
            <h2>{customerNames.join(", ") || "Bundled order"}</h2>
          </div>
          <button className="adm-close" onClick={onClose}>×</button>
        </header>

        <div className="adm-body">

          <section className="adm-block">
            <label className="adm-label">ORDERS IN THIS PACKAGE ({linkedOrders.length})</label>
            <div className="adm-ship-orders">
              {linkedOrders.map(o => (
                <div key={o.id} className="adm-ship-order-row">
                  <div>
                    <span className="adm-ship-order-ref">{o.public_ref}</span>
                    <span className="adm-ship-order-items">{o.items || "—"}</span>
                  </div>
                  <div className="adm-ship-order-right">
                    <span>{formatJPY((o.item_price_jpy || 0) + (o.service_fee_jpy || 0))}</span>
                    {!isNew && (
                      <button className="adm-btn-danger-ghost" onClick={() => removeOrder(o.id)}>
                        REMOVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="adm-hint">Total revenue in this package: {formatJPY(totalRevenue)}</p>
          </section>

          {!isNew && (
            <section className="adm-block">
              <label className="adm-label">STATUS</label>
              <select value={form.status || ""} onChange={e => set("status", e.target.value)}>
                {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </section>
          )}

          <section className="adm-block">
            <label className="adm-label">SHIPPING</label>
            <div className="adm-grid-2">
              <input
                type="text"
                value={form.shipping_method || ""}
                onChange={e => set("shipping_method", e.target.value)}
                placeholder="EMS, DHL, Yamato…"
              />
              <input
                type="text"
                value={form.tracking_number || ""}
                onChange={e => set("tracking_number", e.target.value)}
                placeholder="Tracking number"
              />
            </div>
          </section>

          <section className="adm-block">
            <label className="adm-label">SHIPPING COST (JPY)</label>
            <input
              type="number"
              value={form.shipping_cost_jpy || 0}
              onChange={e => set("shipping_cost_jpy", +e.target.value)}
            />
            <div className="adm-pay-row">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={!!form.shipping_paid}
                  onChange={e => set("shipping_paid", e.target.checked)}
                />
                <span>Shipping paid</span>
              </label>
            </div>
          </section>

          <section className="adm-block">
            <label className="adm-label">NOTE TO CUSTOMER</label>
            <textarea
              rows={2}
              value={form.notes || ""}
              onChange={e => set("notes", e.target.value)}
              placeholder="Visible in their dashboard"
            />
          </section>

        </div>

        <footer className="adm-panel-foot">
          {msg && <span className="adm-msg">{msg}</span>}
          {!isNew && (
            <button className="adm-btn adm-btn-danger" onClick={deleteShipment}>
              DELETE PACKAGE
            </button>
          )}
          <button className="adm-btn" onClick={onClose}>CLOSE</button>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
            {saving ? "SAVING…" : isNew ? "CREATE PACKAGE" : "SAVE CHANGES"}
          </button>
        </footer>

      </div>
    </div>
  );
}
