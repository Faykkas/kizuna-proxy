// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import PayLinkButton from "../../components/PayLinkButton";
import { formatJPY } from "../../lib/orderStatus";

export default function PayLinkClient({ token }) {
  const [link, setLink] = useState(null); // { label, amountJpy, status }
  const [error, setError] = useState("");
  const [paidJustNow, setPaidJustNow] = useState(false);
  const [phone, setPhone] = useState("");
  const [wantsAltAddress, setWantsAltAddress] = useState(false);
  const [altAddress, setAltAddress] = useState("");

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
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.3rem", fontWeight: 600, color: "var(--red)", marginBottom: (link.feeAmountJpy > 0 || link.paypalFeeAmountJpy > 0) ? ".5rem" : "1.75rem" }}>
              {formatJPY(link.amountJpy)}
            </p>
            {(link.feeAmountJpy > 0 || link.paypalFeeAmountJpy > 0) && (
              <div style={{ fontSize: ".72rem", color: "var(--mist)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                <div>Item: {formatJPY(link.itemAmountJpy)}</div>
                {link.feeAmountJpy > 0 && <div>Kizuna Proxy service fee: {formatJPY(link.feeAmountJpy)}</div>}
                {link.paypalFeeAmountJpy > 0 && <div>PayPal Goods &amp; Services fee: {formatJPY(link.paypalFeeAmountJpy)}</div>}
              </div>
            )}

            <div style={{ textAlign: "left", marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: ".72rem", fontWeight: 600, color: "var(--warm)", marginBottom: ".35rem" }}>
                Phone number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                style={{ width: "100%", padding: ".6rem .8rem", border: "1px solid var(--border-gold)", borderRadius: "8px", fontSize: ".85rem", background: "var(--beige)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
              />

              <label style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".78rem", color: "var(--warm)", marginTop: "1rem", cursor: "pointer" }}>
                <input type="checkbox" checked={wantsAltAddress} onChange={e => setWantsAltAddress(e.target.checked)} />
                Ship to a different address than usual
              </label>
              {wantsAltAddress && (
                <textarea
                  value={altAddress}
                  onChange={e => setAltAddress(e.target.value)}
                  placeholder="Full name, address, city, postal code, country…"
                  rows={3}
                  style={{ width: "100%", marginTop: ".5rem", padding: ".6rem .8rem", border: "1px solid var(--border-gold)", borderRadius: "8px", fontSize: ".85rem", background: "var(--beige)", color: "var(--ink)", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
                />
              )}
            </div>

            {phone.trim() ? (
              <PayLinkButton
                token={token}
                phone={phone.trim()}
                shippingAddress={wantsAltAddress ? altAddress.trim() : ""}
                onPaid={() => setPaidJustNow(true)}
              />
            ) : (
              <p style={{ fontSize: ".78rem", color: "var(--mist)", padding: ".8rem", border: "1px dashed var(--border-gold)", borderRadius: "8px" }}>
                Enter your phone number above to continue to payment.
              </p>
            )}

            <p style={{ fontSize: ".68rem", color: "var(--mist)", marginTop: "1.25rem" }}>
              No PayPal account needed — pay by debit or credit card through PayPal's secure checkout.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
