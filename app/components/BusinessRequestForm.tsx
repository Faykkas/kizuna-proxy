// @ts-nocheck
"use client";
// app/components/BusinessRequestForm.tsx
//
// The B2B counterpart to RequestForm.tsx — same Supabase table (`requests`,
// with lead_type:"business" plus a handful of business-only nullable
// columns), same notify-request email pipe, but its own fields and its
// own validation, kept as a separate component per the request that
// business leads not be mixed into the consumer form's UI/logic.

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { supabase } from "../lib/supabase";

const BUSINESS_TYPES = [
  "K-pop / entertainment retailer",
  "Anime & manga reseller",
  "Card & collectibles shop",
  "Japanese fashion reseller",
  "E-commerce seller (Shopify, eBay, marketplace)",
  "Group-order manager",
  "Other",
];

const DISCOVERY_OPTIONS = [
  "Google",
  "Reddit advertisement",
  "Reddit post or comment",
  "Facebook or Instagram advertisement",
  "Facebook or Instagram post",
  "Recommendation",
  "Other",
];

const emptyForm = {
  contactName: "",
  businessName: "",
  businessWebsite: "",
  email: "",
  country: "",
  businessType: "",
  productCategory: "",
  itemLinks: "",
  quantity: "",
  budget: "",
  deadline: "",
  alternatives: "",
  partialOk: "",
  recurringSourcing: "",
  contactPlatform: "",
  additionalDetails: "",
  discoverySource: "",
  // honeypot — real visitors never see or fill this field
  company_website: "",
};

// Snake_case to match the `requests` table columns directly (spread as-is
// into the Supabase insert below).
function readUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || null,
    utm_medium: p.get("utm_medium") || null,
    utm_campaign: p.get("utm_campaign") || null,
    utm_content: p.get("utm_content") || null,
    utm_term: p.get("utm_term") || null,
  };
}

