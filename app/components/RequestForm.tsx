// @ts-nocheck
"use client";
// app/components/RequestForm.tsx
//
// Three required fields instead of five. Every mandatory field costs
// visitors, and to answer a request we only need: what they want, where it
// ships, and how to reach them. The rest belongs in the conversation.

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import Maneki from "./pixel/Maneki";

const FORMSPREE_ID = "https://formspree.io/f/mnjoypyk";

// Splits a "...{email}...{phone}..." translation on its tokens and swaps
// each one for the matching clickable link, so the sentence around them
// stays translatable while the contact details stay real anchors.
function renderContactAlt(template) {
  return template.split(/(\{email\}|\{phone\})/g).map((part, i) => {
    if (part === "{email}") {
      return <a key={i} href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a>;
    }
    if (part === "{phone}") {
      return <a key={i} href="https://wa.me/819044595568" target="_blank" rel="noopener noreferrer">+81 90 4459 5568</a>;
    }
    return part;
  });
}

const emptyForm = {
  message: "",
  email: "",
  country: "",
  // optional
  name: "",
  contact: "",
  itemLink: "",
  budget: "",
};

export default function RequestForm({ t }) {
  const rt = t?.request || {};
  const { user, profile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [showMore, setShowMore] = useState(false);

  // A signed-in customer should not retype what we already know
  useEffect(() => {
    if (!user) return;
    setForm(p => ({
      ...p,
      name: p.name || profile?.full_name || "",
      email: p.email || user.email || "",
    }));
  }, [user, profile]);

  function update(k, v) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.message.trim()) e.message = "Tell us what you're looking for.";
    if (!form.email.trim()) e.email = "We need an email to reply.";
    else if (!form.email.includes("@")) e.email = "That email looks wrong.";
    if (!form.country.trim()) e.country = "Where should we ship it?";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStatus("sending");

    const items = [
      form.message,
      form.itemLink ? `\n\nLink: ${form.itemLink}` : "",
      form.budget ? `\nBudget: ${form.budget}` : "",
    ].join("");

    const { error } = await supabase.from("requests").insert({
      customer_id: user?.id || null,
      name: form.name || form.email.split("@")[0],
      email: form.email,
      country: form.country,
      items,
      budget: form.budget || null,
      notes: form.contact ? `Prefers: ${form.contact}` : null,
      status: "new",
    });

    if (!error) {
      track("request_submitted", { country: form.country });
      fetch("/api/notify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          country: form.country,
          items,
          budget: form.budget,
          contact: form.contact,
        }),
      }).catch(err => console.error("notify-request failed:", err));
      setStatus("success");
      setForm(emptyForm);
      return;
    }

    // Database unreachable — fall back to email so nothing is lost
    console.error("Request insert failed, using Formspree:", error);
    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form }),
      });
      if (res.ok) {
        track("request_submitted", { country: form.country, fallback: true });
        setStatus("success");
        setForm(emptyForm);
      }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "success") {
    return (
      <div className="req-form req-success">
        <Maneki state="success" size={90} float />
        <p className="req-success-title">GOT IT</p>
        <p className="req-success-desc">
          We&apos;ll reply within 24 hours with a quote. Check your inbox.
        </p>
        <p className="req-note">
          {renderContactAlt(rt.contactAlt || "You can also reach us directly at {email} or by phone at {phone}.")}
        </p>
        {user ? (
          <a href="/account" className="btn btn-gold">SEE IT IN MY ACCOUNT</a>
        ) : (
          <a href="/account/login" className="btn btn-gold">CREATE AN ACCOUNT TO TRACK IT</a>
        )}
        <button className="btn btn-outline" onClick={() => setStatus("idle")}>
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <div className="req-form">

      {/* The important one first: what do you want? */}
      <div className="f-field">
        <label htmlFor="req-what">What are you looking for?</label>
        <textarea
          id="req-what"
          rows={4}
          placeholder="A link, a description, or just tell us — &quot;the new Pikachu plush from Pokémon Center&quot; works fine."
          value={form.message}
          onChange={e => update("message", e.target.value)}
        />
        {errors.message && <span className="f-err">{errors.message}</span>}
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="req-email">Your email</label>
          <input
            id="req-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <span className="f-err">{errors.email}</span>}
        </div>

        <div className="f-field">
          <label htmlFor="req-country">Ship to</label>
          <input
            id="req-country"
            type="text"
            placeholder="France, USA, Australia…"
            value={form.country}
            onChange={e => update("country", e.target.value)}
            autoComplete="country-name"
          />
          {errors.country && <span className="f-err">{errors.country}</span>}
        </div>
      </div>

      {/* Everything else is optional and folded away */}
      <button
        type="button"
        className="req-more-toggle"
        onClick={() => setShowMore(v => !v)}
        aria-expanded={showMore}
      >
        {showMore ? "− LESS" : "+ ADD MORE DETAILS (OPTIONAL)"}
      </button>

      {showMore && (
        <div className="req-more">
          <div className="f-row">
            <div className="f-field">
              <label htmlFor="req-name">Your name</label>
              <input
                id="req-name"
                type="text"
                placeholder="How should we call you?"
                value={form.name}
                onChange={e => update("name", e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="f-field">
              <label htmlFor="req-budget">Budget</label>
              <input
                id="req-budget"
                type="text"
                placeholder="¥10,000 · €80 · flexible"
                value={form.budget}
                onChange={e => update("budget", e.target.value)}
              />
            </div>
          </div>

          <div className="f-field">
            <label htmlFor="req-link">Link to the item</label>
            <input
              id="req-link"
              type="text"
              placeholder="https://jp.mercari.com/…"
              value={form.itemLink}
              onChange={e => update("itemLink", e.target.value)}
            />
          </div>

          <div className="f-field">
            <label htmlFor="req-contact">Prefer another way to talk?</label>
            <input
              id="req-contact"
              type="text"
              placeholder="Discord, WhatsApp, Instagram…"
              value={form.contact}
              onChange={e => update("contact", e.target.value)}
            />
          </div>
        </div>
      )}

      {status === "error" && (
        <p className="f-err req-error">
          Something went wrong. Email us at contact@kizunaproxy.com and we&apos;ll sort it out.
        </p>
      )}

      <button
        className="btn btn-gold req-submit"
        onClick={handleSubmit}
        disabled={status === "sending"}
      >
        {status === "sending" ? "SENDING…" : "SEND REQUEST"}
      </button>

      <p className="req-note">
        Free quote, no commitment. We reply within 24 hours.
      </p>
    </div>
  );
}
