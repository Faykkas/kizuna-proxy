// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── ICONS ───────────────────────────────────────────────────────────────────
export function IconInstagram({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
export function IconTiktok({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
}
export function IconSun() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
export function IconMoon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
// ─── HOOKS ───────────────────────────────────────────────────────────────────
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("kizuna-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("kizuna-theme", next ? "dark" : "light");
      return next;
    });
  }, []);
  return [dark, toggle];
}
// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button className={`back-to-top${visible ? " visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  );
}
// ─── CUSTOM CHAT BUTTON ──────────────────────────────────────────────────────
export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleChat() {
    if (typeof window === "undefined" || !window.Tawk_API) return;
    if (isOpen) {
      window.Tawk_API.minimize();
      setIsOpen(false);
    } else {
      window.Tawk_API.maximize();
      setIsOpen(true);
    }
    // Always keep the default widget hidden
    setTimeout(() => {
      if (window.Tawk_API?.hideWidget) window.Tawk_API.hideWidget();
    }, 100);
  }

  // Keep hiding the default widget continuously
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className={`chat-btn${isOpen ? " open" : ""}`}
      onClick={toggleChat}
      aria-label="Open support chat"
    >
      {isOpen ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="chat-btn-label">Support</span>
        </>
      )}
    </button>
  );
}
// ─── EVENTS FLOAT ────────────────────────────────────────────────────────────
export function EventsFloat({ t }: { t: any }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { if (!dismissed) setVisible(true); }, 4000);
    const onScroll = () => { if (window.scrollY > 300 && !dismissed) setVisible(true); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [dismissed]);
  if (dismissed) return null;
  const ef = t.eventsFloat || {};
  return (
    <div className={`events-float${visible ? " visible" : ""}`}>
      <button className="events-float-close" onClick={() => { setVisible(false); setTimeout(() => setDismissed(true), 400); }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div className="events-float-icon">🎌</div>
      <div className="events-float-body">
        <strong>{ef.title || "Tokyo Events"}</strong>
        <p>{ef.desc || "Pokémon Center, Nintendo, Supreme drops & more — we attend in person."}</p>
        <p style={{color:"var(--red)",fontSize:".6rem",fontWeight:500,marginTop:"-.3rem"}}>{ef.urgency || "⚡ High demand — book early to avoid delays."}</p>
        <a href="/events" className="events-float-btn">{ef.cta || "Learn more"} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></a>
      </div>
    </div>
  );
}