export default function BusinessRequestForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [startedTracked, setStartedTracked] = useState(false);
  const mountedAt = useRef(Date.now());
  const utm = useRef({});

  useEffect(() => { utm.current = readUtm(); }, []);

  function update(k, v) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
    if (!startedTracked && k !== "company_website") {
      setStartedTracked(true);
      track("business_quote_form_start");
    }
  }

  function validate() {
    const e = {};
    if (!form.contactName.trim()) e.contactName = "Contact name is required.";
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!form.email.trim()) e.email = "We need an email to reply.";
    else if (!form.email.includes("@")) e.email = "That email looks wrong.";
    if (!form.country.trim()) e.country = "Where are you shipping to?";
    if (!form.productCategory.trim() && !form.itemLinks.trim() && !form.additionalDetails.trim()) {
      e.productCategory = "Tell us what you're sourcing — a category, a link, or a few details.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    // Honeypot: a hidden field only a bot would fill in.
    if (form.company_website) { setStatus("success"); return; }
    // Time-trap: a real person needs at least a couple of seconds to read
    // and fill this form; a script that submits instantly is almost
    // certainly spam.
    if (Date.now() - mountedAt.current < 2500) { setStatus("success"); return; }

    if (!validate()) return;
    setStatus("sending");

    const items = [
      form.additionalDetails,
      form.itemLinks ? `\n\nLinks: ${form.itemLinks}` : "",
    ].join("");

    const { error } = await supabase.from("requests").insert({
      lead_type: "business",
      name: form.contactName,
      email: form.email,
      country: form.country,
      items,
      budget: form.budget || null,
      notes: form.alternatives ? `Accepted alternatives: ${form.alternatives}` : null,
      status: "new",
      quantity: form.quantity || null,
      deadline: form.deadline || null,
      partial_ok: form.partialOk === "yes",
      business_name: form.businessName,
      business_website: form.businessWebsite || null,
      business_type: form.businessType || null,
      product_category: form.productCategory || null,
      recurring_sourcing: form.recurringSourcing || null,
      contact_platform: form.contactPlatform || null,
      discovery_source: form.discoverySource || null,
      ...utm.current,
    });

    if (!error) {
      track("business_quote_form_submit", { country: form.country, businessType: form.businessType || undefined });
      fetch("/api/notify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "business",
          name: form.contactName,
          email: form.email,
          country: form.country,
          items,
          budget: form.budget,
          quantity: form.quantity,
          deadline: form.deadline,
          partialOk: form.partialOk === "yes",
          businessName: form.businessName,
          businessWebsite: form.businessWebsite,
          businessType: form.businessType,
          productCategory: form.productCategory,
          recurringSourcing: form.recurringSourcing,
          contactPlatform: form.contactPlatform,
          discoverySource: form.discoverySource,
          utmSource: utm.current.utm_source,
          utmMedium: utm.current.utm_medium,
          utmCampaign: utm.current.utm_campaign,
          utmContent: utm.current.utm_content,
          utmTerm: utm.current.utm_term,
        }),
      }).catch(err => console.error("notify-request failed:", err));
      setStatus("success");
      setForm(emptyForm);
      return;
    }

    console.error("Business request insert failed:", error);
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div className="req-form req-success">
        <p className="req-success-title">GOT IT</p>
        <p className="req-success-desc">
          Thank you. We will review your sourcing request and contact you with the next steps.
        </p>
        <button className="btn btn-outline" onClick={() => setStatus("idle")}>
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <div className="req-form">
      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-contact-name">Contact name</label>
          <input id="bs-contact-name" type="text" value={form.contactName} onChange={e => update("contactName", e.target.value)} />
          {errors.contactName && <span className="f-err">{errors.contactName}</span>}
        </div>
        <div className="f-field">
          <label htmlFor="bs-business-name">Business name</label>
          <input id="bs-business-name" type="text" value={form.businessName} onChange={e => update("businessName", e.target.value)} />
          {errors.businessName && <span className="f-err">{errors.businessName}</span>}
        </div>
      </div>

      <div className="f-field">
        <label htmlFor="bs-website">Business website or marketplace profile</label>
        <input id="bs-website" type="text" placeholder="https://… or a Shopify/eBay/marketplace store link" value={form.businessWebsite} onChange={e => update("businessWebsite", e.target.value)} />
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-email">Business email</label>
          <input id="bs-email" type="email" value={form.email} onChange={e => update("email", e.target.value)} autoComplete="email" />
          {errors.email && <span className="f-err">{errors.email}</span>}
        </div>
        <div className="f-field">
          <label htmlFor="bs-country">Country</label>
          <input id="bs-country" type="text" placeholder="France, USA, Australia…" value={form.country} onChange={e => update("country", e.target.value)} autoComplete="country-name" />
          {errors.country && <span className="f-err">{errors.country}</span>}
        </div>
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-type">Type of business</label>
          <select id="bs-type" value={form.businessType} onChange={e => update("businessType", e.target.value)}>
            <option value="">Select…</option>
            {BUSINESS_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="f-field">
          <label htmlFor="bs-category">Product category</label>
          <input id="bs-category" type="text" placeholder="Pokémon cards, streetwear, figures…" value={form.productCategory} onChange={e => update("productCategory", e.target.value)} />
          {errors.productCategory && <span className="f-err">{errors.productCategory}</span>}
        </div>
      </div>

      <div className="f-field">
        <label htmlFor="bs-links">Official event, store or product links</label>
        <input id="bs-links" type="text" placeholder="https://…" value={form.itemLinks} onChange={e => update("itemLinks", e.target.value)} />
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-quantity">Desired quantities</label>
          <input id="bs-quantity" type="text" placeholder="e.g. 50 units" value={form.quantity} onChange={e => update("quantity", e.target.value)} />
        </div>
        <div className="f-field">
          <label htmlFor="bs-budget">Merchandise budget</label>
          <input id="bs-budget" type="text" placeholder="¥50,000 · $500 · flexible" value={form.budget} onChange={e => update("budget", e.target.value)} />
        </div>
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-deadline">Target date or deadline</label>
          <input id="bs-deadline" type="date" value={form.deadline} onChange={e => update("deadline", e.target.value)} />
        </div>
        <div className="f-field">
          <label htmlFor="bs-alternatives">Accepted alternatives</label>
          <input id="bs-alternatives" type="text" placeholder="Substitute colors, sizes, similar items…" value={form.alternatives} onChange={e => update("alternatives", e.target.value)} />
        </div>
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-partial">Partial fulfilment accepted</label>
          <select id="bs-partial" value={form.partialOk} onChange={e => update("partialOk", e.target.value)}>
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="f-field">
          <label htmlFor="bs-recurring">Recurring sourcing required</label>
          <select id="bs-recurring" value={form.recurringSourcing} onChange={e => update("recurringSourcing", e.target.value)}>
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="not_yet">Not yet</option>
          </select>
        </div>
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="bs-platform">Preferred live communication platform</label>
          <input id="bs-platform" type="text" placeholder="Email, WhatsApp, Discord…" value={form.contactPlatform} onChange={e => update("contactPlatform", e.target.value)} />
        </div>
        <div className="f-field">
          <label htmlFor="bs-discovery">How did you discover Kizuna Proxy?</label>
          <select id="bs-discovery" value={form.discoverySource} onChange={e => update("discoverySource", e.target.value)}>
            <option value="">Select…</option>
            {DISCOVERY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="f-field">
        <label htmlFor="bs-details">Additional details</label>
        <textarea id="bs-details" rows={4} placeholder="Anything else we should know about this request." value={form.additionalDetails} onChange={e => update("additionalDetails", e.target.value)} />
      </div>

      {/* Honeypot — hidden from real visitors via CSS, only a bot fills this in */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="bs-company-website">Website</label>
        <input id="bs-company-website" type="text" tabIndex={-1} autoComplete="off" value={form.company_website} onChange={e => update("company_website", e.target.value)} />
      </div>

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
        {status === "sending" ? "SENDING…" : "Request a Business Quote"}
      </button>
    </div>
  );
}
