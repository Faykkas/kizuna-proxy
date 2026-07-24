// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SLIDES } from "./data";

// ─── FILMSTRIP CAROUSEL ───────────────────────────────────────────────────────
export default function Carousel({ slides = SLIDES }: { slides?: typeof SLIDES }) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((n) => {
    const next = (n + slides.length) % slides.length;
    currentRef.current = next;
    setCurrent(next);
  }, [slides.length]);
  const move = useCallback((dir) => goTo(currentRef.current + dir), [goTo]);

  useEffect(() => {
    setCurrent(0); currentRef.current = 0;
  }, [slides]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 6000);
    return () => clearInterval(autoRef.current);
  }, [move]);

  const pause  = () => clearInterval(autoRef.current);
  const resume = () => { autoRef.current = setInterval(() => move(1), 6000); };
  const prev   = (current - 1 + slides.length) % slides.length;
  const next   = (current + 1) % slides.length;

  return (
    <div className="filmstrip" onMouseEnter={pause} onMouseLeave={resume}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1); }}>
      <div className="filmstrip-stage">
        <div className="filmstrip-side" onClick={() => move(-1)}>
          <img src={slides[prev].src} alt={slides[prev].alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
          <div className="filmstrip-prev-overlay" />
        </div>
        <div className="filmstrip-main">
          {slides.map((s, i) => (
            <div key={i} className={`filmstrip-slide${i === current ? " active" : ""}`}>
              <img src={s.src} alt={s.alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
              <div className="filmstrip-caption">
                <div className="filmstrip-caption-inner">
                  <strong>{s.title}</strong>
                  <span>{s.sub}</span>
                </div>
                <div className="filmstrip-counter">{current + 1} / {slides.length}</div>
              </div>
            </div>
          ))}
          <button className="filmstrip-btn filmstrip-btn-prev" onClick={() => move(-1)} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="filmstrip-btn filmstrip-btn-next" onClick={() => move(1)} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="filmstrip-side" onClick={() => move(1)}>
          <img src={slides[next].src} alt={slides[next].alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
          <div className="filmstrip-next-overlay" />
        </div>
      </div>
      <div className="filmstrip-dots">
        {slides.map((_, i) => <button key={i} className={`filmstrip-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`} />)}
      </div>
    </div>
  );
}
