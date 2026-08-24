// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import PayLinkButton from "../../components/PayLinkButton";
import { formatJPY } from "../../lib/orderStatus";

export default function PayLinkClient({ token }) {
  const [link, setLink] = useState(null); // { label, amountJpy, status }
  const [error, setError] = useState("");
  const [paidJustNow, setPaidJustNow] = useState(false);

  useEffect(() => {
    fetch("/api/payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get", token }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Link not found"); return; }
        setLink(data);
      })
      .catch(() => setError("Could not load this payment link."));
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "var(--surface)", border: "1px solid var(--border-gold)", borderRadius: "14px", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: "var(--ink)", marginBottom: "1.75rem" }}>
          <span style={{ color: "var(--red)" }}>Kizuna</span> Proxy
        </div>

        {error && (
          <p style={{ fontSize: ".9rem", color: "var(--warm)", lineHeight: 1.7 }}>
            {error === "Link not found" ? "This payment link doesn't exist or has been removed." : error}
            <br /><br />
            Contact <a href="mailto:kizunaproxy@gmail.com" style={{ color: "var(--red)" }}>kizunaproxy@gmail.com</a> if you think this is a mistake.
          </p>
        )}

        {!error && !link && (
          <p style={{ fontSize: ".85rem", color: "var(--warm)" }}>Loading…</p>
        )}

        {link && (link.status === "paid" || paidJustNow) && (
          <div>
            <p style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>✓</p>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".4rem" }}>Payment received</p>
            <p style={{ fontSize: ".85rem", color: "var(--warm)" }}>Thank you! We'll be in touch shortly.</p>
          </div>
        )}

        {link && link.status === "cancelled" && (
          <p style={{ fontSize: ".9rem", color: "var(--warm)", lineHeight: 1.7 }}>
            This payment link has been cancelled. Contact <a href="mailto:kizunaproxy@gmail.com" style={{ color: "var(--red)" }}>kizunaproxy@gmail.com</a> for a new one.
          </p>
        )}

        {link && link.status === "pending" && !paidJustNow && (
          <>
            <p style={{ fontSize: ".78rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--warm)", marginBottom: ".5rem" }}>{link.label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.3rem", fontWeight: 600, color: "var(--red)", marginBottom: "1.75rem" }}>
              {formatJPY(link.amountJpy)}
            </p>
            <PayLinkButton token={token} onPaid={() => setPaidJustNow(true)} />
            <p style={{ fontSize: ".68rem", color: "var(--mist)", marginTop: "1.25rem" }}>
              No PayPal account needed — pay by debit or credit card through PayPal's secure checkout.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
