// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const TYPE_OPTIONS = [
  { value: "event",       label: "🎌 Event",      color: "#b82a24" },
  { value: "available",   label: "✅ Available",   color: "#3a7d44" },
  { value: "unavailable", label: "⛔ Unavailable", color: "#8a7f74" },
];

const empty = { title: "", date: "", type: "event", description: "", store: "" };

export default function AdminPage() {
  const [session, setSession]  = useState(null);
  const [email, setEmail]      = useState("");
  const [pw, setPw]            = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading]  = useState(true);
  const [events, setEvents]    = useState([]);
  const [form, setForm]        = useState(empty);
  const [editing, setEditing]  = useState(null);
  const [saving, setSaving]    = useState(false);
  const [msg, setMsg]          = useState("");

  // Check existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadEvents(); }, [session]);

  async function login() {
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setLoginErr(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*").order("date");
    setEvents(data || []);
  }

  async function save() {
    if (!form.title || !form.date || !form.type) { setMsg("Please fill title, date and type."); return; }
    setSaving(true);
    const payload = { title: form.title, date: form.date, type: form.type, description: form.description, store: form.store };
    if (editing) {
      await supabase.from("events").update(payload).eq("id", editing);
    } else {
      await supabase.from("events").insert(payload);
    }
    setSaving(false);
    setForm(empty);
    setEditing(null);
    setMsg(editing ? "✓ Event updated." : "✓ Event added.");
    setTimeout(() => setMsg(""), 3000);
    loadEvents();
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  }

  function startEdit(ev) {
    setEditing(ev.id);
    setForm({ title: ev.title, date: ev.date, type: ev.type, description: ev.description || "", store: ev.store || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── LOADING ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <p style={{ color: "var(--warm)", fontSize: ".85rem" }}>Loading…</p>
    </div>
  );

  // ── LOGIN ──
  if (!session) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", padding: "2.5rem", width: "100%", maxWidth: "360px", boxShadow: "0 8px 32px rgba(13,11,9,.08)" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".3rem" }}>
          <span style={{ color: "var(--red)" }}>Kizuna</span> Admin
        </div>
        <p style={{ fontSize: ".8rem", color: "var(--warm)", marginBottom: "1.5rem" }}>Sign in to manage your calendar</p>
        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="contact@kizunaproxy.com" style={{ ...inp, marginBottom: ".75rem" }} autoFocus />
        <label style={lbl}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="••••••••" style={{ ...inp, marginBottom: ".5rem", borderColor: loginErr ? "var(--red)" : undefined }} />
        {loginErr && <p style={{ fontSize: ".72rem", color: "var(--red)", marginBottom: ".5rem" }}>{loginErr}</p>}
        <button onClick={login} style={{ ...btnPrimary, width: "100%", marginTop: ".5rem" }}>Sign in</button>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
              <span style={{ color: "var(--red)" }}>Kizuna</span> Admin
            </h1>
            <p style={{ fontSize: ".8rem", color: "var(--warm)" }}>Calendar management</p>
          </div>
          <div style={{ display: "flex", gap: ".75rem" }}>
            <a href="/" style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warm)", textDecoration: "none", alignSelf: "center" }}>← Site</a>
            <button onClick={logout} style={btnGhost}>Sign out</button>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", marginBottom: "1.2rem", fontWeight: 500 }}>
            {editing ? "✏️ Edit event" : "➕ Add new event"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div><label style={lbl}>Title *</label><input style={inp} placeholder="Pokémon Center — Spring Set" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label style={lbl}>Date *</label><input style={inp} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={lbl}>Type *</label>
              <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Store / Location</label><input style={inp} placeholder="Pokémon Center Tokyo…" value={form.store} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: "80px" }} placeholder="Details about this event…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          {msg && <p style={{ fontSize: ".78rem", color: msg.startsWith("✓") ? "#3a7d44" : "var(--red)", marginBottom: ".75rem" }}>{msg}</p>}
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? "Saving…" : editing ? "Update event" : "Add event"}</button>
            {editing && <button onClick={() => { setEditing(null); setForm(empty); }} style={btnGhost}>Cancel</button>}
          </div>
        </div>

        {/* Events list */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--warm)", fontWeight: 500, margin: 0 }}>All events ({events.length})</p>
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
                <span style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", background: TYPE_OPTIONS.find(t => t.value === ev.type)?.color, padding: ".2rem .6rem", borderRadius: "1px" }}>{ev.type}</span>
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

const lbl = { fontSize: ".63rem", letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--warm)", display: "block", marginBottom: ".4rem" };
const inp = { width: "100%", padding: ".7rem 1rem", border: "1px solid var(--border)", borderRadius: "1px", fontSize: ".88rem", fontFamily: "'Jost',sans-serif", background: "var(--cream)", color: "var(--ink)", outline: "none", boxSizing: "border-box" as const };
const btnPrimary = { background: "var(--ink)", color: "#fff", border: "none", padding: ".6rem 1.4rem", borderRadius: "1px", fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase" as const, fontFamily: "'Jost',sans-serif", cursor: "pointer", fontWeight: 500 };
const btnGhost = { background: "transparent", color: "var(--warm)", border: "1px solid var(--border)", padding: ".6rem 1.2rem", borderRadius: "1px", fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase" as const, fontFamily: "'Jost',sans-serif", cursor: "pointer" };
const btnSmall = { border: "1px solid var(--border)", padding: ".3rem .7rem", borderRadius: "1px", fontSize: ".68rem", fontFamily: "'Jost',sans-serif", cursor: "pointer", color: "var(--ink)" };
