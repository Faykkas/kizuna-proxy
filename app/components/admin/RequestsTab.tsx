// @ts-nocheck
"use client";
// app/components/admin/RequestsTab.tsx
//
// Incoming requests from the site form. The point of this screen is to
// remove the retyping: a request becomes an order in one click, carrying
// its name, email, country and item description across.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { IconSearch, IconTrash, IconLink, IconPin } from "../icons/UiIcons";

export default function RequestsTab({ tokens, jumpToQuery, onJumped }) {
  const { BG, SURFACE, SURFACE2, BORDER, RED, RED_D, VIOLET, ALERT, INK, MUTED, PIXEL, BODY } = tokens;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("new");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(() => new Set());

  // Arriving from the header quick-search: show every status so the match
  // is guaranteed visible, not hidden behind the default "new" filter.
  useEffect(() => {
    if (!jumpToQuery) return;
    setSearch(jumpToQuery);
    setFilter("all");
    onJumped?.();
  }, [jumpToQuery, onJumped]);

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

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function delSelected() {
    if (!confirm(`Delete ${selected.size} request${selected.size !== 1 ? "s" : ""}? This can't be undone.`)) return;
    await supabase.from("requests").delete().in("id", [...selected]);
    setSelected(new Set());
    load();
  }

  const counts = {
    new: requests.filter(r => r.status === "new").length,
    read: requests.filter(r => r.status === "read").length,
    converted: requests.filter(r => r.status === "converted").length,
    declined: requests.filter(r => r.status === "declined").length,
  };

  const byStatus = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const byType = typeFilter === "all" ? byStatus : byStatus.filter(r => r.purchase_type === typeFilter);
  const q = search.trim().toLowerCase();
  const shown = !q ? byType : byType.filter(r =>
    r.name?.toLowerCase().includes(q) ||
    r.email?.toLowerCase().includes(q) ||
    r.items?.toLowerCase().includes(q)
  );

  const typeCounts = {
    online: requests.filter(r => r.purchase_type === "online").length,
    visit: requests.filter(r => r.purchase_type === "visit").length,
  };

  const chip = (active) => ({
    padding: ".5rem .9rem",
    borderRadius: "8px",
    border: `1px solid ${active ? RED : BORDER}`,
    background: active ? RED : SURFACE,
    color: active ? BG : MUTED,
    fontFamily: BODY,
    fontSize: ".78rem",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
  });

  const STATUS_STYLE = {
    new:       { color: RED,    label: "NEW" },
    read:      { color: MUTED,  label: "READ" },
    converted: { color: VIOLET, label: "CONVERTED" },
    declined:  { color: ALERT,  label: "DECLINED" },
  };

  return (
    <div style={{ fontFamily: BODY }}>

      {/* Search */}
      <div style={{ marginBottom: "1rem", position: "relative", maxWidth: "360px" }}>
        <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: MUTED, display: "flex" }}><IconSearch size={14} /></span>
        <input
          style={{ width: "100%", padding: ".6rem 1rem .6rem 2.1rem", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: INK, fontSize: ".85rem", fontFamily: BODY, boxSizing: "border-box" }}
          placeholder="Search name, email, item…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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

      {/* Purchase type filter */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          ["all", `ALL TYPES (${requests.length})`],
          ["online", `ONLINE (${typeCounts.online})`],
          ["visit", `STORE VISIT (${typeCounts.visit})`],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTypeFilter(key)} style={chip(typeFilter === key)}>
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <p style={{ fontFamily: BODY, fontSize: ".82rem", fontWeight: 500, color: RED, marginBottom: "1rem" }}>
          {msg}
        </p>
      )}

      {/* Selection bar: pick several requests (e.g. a batch of spam) and clear them in one go */}
      {shown.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".78rem", color: MUTED, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={shown.every(r => selected.has(r.id))}
              onChange={() => {
                const allShownSelected = shown.every(r => selected.has(r.id));
                setSelected(prev => {
                  const next = new Set(prev);
                  shown.forEach(r => allShownSelected ? next.delete(r.id) : next.add(r.id));
                  return next;
                });
              }}
            />
            Select all shown
          </label>

          {selected.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".55rem .9rem", background: "rgba(255,80,96,.1)", border: `1px solid ${ALERT}`, borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: ".8rem", color: INK }}>{selected.size} selected</span>
              <button onClick={delSelected} style={{
                background: ALERT, color: "#fff", border: "none",
                padding: ".5rem .9rem", borderRadius: "8px", fontFamily: BODY,
                fontSize: ".75rem", fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: ".4rem",
              }}>
                <IconTrash size={14} /> Delete selected
              </button>
              <button onClick={() => setSelected(new Set())} style={{
                background: "transparent", color: MUTED, border: `1px solid ${BORDER}`,
                padding: ".5rem .9rem", borderRadius: "8px", fontFamily: BODY,
                fontSize: ".75rem", fontWeight: 500, cursor: "pointer",
              }}>
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Loading…</p>
      ) : shown.length === 0 ? (
        <div style={{
          background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: "12px",
          padding: "3rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ fontFamily: BODY, fontSize: ".85rem", color: MUTED }}>
            {q ? "No match." : filter === "new" ? "No new requests." : "Nothing here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {shown.map(req => {
            const st = STATUS_STYLE[req.status] || STATUS_STYLE.read;
            return (
              <div key={req.id} style={{
                background: SURFACE,
                border: `1px solid ${req.status === "new" ? RED : BORDER}`,
                borderRadius: "12px",
                padding: "1.1rem 1.3rem",
                boxShadow: "0 1px 3px rgba(0,0,0,.15)",
              }}>

                {/* Head */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: ".8rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: ".7rem" }}>
                    <input
                      type="checkbox"
                      checked={selected.has(req.id)}
                      onChange={() => toggleSelect(req.id)}
                      style={{ marginTop: ".3rem", cursor: "pointer" }}
                    />
                    <div>
                    <strong style={{ fontSize: ".95rem", color: INK, display: "block", marginBottom: ".25rem" }}>
                      {req.lead_type === "business" && (
                        <span style={{ fontSize: ".62rem", fontWeight: 700, color: VIOLET, border: `1px solid ${VIOLET}`, borderRadius: "5px", padding: ".1rem .4rem", marginRight: ".5rem", verticalAlign: "middle", display: "inline-flex", alignItems: "center", gap: ".3rem" }}>
                          <IconPin size={11} /> BUSINESS
                        </span>
                      )}
                      {req.lead_type === "business" ? (req.business_name || req.name) : req.name}
                    </strong>
                    {req.lead_type === "business" && req.business_name && (
                      <span style={{ fontSize: ".72rem", color: MUTED, display: "block", marginBottom: ".2rem" }}>
                        Contact: {req.name}
                      </span>
                    )}
                    <a href={`mailto:${req.email}`} style={{ fontSize: ".78rem", color: RED, textDecoration: "none" }}>
                      {req.email}
                    </a>
                    {req.country && (
                      <span style={{ fontSize: ".78rem", color: MUTED, marginLeft: ".6rem" }}>
                        · {req.country}
                      </span>
                    )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <span style={{ fontFamily: BODY, fontSize: ".72rem", fontWeight: 600, color: st.color }}>
                      {st.label}
                    </span>
                    <span style={{ fontFamily: BODY, fontSize: ".7rem", color: MUTED }}>
                      {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>

                {/* Meta chips: quantity, purchase type, deadline, partial fulfillment */}
                {(req.quantity || req.purchase_type || req.deadline || req.partial_ok != null) && (
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
                    {req.quantity && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Qty: {req.quantity}
                      </span>
                    )}
                    {req.purchase_type && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        {req.purchase_type === "visit" ? "Store visit" : "Online"}
                      </span>
                    )}
                    {req.deadline && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Deadline: {new Date(req.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    {req.partial_ok != null && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Partial: {req.partial_ok ? "OK" : "All or nothing"}
                      </span>
                    )}
                  </div>
                )}

                {/* Business-only chips: type, category, website, recurring, contact platform, discovery source */}
                {req.lead_type === "business" && (
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
                    {req.business_type && (
                      <span style={{ fontSize: ".72rem", color: VIOLET, border: `1px solid ${VIOLET}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        {req.business_type}
                      </span>
                    )}
                    {req.product_category && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Category: {req.product_category}
                      </span>
                    )}
                    {req.business_website && (
                      <a href={req.business_website.startsWith("http") ? req.business_website : `https://${req.business_website}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: ".72rem", color: RED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: ".35rem" }}>
                        <IconLink size={12} /> Business site
                      </a>
                    )}
                    {req.recurring_sourcing && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Recurring: {req.recurring_sourcing}
                      </span>
                    )}
                    {req.contact_platform && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Contact via: {req.contact_platform}
                      </span>
                    )}
                    {req.discovery_source && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        Found us: {req.discovery_source}
                      </span>
                    )}
                    {(req.utm_source || req.utm_campaign) && (
                      <span style={{ fontSize: ".72rem", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: ".25rem .6rem" }}>
                        UTM: {[req.utm_source, req.utm_medium, req.utm_campaign].filter(Boolean).join(" / ")}
                      </span>
                    )}
                  </div>
                )}

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
                        padding: ".6rem 1.1rem", borderRadius: "8px",
                        fontFamily: BODY, fontSize: ".82rem", fontWeight: 600,
                        cursor: "pointer",
                        opacity: busy === req.id ? .5 : 1,
                      }}
                    >
                      {busy === req.id ? "…" : "→ Create order"}
                    </button>
                  )}

                  {req.status === "converted" && req.order_id && (
                    <span style={{
                      fontFamily: BODY, fontSize: ".78rem", fontWeight: 600, color: VIOLET,
                      border: `1px solid ${BORDER}`, borderRadius: "8px",
                      padding: ".6rem .9rem",
                    }}>
                      Order #{req.order_id}
                    </span>
                  )}

                  {req.status === "new" && (
                    <button onClick={() => setStatus(req, "read")} style={{
                      background: "transparent", color: MUTED, border: `1px solid ${BORDER}`,
                      padding: ".6rem 1rem", borderRadius: "8px", fontFamily: BODY,
                      fontSize: ".82rem", fontWeight: 500, cursor: "pointer",
                    }}>
                      Mark read
                    </button>
                  )}

                  {req.status !== "declined" && req.status !== "converted" && (
                    <button onClick={() => setStatus(req, "declined")} style={{
                      background: "transparent", color: MUTED, border: `1px solid ${BORDER}`,
                      padding: ".6rem 1rem", borderRadius: "8px", fontFamily: BODY,
                      fontSize: ".82rem", fontWeight: 500, cursor: "pointer",
                    }}>
                      Decline
                    </button>
                  )}

                  <button onClick={() => del(req.id)} style={{
                    background: "rgba(255,80,96,.1)", color: ALERT,
                    border: `1px solid rgba(255,80,96,.3)`,
                    padding: ".6rem .9rem", borderRadius: "8px", fontFamily: BODY,
                    fontSize: ".82rem", fontWeight: 500, cursor: "pointer",
                    marginLeft: "auto",
                  }}>
                    Delete
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
