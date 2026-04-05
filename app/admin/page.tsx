// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { CalendarEvent } from "../lib/supabase";

const TYPE_OPTIONS = [
  { value: "event",       label: "🎌 Event",       color: "#b82a24" },
  { value: "available",   label: "✅ Available",    color: "#3a7d44" },
  { value: "unavailable", label: "⛔ Unavailable",  color: "#8a7f74" },
];

const empty = { title: "", date: "", type: "event", description: "", store: "" };

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [pw, setPw]           = useState("");
  const [pwErr, setPwErr]     = useState(false);
  const [events, setEvents]   = useState<CalendarEvent[]>([]);
  const [form, setForm]       = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  // Simple client-side password check
  const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "kizuna2026";

  function login() {
    if (pw === ADMIN_PW) { setAuthed(true); setPwErr(false); }
    else { setPwErr(true); }
  }

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*").order("date");
    setEvents(data || []);
  }

  useEffect(() => { if (authed) loadEvents(); }, [authed]);

  async function save() {
    if (!form.title || !form.date || !form.type) { setMsg("Please fill title, date and type."); return; }
    setSaving(true);
    if (editing) {
      await supabase.from("events").update({
        title: form.title, date: form.date, type: form.type,
        description: form.description, store: form.store,
      }).eq("id", editing);
    } else {
      await supabase.from("events").insert({
        title: form.title, date: form.date, type: form.type,
        description: form.description, store: form.store,
      });
    }
    setSaving(false);
    setForm(empty);
    setEditing(null);
    setMsg(editing ? "✓ Event updated." : "✓ Event added.");
    setTimeout(() => setMsg(""), 3000);
    loadEvents();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  }

  function startEdit(ev: CalendarEvent) {
    setEditing(ev.id);
    setForm({ title: ev.title, date: ev.date, type: ev.type, description: ev.description || "", store: ev.store || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditing(null); setForm(empty); }

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", padding: "2.5rem", width: "100%", maxWidth: "360px", boxShadow: "0 8px 32px rgba(13,11,9,.08)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".3rem" }}>
            <span style={{ color: "var(--red)" }}>Kizuna</span> Admin
          </div>
          <p style={{ fontSize: ".8rem", color: "var(--warm)", marginBottom: "1.5rem" }}>Calendar management</p>
          <label style={{ fontSize: ".65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", display: "block", marginBottom: ".4rem" }}>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwErr(false); }}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Enter admin password"
            style={{ width: "100%", padding: ".7rem 1rem", border: `1px solid ${pwErr ? "var(--red)" : "var(--border)"}`, borderRadius: "1px", fontSize: ".9rem", fontFamily: "'Jost',sans-serif", background: "var(--cream)", color: "var(--ink)", outline: "none", marginBottom: ".5rem" }}
            autoFocus
          />
          {pwErr && <p style={{ fontSize: ".72rem", color: "var(--red)", marginBottom: ".5rem" }}>Incorrect password.</p>}
          <button onClick={login} style={{ width: "100%", background: "var(--ink)", color: "#fff", border: "none", padding: ".7rem", borderRadius: "1px", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif", cursor: "pointer", marginTop: ".5rem" }}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
              <span style={{ color: "var(--red)" }}>Kizuna</span> Admin
            </h1>
            <p style={{ fontSize: ".8rem", color: "var(--warm)" }}>Manage your calendar events</p>
          </div>
          <a href="/" style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warm)", textDecoration: "none" }}>← Back to site</a>
        </div>

        {/* Form */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", marginBottom: "1.2rem", fontWeight: 500 }}>
            {editing ? "✏️ Edit event" : "➕ Add new event"}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} placeholder="Pokémon Center — Spring Set" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Date *</label>
              <input style={inp} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={lbl}>Type *</label>
              <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Store / Location</label>
              <input style={inp} placeholder="Pokémon Center Tokyo, Shibuya…" value={form.store} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: "80px" }} placeholder="Exclusive spring card set, limited to 2 packs per person…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {msg && <p style={{ fontSize: ".78rem", color: "var(--red)", marginBottom: ".75rem" }}>{msg}</p>}

          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <button onClick={save} disabled={saving} style={btnPrimary}>
              {saving ? "Saving…" : editing ? "Update event" : "Add event"}
            </button>
            {editing && (
              <button onClick={cancelEdit} style={btnGhost}>Cancel</button>
            )}
          </div>
        </div>

        {/* Events list */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", fontWeight: 500, margin: 0 }}>
              All events ({events.length})
            </p>
          </div>
          {events.length === 0 ? (
            <p style={{ padding: "2rem", fontSize: ".85rem", color: "var(--warm)", textAlign: "center" }}>No events yet. Add your first one above.</p>
          ) : (
            events.map(ev => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: TYPE_OPTIONS.find(t => t.value === ev.type)?.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <strong style={{ fontSize: ".9rem", color: "var(--ink)", display: "block" }}>{ev.title}</strong>
                  {ev.store && <span style={{ fontSize: ".75rem", color: "var(--warm)" }}>📍 {ev.store}</span>}
                </div>
                <span style={{ fontSize: ".8rem", color: "var(--warm)", minWidth: "100px" }}>
                  {new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", background: TYPE_OPTIONS.find(t => t.value === ev.type)?.color, padding: ".2rem .6rem", borderRadius: "1px" }}>
                  {ev.type}
                </span>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button onClick={() => startEdit(ev)} style={{ ...btnSmall, background: "var(--cream)" }}>Edit</button>
                  <button onClick={() => deleteEvent(ev.id)} style={{ ...btnSmall, background: "#fee2e2", color: "#b91c1c" }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const lbl: any = { fontSize: ".63rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", display: "block", marginBottom: ".4rem" };
const inp: any = { width: "100%", padding: ".7rem 1rem", border: "1px solid var(--border)", borderRadius: "1px", fontSize: ".88rem", fontFamily: "'Jost',sans-serif", background: "var(--cream)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
const btnPrimary: any = { background: "var(--ink)", color: "#fff", border: "none", padding: ".6rem 1.4rem", borderRadius: "1px", fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif", cursor: "pointer", fontWeight: 500 };
const btnGhost: any = { background: "transparent", color: "var(--warm)", border: "1px solid var(--border)", padding: ".6rem 1.2rem", borderRadius: "1px", fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif", cursor: "pointer" };
const btnSmall: any = { border: "1px solid var(--border)", padding: ".3rem .7rem", borderRadius: "1px", fontSize: ".68rem", fontFamily: "'Jost',sans-serif", cursor: "pointer", color: "var(--ink)" };
