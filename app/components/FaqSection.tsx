// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export default function FaqSection({ t }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {t.faq.items.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="faq-q">
            <span>{item.q}</span>
            <svg className="faq-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {open === i && <div className="faq-a"><p>{item.a}</p></div>}
        </div>
      ))}
    </div>
  );
}
