// @ts-nocheck
"use client";
// app/components/admin/RequestsTab.tsx
//
// Incoming requests from the site form. The point of this screen is to
// remove the retyping: a request becomes an order in one click, carrying
// its name, email, country and item description across.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export default function RequestsTab({ tokens }) {
  const { BG, SURFACE, SURFACE2, BORDER, RED, RED_D, VIOLET, ALERT, INK, MUTED, PIXEL, BODY } = tokens;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("new");
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Live: a request submitted while the admin is open appears immediately
  useEffect(() => {
    const channel = supabase
      .channel("admin-requests")
      .on("postgres_changes",
          { event: "*", schema: "public", table: "requests" },
          () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  /** Turn a request into an order, carrying everything across */
  async function convert(req) {
    setBusy(req.id);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        client_name: req.name,
        client_email: req.email,
        customer_id: req.customer_id,
        delivery_country: req.country,
        items: req.items,
        status: "Pending",
        purchase_date: new Date().toISOString().split("T")[0],
        platform: "Kizuna website",
        notes: req.notes,
        item_price_jpy: 0,
        service_fee_jpy: 0,
      })
      .select()
      .single();

    if (error) {
      setMsg("Could not create the order: " + error.message);
      setBusy(null);
      setTimeout(() => setMsg(""), 4000);
      return;
    }

    // Marking it converted fires the trigger that notifies the customer
    await supabase
      .from("requests")
      .update({ status: "converted", order_id: order.id, updated_at: new Date().toISOString() })
      .eq("id", req.id);

    setBusy(null);
    setMsg(`Order ${order.public_ref || order.id} created`);
    setTimeout(() => setMsg(""), 4000);
    load();
  }

  async function setStatus(req, status) {
    await supabase
      .from("requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.id);
    load();
  }

  async function del(id) {
    if (!confirm("Delete this request?")) return;
    await supabase.from("requests").delete().eq("id", id);
    load();
  }

  const counts = {
    new: requests.filter(r => r.status === "new").length,
    read: requests.filter(r => r.status === "read").length,
    converted: requests.filter(r => r.status === "converted").length,
    declined: requests.filter(r => r.status === "declined").length,
  };

  const shown = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const chip = (active) => ({
    padding: ".55rem .9rem",
    borderRadius: "8px",
    border: `2px solid ${active ? RED : BORDER}`,
    background: active ? RED : SURFACE,
    color: active ? BG : MUTED,
    fontFamily: PIXEL,
    fontSize: ".42rem",
    letterSpacing: ".04em",
    cursor: "pointer",
    lineHeight: 1.8,
    textTransform: "uppercase",
  });

  const STATUS_STYLE = {
    new:       { color: RED,    label: "NEW" },
    read:      { color: MUTED,  label: "READ" },
    converted: { color: VIOLET, label: "CONVERTED" },
    declined:  { color: ALERT,  label: "DECLINED" },
  };

  return (
    <div style={{ fontFamily: BODY }}>

      {/* Filters */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          ["new", `NEW (${counts.new})`],
          ["read", `READ (${counts.read})`],
          ["converted", `CONVERTED (${counts.converted})`],
          ["declined", `DECLINED (${counts.declined})`],
          ["all", `ALL (${requests.length})`],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={chip(filter === key)}>
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <p style={{ fontFamily: PIXEL, fontSize: ".45rem", color: RED, marginBottom: "1rem", lineHeight: 1.9 }}>
          {msg}
        </p>
      )}

      {loading ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Loading…</p>
      ) : shown.length === 0 ? (
        <div style={{
          background: SURFACE, border: `2px dashed ${BORDER}`, borderRadius: "12px",
          padding: "3rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ fontFamily: PIXEL, fontSize: ".48rem", color: MUTED, lineHeight: 1.9 }}>
            {filter === "new" ? "No new requests." : "Nothing here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {shown.map(req => {
            const st = STATUS_STYLE[req.status] || STATUS_STYLE.read;
            return (
              <div key={req.id} style={{
                background: SURFACE,
                border: `2px solid ${req.status === "new" ? RED : BORDER}`,
                borderRadius: "12px",
                padding: "1.1rem 1.3rem",
                boxShadow: "0 4px 0 rgba(0,0,0,.3)",
              }}>

                {/* Head */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: ".8rem", flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: ".95rem", color: INK, display: "block", marginBottom: ".25rem" }}>
                      {req.name}
                    </strong>
                    <a href={`mailto:${req.email}`} style={{ fontSize: ".78rem", color: RED, textDecoration: "none" }}>
                      {req.email}
                    </a>
                    {req.country && (
                      <span style={{ fontSize: ".78rem", color: MUTED, marginLeft: ".6rem" }}>
                        · {req.country}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <span style={{ fontFamily: PIXEL, fontSize: ".36rem", color: st.color, lineHeight: 1.9 }}>
                      {st.label}
                    </span>
                    <span style={{ fontFamily: PIXEL, fontSize: ".34rem", color: MUTED, lineHeight: 1.9 }}>
                      {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <p style={{
                  fontSize: ".86rem", color: MUTED, lineHeight: 1.7,
                  whiteSpace: "pre-line", marginBottom: ".9rem",
                  background: BG, borderRadius: "8px", padding: ".8rem .9rem",
                }}>
                  {req.items}
                </p>

                {req.notes && (
                  <p style={{ fontSize: ".78rem", color: MUTED, marginBottom: ".9rem" }}>
                    {req.notes}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {req.status !== "converted" && (
                    <button
                      onClick={() => convert(req)}
                      disabled={busy === req.id}
                      style={{
                        background: RED, color: BG, border: "none",
                        padding: ".65rem 1.1rem", borderRadius: "8px",
                        fontFamily: PIXEL, fontSize: ".42rem", letterSpacing: ".04em",
                        cursor: "pointer", lineHeight: 1.8, boxShadow: `0 3px 0 ${RED_D}`,
                        opacity: busy === req.id ? .5 : 1,
                      }}
                    >
                      {busy === req.id ? "…" : "→ CREATE ORDER"}
                    </button>
                  )}

                  {req.status === "converted" && req.order_id && (
                    <span style={{
                      fontFamily: PIXEL, fontSize: ".4rem", color: VIOLET,
                      border: `2px solid ${BORDER}`, borderRadius: "8px",
                      padding: ".65rem .9rem", lineHeight: 1.8,
                    }}>
                      ORDER #{req.order_id}
                    </span>
                  )}

                  {req.status === "new" && (
                    <button onClick={() => setStatus(req, "read")} style={{
                      background: "transparent", color: MUTED, border: `2px solid ${BORDER}`,
                      padding: ".65rem 1rem", borderRadius: "8px", fontFamily: PIXEL,
                      fontSize: ".42rem", cursor: "pointer", lineHeight: 1.8,
                    }}>
                      MARK READ
                    </button>
                  )}

                  {req.status !== "declined" && req.status !== "converted" && (
                    <button onClick={() => setStatus(req, "declined")} style={{
                      background: "transparent", color: MUTED, border: `2px solid ${BORDER}`,
                      padding: ".65rem 1rem", borderRadius: "8px", fontFamily: PIXEL,
                      fontSize: ".42rem", cursor: "pointer", lineHeight: 1.8,
                    }}>
                      DECLINE
                    </button>
                  )}

                  <button onClick={() => del(req.id)} style={{
                    background: "rgba(255,80,96,.1)", color: ALERT,
                    border: `2px solid rgba(255,80,96,.3)`,
                    padding: ".65rem .9rem", borderRadius: "8px", fontFamily: PIXEL,
                    fontSize: ".42rem", cursor: "pointer", lineHeight: 1.8,
                    marginLeft: "auto",
                  }}>
                    DELETE
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
