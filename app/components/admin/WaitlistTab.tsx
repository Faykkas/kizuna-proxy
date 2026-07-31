// @ts-nocheck
"use client";
// app/components/admin/WaitlistTab.tsx
//
// Everyone who left their email on the Kizuna Box "coming soon" page.
// Read-only besides delete — there's nothing to action here yet, just a
// list to watch grow and to export when the box is ready to announce.

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export default function WaitlistTab({ tokens }) {
  const { BG, SURFACE, BORDER, RED, ALERT, INK, MUTED, PIXEL, BODY } = tokens;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("box_waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-box-waitlist")
      .on("postgres_changes", { event: "*", schema: "public", table: "box_waitlist" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => e.email.toLowerCase().includes(q));
  }, [entries, search]);

  async function del(id) {
    if (!confirm("Remove this signup?")) return;
    await supabase.from("box_waitlist").delete().eq("id", id);
    load();
  }

  function copyAll() {
    navigator.clipboard?.writeText(filtered.map(e => e.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ fontFamily: BODY }}>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(1,1fr)", gap: "12px", marginBottom: "1.5rem", maxWidth: "220px" }}>
        <div style={{ background: SURFACE, border: `2px solid ${BORDER}`, borderRadius: "12px", padding: "1.1rem 1.2rem", boxShadow: "0 4px 0 rgba(0,0,0,.3)" }}>
          <div style={{ fontSize: ".85rem", color: RED, fontFamily: PIXEL, lineHeight: 1.7 }}>{entries.length}</div>
          <div style={{ fontSize: ".36rem", color: MUTED, letterSpacing: ".08em", marginTop: ".45rem", fontFamily: PIXEL, lineHeight: 1.9 }}>SIGNUPS</div>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          style={{ flex: 1, minWidth: "200px", padding: ".6rem 1rem", background: SURFACE, border: `2px solid ${BORDER}`, borderRadius: "8px", color: INK, fontSize: ".85rem", fontFamily: BODY }}
          placeholder="🔍 Search by email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {filtered.length > 0 && (
          <button onClick={copyAll} style={{
            background: "transparent", color: MUTED, border: `2px solid ${BORDER}`,
            padding: ".6rem 1rem", borderRadius: "8px", fontFamily: PIXEL,
            fontSize: ".42rem", cursor: "pointer", lineHeight: 1.8, whiteSpace: "nowrap",
          }}>
            {copied ? "COPIED ✓" : "COPY EMAILS"}
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{
          background: SURFACE, border: `2px dashed ${BORDER}`, borderRadius: "12px",
          padding: "3rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ fontFamily: PIXEL, fontSize: ".48rem", color: MUTED, lineHeight: 1.9 }}>
            {entries.length === 0 ? "No signups yet." : "No match."}
          </p>
        </div>
      ) : (
        <div style={{ border: `2px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden" }}>
          {filtered.map((e, i) => (
            <div key={e.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
              padding: ".85rem 1.1rem", background: i % 2 === 0 ? SURFACE : BG,
              borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <a href={`mailto:${e.email}`} style={{ fontSize: ".85rem", color: INK, textDecoration: "none" }}>
                {e.email}
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: ".9rem" }}>
                <span style={{ fontFamily: PIXEL, fontSize: ".36rem", color: MUTED, lineHeight: 1.9, whiteSpace: "nowrap" }}>
                  {new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <button onClick={() => del(e.id)} title="Remove" style={{
                  background: "transparent", color: ALERT, border: "none",
                  cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: ".2rem",
                }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
