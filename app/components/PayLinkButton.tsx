// @ts-nocheck
"use client";
// app/components/PayLinkButton.tsx
//
// PayPal Buttons for a public /pay/<token> page — same SDK-loading and
// create/capture pattern as app/components/account/PayButton.tsx, but no
// Supabase session: the payer never needs a Kizuna account, only the
// token in the URL. PayPal's own "Debit or Credit Card" option (rendered
// automatically alongside the PayPal button) is what lets someone without
// a PayPal account pay — nothing extra to configure for that.

import { useEffect, useRef, useState } from "react";

const SDK_ID = "paypal-sdk";

function loadPayPalSdk(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve(window.paypal);

    const existing = document.getElementById(SDK_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", reject);
      return;
    }

    const s = document.createElement("script");
    s.id = SDK_ID;
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=JPY&intent=capture`;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function PayLinkButton({ token, onPaid }) {
  const containerRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | ready | paying | done | error
  const [message, setMessage] = useState("");

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    let cancelled = false;

    loadPayPalSdk(clientId)
      .then(paypal => {
        if (cancelled || !containerRef.current) return;

        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", height: 44, tagline: false },

            createOrder: async () => {
              const res = await fetch("/api/payment-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create", token }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Could not start payment");
              return data.id;
            },

            onApprove: async (data) => {
              setState("paying");
              const res = await fetch("/api/payment-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "capture", token, paypalOrderId: data.orderID }),
              });
              const out = await res.json();
              if (!res.ok) {
                setState("error");
                setMessage(out.error || "Payment failed");
                return;
              }
              setState("done");
              onPaid?.();
            },

            onError: (err) => {
              console.error("PayPal Buttons error:", err);
              setState("error");
              setMessage(err?.message || "Something went wrong with PayPal. Please try again.");
            },
          })
          .render(containerRef.current)
          .then(() => !cancelled && setState("ready"));
      })
      .catch(() => {
        setState("error");
        setMessage("Could not load PayPal.");
      });

    return () => { cancelled = true; };
  }, [clientId, token]);

  if (!clientId) {
    return <p style={{ fontSize: ".85rem", color: "var(--warm)" }}>Payments aren't configured yet — please contact us at kizunaproxy@gmail.com.</p>;
  }

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "1rem", color: "#22c55e", fontWeight: 600 }}>
        ✓ Payment received. Thank you!
      </div>
    );
  }

  return (
    <div>
      {state === "paying" && <p style={{ fontSize: ".82rem", color: "var(--warm)", marginBottom: ".6rem" }}>Confirming payment…</p>}
      {state === "error" && <p style={{ fontSize: ".82rem", color: "var(--red)", marginBottom: ".6rem" }}>{message}</p>}
      <div ref={containerRef} />
    </div>
  );
}
