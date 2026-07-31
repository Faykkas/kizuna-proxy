// @ts-nocheck
"use client";
// app/components/admin/CustomersTab.tsx
//
// Orders don't point at a "customers" table — most were typed in by hand
// from Reddit/Discord DMs long before anyone had an account, so a person
// is only ever identified by their name and email on each order. This tab
// groups orders by that identity (email first, name as a fallback) so you
// can see what one person has spent and ordered without hunting through
// the order list by hand.

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { formatJPY } from "../../lib/orderStatus";

// Names used as a placeholder for several different, unrelated people —
// grouping by name would silently merge strangers into one "customer".
const GENERIC_NAMES = new Set(["multi"]);

function customerKey(o) {
  const email = (o.client_email || "").trim().toLowerCase();
  if (email) return `e:${email}`;
  const name = (o.client_name || "").trim().toLowerCase();
  if (!name || GENERIC_NAMES.has(name)) return `o:${o.id}`;
  return `n:${name}`;
}

export default function CustomersTab({ tokens }) {
  const { BG, SURFACE, SURFACE2, BORDER, RED, VIOLET, ALERT, INK, MUTED, PIXEL, BODY } = tokens;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("purchase_date", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const key = customerKey(o);
      if (!map.has(key)) map.set(key, { key, name: "", email: "", hasAccount: false, orders: [] });
      const c = map.get(key);
      c.orders.push(o);
      // Later fields win — orders are already sorted newest first, so this
      // keeps the most recent name/email if someone's details changed.
      if (o.client_name && !c.name) c.name = o.client_name;
      if (o.client_email && !c.email) c.email = o.client_email;
      if (o.customer_id) c.hasAccount = true;
    });

    // "Spent" is what the customer paid in total (item + fee) — the item
    // price just passes through what we paid to buy it, it isn't ours.
    // "Fees" is the service fee alone: the actual revenue we earned.
    return [...map.values()].map(c => {
      const totalSpent = c.orders.reduce(
        (s, o) => s + (o.item_price_jpy || 0) + (o.service_fee_jpy || 0), 0
      );
      const totalFees = c.orders.reduce((s, o) => s + (o.service_fee_jpy || 0), 0);
      const outstanding = c.orders
        .filter(o => !o.shipping_paid && (o.shipping_cost_jpy || 0) > 0)
        .reduce((s, o) => s + o.shipping_cost_jpy, 0);
      const dates = c.orders.map(o => o.purchase_date).filter(Boolean).sort();
      return {
        ...c,
        orderCount: c.orders.length,
        totalSpent,
        totalFees,
        outstanding,
        firstOrder: dates[0] || null,
        lastOrder: dates[dates.length - 1] || null,
      };
    }).sort((a, b) => b.totalFees - a.totalFees);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const selected = customers.find(c => c.key === selectedKey);
  const totalFeesAcrossAll = customers.reduce((s, c) => s + c.totalFees, 0);
  const repeatCount = customers.filter(c => c.orderCount > 1).length;

  const th = { fontSize: ".68rem", fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: MUTED, padding: "0 .4rem", fontFamily: BODY };

  return (
    <div>
      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "1.5rem" }}>
        {[
          { label: "Customers", value: customers.length, color: INK },
          { label: "Total fees earned (JPY)", value: `¥${totalFeesAcrossAll.toLocaleString()}`, color: RED },
          { label: "Repeat customers", value: repeatCount, color: VIOLET },
        ].map(s => (
          <div key={s.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 600, color: s.color, fontFamily: BODY, lineHeight: 1.3 }}>{s.value}</div>
            <div style={{ fontSize: ".72rem", color: MUTED, fontWeight: 500, marginTop: ".35rem", fontFamily: BODY }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          style={{ flex: 1, minWidth: "200px", padding: ".6rem 1rem", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: INK, fontSize: ".85rem", fontFamily: BODY }}
          placeholder="Search a customer by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ padding: ".6rem 1rem", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", fontSize: ".75rem", color: MUTED, display: "flex", alignItems: "center" }}>
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Customers table ── */}
      {loading ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>No customers found.</p>
      ) : (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 65px 100px 100px 90px 100px", gap: 0, padding: ".6rem 1rem", background: BG, borderBottom: `1px solid ${BORDER}` }}>
            {["Client", "Orders", "Spent", "Our fees", "Last order", ""].map(h => (
              <div key={h} style={th}>{h}</div>
            ))}
          </div>
          {filtered.map((c, i) => (
            <div key={c.key}
              onClick={() => setSelectedKey(c.key)}
              style={{ display: "grid", gridTemplateColumns: "1.2fr 65px 100px 100px 90px 100px", gap: 0, padding: ".65rem 1rem", background: i % 2 === 0 ? SURFACE : BG, borderBottom: `1px solid ${BORDER}`, alignItems: "center", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE2}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? SURFACE : BG}>
              <div style={{ padding: "0 .4rem", overflow: "hidden" }}>
                <div style={{ fontWeight: 500, color: INK, fontSize: ".8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.name || "Unknown"}
                  {c.hasAccount && <span title="Has an account" style={{ marginLeft: ".4rem", color: VIOLET, fontSize: ".7rem" }}>●</span>}
                </div>
                <div style={{ fontSize: ".62rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email || "no email"}</div>
              </div>
              <div style={{ padding: "0 .4rem", color: INK, fontSize: ".78rem" }}>{c.orderCount}</div>
              <div style={{ padding: "0 .4rem", color: MUTED, fontSize: ".78rem" }}>¥{c.totalSpent.toLocaleString()}</div>
              <div style={{ padding: "0 .4rem", color: RED, fontWeight: 500, fontSize: ".78rem" }}>¥{c.totalFees.toLocaleString()}</div>
              <div style={{ padding: "0 .4rem", color: MUTED, fontSize: ".72rem" }}>
                {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : "—"}
              </div>
              <div style={{ padding: "0 .4rem" }}>
                {c.outstanding > 0 && (
                  <span style={{ fontSize: ".68rem", fontWeight: 600, fontFamily: BODY, color: ALERT, background: `${ALERT}22`, padding: ".3rem .55rem", borderRadius: "6px", whiteSpace: "nowrap" }}>
                    ⚠ ¥{c.outstanding.toLocaleString()} due
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Customer detail ── */}
      {selected && (
        <div className="adm-modal" onClick={e => e.target === e.currentTarget && setSelectedKey(null)}>
          <div className="adm-panel">
            <header className="adm-panel-head">
              <div>
                <span className="adm-ref">{selected.orderCount} ORDER{selected.orderCount !== 1 ? "S" : ""}</span>
                <h2>{selected.name || "Unknown"}</h2>
              </div>
              <button className="adm-close" onClick={() => setSelectedKey(null)}>×</button>
            </header>

            <div className="adm-body">
              <section className="adm-block">
                <label className="adm-label">CONTACT</label>
                {selected.email ? (
                  <a
                    href={`mailto:${selected.email}?subject=Kizuna Proxy&body=Hi ${selected.name},%0A%0A`}
                    style={{ color: RED, fontSize: ".82rem", textDecoration: "none" }}
                  >
                    ✉ {selected.email}
                  </a>
                ) : (
                  <span style={{ color: MUTED, fontSize: ".82rem" }}>No email on file</span>
                )}
                {selected.hasAccount && (
                  <p className="adm-hint" style={{ color: VIOLET }}>Has a Kizuna Proxy account</p>
                )}
              </section>

              <section className="adm-block">
                <label className="adm-label">TOTALS</label>
                <p className="adm-hint" style={{ marginTop: 0 }}>
                  “Spent” is what they paid us in total — “our fees” is what we actually earned, the rest just covers what we bought on their behalf.
                </p>
                <div className="adm-grid-2" style={{ marginBottom: ".6rem" }}>
                  <div>
                    <span className="adm-sublabel">Total spent</span>
                    <div style={{ fontSize: ".95rem", color: INK, fontFamily: PIXEL, lineHeight: 1.7 }}>{formatJPY(selected.totalSpent)}</div>
                  </div>
                  <div>
                    <span className="adm-sublabel">Our fees</span>
                    <div style={{ fontSize: ".95rem", color: RED, fontFamily: PIXEL, lineHeight: 1.7 }}>{formatJPY(selected.totalFees)}</div>
                  </div>
                </div>
                <div className="adm-grid-2">
                  <div>
                    <span className="adm-sublabel">Shipping due</span>
                    <div style={{ fontSize: ".95rem", color: selected.outstanding > 0 ? ALERT : INK, fontFamily: PIXEL, lineHeight: 1.7 }}>{formatJPY(selected.outstanding)}</div>
                  </div>
                  <div>
                    <span className="adm-sublabel">First order</span>
                    <div style={{ fontSize: ".82rem", color: INK, marginTop: ".3rem" }}>
                      {selected.firstOrder ? new Date(selected.firstOrder).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="adm-block">
                <label className="adm-label">ORDER HISTORY</label>
                <div className="adm-ship-orders">
                  {selected.orders.map(o => (
                    <div key={o.id} className="adm-ship-order-row">
                      <div>
                        <span className="adm-ship-order-ref">{o.public_ref || `#${o.id}`} · {o.status}</span>
                        <span className="adm-ship-order-items">{o.items || "—"}</span>
                      </div>
                      <div className="adm-ship-order-right">
                        <span>{formatJPY((o.item_price_jpy || 0) + (o.service_fee_jpy || 0))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="adm-panel-foot">
              <button className="adm-btn" onClick={() => setSelectedKey(null)}>CLOSE</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
