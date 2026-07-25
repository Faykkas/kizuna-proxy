// @ts-nocheck
"use client";
// app/components/account/PayButton.tsx
//
// Loads the PayPal SDK on demand — only when a customer actually has
// something to pay. Loading it on every page would cost every visitor a
// third-party script they never use.

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatJPY } from "../../lib/orderStatus";

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
    // JPY is a zero-decimal currency; PayPal requires whole-number amounts
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=JPY&intent=capture`;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function PayButton({ orderId, amountJpy, onPaid }) {
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
            style: { layout: "horizontal", color: "gold", shape: "rect", height: 44, tagline: false },

            // Ask our server to create the order. The amount is decided
            // server-side from the database, never passed from here.
            createOrder: async () => {
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch("/api/paypal", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ action: "create", orderId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Could not start payment");
              return data.id;
            },

            onApprove: async (data) => {
              setState("paying");
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch("/api/paypal", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                  action: "capture",
                  orderId,
                  paypalOrderId: data.orderID,
                }),
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
  }, [clientId, orderId]);

  // No key configured yet — show a clear fallback rather than a broken button
  if (!clientId) {
    return (
      <div className="pay-fallback">
        <p>Pay {formatJPY(amountJpy)} — contact us for a payment link.</p>
        <a href="mailto:contact@kizunaproxy.com" className="btn btn-outline">EMAIL US</a>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="pay-done">
        <strong>PAYMENT RECEIVED</strong>
        <span>Thank you! We&apos;ll ship within 24 hours.</span>
      </div>
    );
  }

  return (
    <div className="pay-wrap">
      {state === "paying" && <p className="pay-status">Confirming payment…</p>}
      {state === "error" && <p className="pay-error">{message}</p>}
      <div ref={containerRef} className="pay-buttons" />
    </div>
  );
}
