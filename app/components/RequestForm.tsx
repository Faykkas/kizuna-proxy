// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import Maneki from "./pixel/Maneki";

// ─── REQUEST FORM ────────────────────────────────────────────────────────────
const FORMSPREE_ID = "https://formspree.io/f/mnjoypyk";
const emptyForm = { name: "", email: "", contact: "", platform: "", itemLink: "", country: "", message: "" };

export default function RequestForm({ t }) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const r = t.request;

  // A signed-in customer should not retype what we already know
  useEffect(() => {
    if (!user) return;
    setForm(p => ({
      ...p,
      name:  p.name  || profile?.full_name || "",
      email: p.email || user.email || "",
    }));
  }, [user, profile]);

  function update(k, v) { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); }
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = r.errName;
    if (!form.email.trim()) e.email = r.errEmail;
    else if (!form.email.includes("@")) e.email = r.errEmailInvalid;
    if (!form.contact.trim()) e.contact = r.errContact;
    if (!form.country.trim()) e.country = r.errCountry;
    if (!form.message.trim()) e.message = r.errMessage;
    setErrors(e); return Object.keys(e).length === 0;
  }
  async function handleSubmit() {
    if (!validate()) return;
    setStatus("sending");

    // The request goes into the database, where it appears in the admin with
    // a badge and can be turned into an order in one click.
    const items = [
      form.message,
      form.itemLink ? `\n\nLink: ${form.itemLink}` : "",
      form.platform ? `\nPlatform: ${form.platform}` : "",
    ].join("");

    const { error } = await supabase.from("requests").insert({
      customer_id: user?.id || null,
      name: form.name,
      email: form.email,
      country: form.country,
      items,
      notes: form.contact ? `Preferred contact: ${form.contact}` : null,
      status: "new",
    });

    if (!error) {
      setStatus("success");
      setForm(emptyForm);
      return;
    }

    // Database unreachable — fall back to Formspree so a request is never lost
    console.error("Request insert failed, falling back to Formspree:", error);
    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, contact: form.contact, platform: form.platform, item_link: form.itemLink, country: form.country, message: form.message }),
      });
      if (res.ok) { setStatus("success"); setForm(emptyForm); } else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "success") return (
    <div className="req-form" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"320px", gap:"1rem", textAlign:"center" }}>
      <Maneki state="success" size={90} float />
      <p style={{ fontFamily:"var(--font-pixel)", fontSize:".7rem", color:"var(--ink)", lineHeight:1.9 }}>{r.successTitle}</p>
      <p style={{ fontSize:".9rem", color:"var(--warm)", fontWeight:300 }}>{r.successDesc}</p>
      {user ? (
        <a href="/account" className="btn btn-gold">SEE IT IN MY ACCOUNT</a>
      ) : (
        <a href="/account/login" className="btn btn-gold">CREATE AN ACCOUNT TO TRACK IT</a>
      )}
      <button className="btn btn-outline" onClick={() => setStatus("idle")}>{r.successBtn}</button>
    </div>
  );

  return (
    <div className="req-form">
      <div className="f-row">
        <div className="f-field"><label>{r.fieldName}</label><input type="text" value={form.name} onChange={e => update("name", e.target.value)} />{errors.name && <span className="f-err">{errors.name}</span>}</div>
        <div className="f-field"><label>{r.fieldEmail}</label><input type="email" value={form.email} onChange={e => update("email", e.target.value)} />{errors.email && <span className="f-err">{errors.email}</span>}</div>
      </div>
      <div className="f-field"><label>{r.fieldContact} <span style={{textTransform:"none",letterSpacing:0,fontSize:".62rem",color:"var(--warm)"}}>{r.fieldContactHint}</span></label><input type="text" placeholder={r.fieldContactPlaceholder} value={form.contact} onChange={e => update("contact", e.target.value)} />{errors.contact && <span className="f-err">{errors.contact}</span>}</div>
      <div className="f-row">
        <div className="f-field"><label>{r.fieldPlatform}</label><input type="text" placeholder={r.fieldPlatformPlaceholder} value={form.platform} onChange={e => update("platform", e.target.value)} /></div>
        <div className="f-field"><label>{r.fieldLink}</label><input type="text" placeholder="https://…" value={form.itemLink} onChange={e => update("itemLink", e.target.value)} /></div>
      </div>
      <div className="f-field"><label>{r.fieldCountry}</label><input type="text" placeholder={r.fieldCountryPlaceholder} value={form.country} onChange={e => update("country", e.target.value)} />{errors.country && <span className="f-err">{errors.country}</span>}</div>
      <div className="f-field"><label>{r.fieldMessage}</label><textarea rows={6} placeholder={r.fieldMessagePlaceholder} value={form.message} onChange={e => update("message", e.target.value)} />{errors.message && <span className="f-err">{errors.message}</span>}</div>
      {status === "error" && <p style={{fontSize:".78rem",color:"var(--red)",marginBottom:".5rem"}}>{r.errorMsg}</p>}
      <div className="f-actions">
        <span className="f-note">{r.footNote}</span>
        <button className="btn btn-gold" onClick={handleSubmit} disabled={status === "sending"}>{status === "sending" ? r.sending : r.submit}</button>
      </div>
    </div>
  );
}
