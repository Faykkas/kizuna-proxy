// @ts-nocheck
"use client";
import { useState } from "react";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "var(--surface2)" : "var(--surface)",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", gap: "1rem" }}>
        <span style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--ink)", lineHeight: 1.4 }}>{q}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0, color: "var(--red)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: ".25rem 1.5rem 1.1rem", fontSize: ".82rem", lineHeight: 1.85, color: "var(--warm)", fontWeight: 300 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", margin: "1.2rem 0 2rem" }}>
      {items.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
    </div>
  );
}
