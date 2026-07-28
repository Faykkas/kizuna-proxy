// @ts-nocheck
"use client";
// app/components/admin/OrderManager.tsx
//
// The admin side of an order. Everything that used to require several
// clicks or a manual email happens here in one place.
//
// Changing the status writes the timeline entry and the customer
// notification automatically — that part lives in a database trigger, not
// here, so it cannot be forgotten.

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { ALL_STATUSES, statusColor, formatJPY, orderTitle } from "../../lib/orderStatus";

/* ── PHOTO UPLOADER ─────────────────────────────────────────────────────── */

function PhotoManager({ orderId }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("order_photos")
      .select("*")
      .eq("order_id", orderId)
      .order("sort_order");
    setPhotos(data || []);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  async function upload(files) {
    const list = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    let done = 0;

    for (const file of list) {
      setProgress(`${done + 1} / ${list.length}`);

      // Unique path so two files with the same name never collide
      const ext = file.name.split(".").pop();
      const path = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("order-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        console.error("Upload failed:", upErr);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("order-photos")
        .getPublicUrl(path);

      await supabase.from("order_photos").insert({
        order_id: orderId,
        url: publicUrl,
        sort_order: photos.length + done,
      });

      done++;
    }

    setUploading(false);
    setProgress("");
    load();

    // Move the order along and let the customer know there is something to see
    if (done > 0) {
      await supabase
        .from("orders")
        .update({ status: "Photos Uploaded" })
        .eq("id", orderId);
    }
  }

  async function remove(photo) {
    if (!confirm("Delete this photo?")) return;

    // Recover the storage path from the public URL
    const marker = "/order-photos/";
    const idx = photo.url.indexOf(marker);
    if (idx > -1) {
      const path = photo.url.slice(idx + marker.length);
      await supabase.storage.from("order-photos").remove([path]);
    }
    await supabase.from("order_photos").delete().eq("id", photo.id);
    load();
  }

  return (
    <div className="adm-photos">
      <div
        className={`adm-drop${dragging ? " is-dragging" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => upload(e.target.files)}
        />
        {uploading ? (
          <span>Uploading {progress}…</span>
        ) : (
          <span>Drop photos here, or click to choose</span>
        )}
      </div>

      {photos.length > 0 && (
        <div className="adm-photo-grid">
          {photos.map(p => (
            <div key={p.id} className="adm-photo">
              <img src={p.url} alt="" />
              <button onClick={() => remove(p)} title="Delete">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ORDER EDITOR ───────────────────────────────────────────────────────── */

export default function OrderManager({ order, onClose, onSaved }) {
  const [form, setForm] = useState({ ...order });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [customers, setCustomers] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Registered customers, so an order with no email can be linked by hand.
  // 46 of the existing orders have client_email empty, so this matters.
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name")
      .then(({ data }) => setCustomers(data || []));
  }, []);

  async function save() {
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    delete payload.id;

    const { error } = await supabase.from("orders").update(payload).eq("id", order.id);
    setSaving(false);

    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setMsg("Saved");
    setTimeout(() => setMsg(""), 2500);
    onSaved?.();
  }

  /** One click: quote the shipping and ask the customer to pay */
  async function requestPayment() {
    if (!form.shipping_cost_jpy || form.shipping_cost_jpy <= 0) {
      setMsg("Set a shipping cost first");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setSaving(true);

    await supabase
      .from("orders")
      .update({
        shipping_cost_jpy: form.shipping_cost_jpy,
        shipping_paid: false,
        status: "Awaiting Shipping Payment",
      })
      .eq("id", order.id);

    setForm(f => ({ ...f, status: "Awaiting Shipping Payment" }));
    setSaving(false);
    setMsg("Payment requested — the customer has been notified");
    setTimeout(() => setMsg(""), 4000);
    onSaved?.();
  }

  return (
    <div className="adm-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-panel">

        <header className="adm-panel-head">
          <div>
            <span className="adm-ref">{order.public_ref || `#${order.id}`}</span>
            <h2>{orderTitle(order.items)}</h2>
          </div>
          <button className="adm-close" onClick={onClose}>×</button>
        </header>

        <div className="adm-body">

          {/* ── Status, the most used control ── */}
          <section className="adm-block">
            <label className="adm-label">STATUS</label>
            <div className="adm-status-row">
              <select
                value={form.status || ""}
                onChange={e => set("status", e.target.value)}
                style={{ borderColor: statusColor(form.status) }}
              >
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
                {saving ? "…" : "SAVE"}
              </button>
            </div>
            <p className="adm-hint">
              Changing the status notifies the customer automatically.
            </p>
          </section>

          {/* ── Purchase date ── */}
          <section className="adm-block">
            <label className="adm-label">PURCHASE DATE</label>
            <input
              type="date"
              value={form.purchase_date || ""}
              onChange={e => set("purchase_date", e.target.value || null)}
            />
            <p className="adm-hint">
              Which month this order's revenue counts toward — separate from the event date below.
            </p>
          </section>

          {/* ── Customer link ── */}
          <section className="adm-block">
            <label className="adm-label">CUSTOMER</label>
            <div className="adm-grid-2">
              <input
                type="text"
                value={form.client_name || ""}
                onChange={e => set("client_name", e.target.value)}
                placeholder="Name"
              />
              <input
                type="email"
                value={form.client_email || ""}
                onChange={e => set("client_email", e.target.value)}
                placeholder="Email"
              />
            </div>
            <select
              value={form.customer_id || ""}
              onChange={e => set("customer_id", e.target.value || null)}
            >
              <option value="">— No account linked —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name || c.id.slice(0, 8)}</option>
              ))}
            </select>
            <p className="adm-hint">
              {form.customer_id
                ? "This customer sees the order in their dashboard."
                : "Link an account so the customer can track this order."}
            </p>
          </section>

          {/* ── Items ── */}
          <section className="adm-block">
            <label className="adm-label">ITEMS</label>
            <textarea
              rows={3}
              value={form.items || ""}
              onChange={e => set("items", e.target.value)}
              placeholder="What are we buying?"
            />
          </section>

          {/* ── Money ── */}
          <section className="adm-block">
            <label className="adm-label">AMOUNTS (JPY)</label>
            <div className="adm-grid-3">
              <div>
                <span className="adm-sublabel">Item</span>
                <input
                  type="number"
                  value={form.item_price_jpy || 0}
                  onChange={e => set("item_price_jpy", +e.target.value)}
                />
              </div>
              <div>
                <span className="adm-sublabel">Service fee</span>
                <input
                  type="number"
                  value={form.service_fee_jpy || 0}
                  onChange={e => set("service_fee_jpy", +e.target.value)}
                />
              </div>
              <div>
                <span className="adm-sublabel">Shipping</span>
                <input
                  type="number"
                  value={form.shipping_cost_jpy || 0}
                  onChange={e => set("shipping_cost_jpy", +e.target.value)}
                />
              </div>
            </div>

            <div className="adm-pay-row">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={!!form.shipping_paid}
                  onChange={e => set("shipping_paid", e.target.checked)}
                />
                <span>Shipping paid</span>
              </label>
              <button className="adm-btn" onClick={requestPayment} disabled={saving}>
                REQUEST PAYMENT
              </button>
            </div>
          </section>

          {/* ── Shipping ── */}
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
                value={form.delivery_country || ""}
                onChange={e => set("delivery_country", e.target.value)}
                placeholder="Destination country"
              />
            </div>
            <input
              type="text"
              value={form.tracking_number || ""}
              onChange={e => set("tracking_number", e.target.value)}
              placeholder="Tracking number"
            />
          </section>

          {/* ── Event ── */}
          <section className="adm-block">
            <label className="adm-label">EVENT (optional)</label>
            <div className="adm-grid-2">
              <input
                type="text"
                value={form.event_name || ""}
                onChange={e => set("event_name", e.target.value)}
                placeholder="Event name"
              />
              <input
                type="date"
                value={form.event_date || ""}
                onChange={e => set("event_date", e.target.value || null)}
              />
            </div>
            <div className="adm-grid-2">
              <input
                type="text"
                value={form.event_status || ""}
                onChange={e => set("event_status", e.target.value)}
                placeholder="Status (queuing, attending…)"
              />
              <input
                type="text"
                value={form.event_result || ""}
                onChange={e => set("event_result", e.target.value)}
                placeholder="Result"
              />
            </div>
          </section>

          {/* ── Photos ── */}
          <section className="adm-block">
            <label className="adm-label">PHOTOS</label>
            <PhotoManager orderId={order.id} />
          </section>

          {/* ── Notes ── */}
          <section className="adm-block">
            <label className="adm-label">NOTE TO CUSTOMER</label>
            <textarea
              rows={2}
              value={form.notes || ""}
              onChange={e => set("notes", e.target.value)}
              placeholder="Visible in their dashboard"
            />
          </section>

          <section className="adm-block">
            <label className="adm-label adm-label-private">INTERNAL NOTE</label>
            <textarea
              rows={2}
              value={form.admin_notes || ""}
              onChange={e => set("admin_notes", e.target.value)}
              placeholder="Only you can see this"
            />
            <p className="adm-hint">Never shown to the customer.</p>
          </section>

        </div>

        <footer className="adm-panel-foot">
          {msg && <span className="adm-msg">{msg}</span>}
          <button className="adm-btn" onClick={onClose}>CLOSE</button>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
            {saving ? "SAVING…" : "SAVE CHANGES"}
          </button>
        </footer>

      </div>
    </div>
  );
}
