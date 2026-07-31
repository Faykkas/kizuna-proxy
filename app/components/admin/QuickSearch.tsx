// @ts-nocheck
"use client";
// app/components/admin/QuickSearch.tsx
//
// A customer emails about "my order" and the admin has to guess whether
// that's an Order, a Request, or someone who never converted — three
// separate tabs, three separate search boxes. This searches Orders and
// Requests together from one box in the header and jumps straight to the
// match, so there's no guessing which tab to open first.

import { useState, useEffect, useRef, useCallback } from "react";

export default function QuickSearch({ supabase, tokens, onJumpToOrder, onJumpToRequest }) {
  const { SURFACE, BORDER, RED, INK, MUTED, PIXEL, BODY } = tokens;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  const run = useCallback(async (q) => {
    setLoading(true);
    const like = `%${q}%`;
    const [ordersRes, requestsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, public_ref, client_name, client_email, items")
        .or(`client_name.ilike.${like},client_email.ilike.${like},items.ilike.${like}`)
        .limit(5),
      supabase
        .from("requests")
        .select("id, name, email, items")
        .or(`name.ilike.${like},email.ilike.${like}`)
        .limit(5),
    ]);
    setOrders(ordersRes.data || []);
    setRequests(requestsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const q = query.trim();
    clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setOrders([]);
      setRequests([]);
      return;
    }
    debounceRef.current = setTimeout(() => run(q), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, run]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function pickOrder(o) {
    onJumpToOrder?.(o.id);
    setOpen(false);
    setQuery("");
  }

  function pickRequest(r) {
    onJumpToRequest?.(r.email || r.name || "");
    setOpen(false);
    setQuery("");
  }

  const hasResults = orders.length > 0 || requests.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  const row = {
    display: "block", width: "100%", textAlign: "left",
    background: "transparent", border: "none", cursor: "pointer",
    padding: ".6rem .9rem", borderRadius: "6px", fontFamily: BODY,
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "1 1 220px", minWidth: "180px", maxWidth: "320px" }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="🔍 Search orders & requests…"
        style={{
          width: "100%", padding: ".55rem .8rem", boxSizing: "border-box",
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px",
          color: INK, fontSize: ".82rem", fontFamily: BODY, outline: "none",
        }}
      />

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,.35)", zIndex: 50, overflow: "hidden", maxHeight: "360px", overflowY: "auto",
        }}>
          {loading ? (
            <p style={{ color: MUTED, fontSize: ".78rem", padding: "1rem", margin: 0 }}>Searching…</p>
          ) : !hasResults ? (
            <p style={{ color: MUTED, fontSize: ".78rem", padding: "1rem", margin: 0 }}>No match.</p>
          ) : (
            <>
              {orders.length > 0 && (
                <div>
                  <div style={{ fontFamily: BODY, fontSize: ".68rem", fontWeight: 600, letterSpacing: ".02em", color: MUTED, padding: ".6rem .9rem .3rem" }}>
                    ORDERS
                  </div>
                  {orders.map(o => (
                    <button key={o.id} onClick={() => pickOrder(o)} style={row}
                      onMouseEnter={e => e.currentTarget.style.background = BORDER + "33"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontSize: ".82rem", color: INK }}>
                        {o.client_name || "—"} <span style={{ color: MUTED, fontSize: ".7rem" }}>{o.public_ref ? `· ${o.public_ref}` : ""}</span>
                      </div>
                      <div style={{ fontSize: ".7rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.client_email || o.items || ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {requests.length > 0 && (
                <div>
                  <div style={{ fontFamily: BODY, fontSize: ".68rem", fontWeight: 600, letterSpacing: ".02em", color: MUTED, padding: ".6rem .9rem .3rem" }}>
                    REQUESTS
                  </div>
                  {requests.map(r => (
                    <button key={r.id} onClick={() => pickRequest(r)} style={row}
                      onMouseEnter={e => e.currentTarget.style.background = BORDER + "33"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontSize: ".82rem", color: INK }}>{r.name || "—"}</div>
                      <div style={{ fontSize: ".7rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.email || r.items || ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
