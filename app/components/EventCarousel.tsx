// @ts-nocheck
"use client";
// app/components/EventCarousel.tsx
//
// Small promo carousel for time-sensitive Tokyo events (currently: the
// Hobonichi Techo Store lottery and The Weeknd's Harajuku pop-up). Each
// slide gets its own original illustration — no photos or logos borrowed
// from the events themselves — plus a headline, a short description and
// a call to action.

import { useCallback, useEffect, useRef, useState } from "react";

function PenguinIllustration() {
  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" role="img" aria-hidden="true">
      <circle cx="80" cy="80" r="78" fill="var(--beige)" />
      <ellipse cx="80" cy="128" rx="34" ry="8" fill="rgba(0,0,0,.08)" />
      {/* body */}
      <path d="M80 34c24 0 38 22 38 52s-14 46-38 46-38-16-38-46 14-52 38-52z" fill="#2b2b33" />
      <path d="M80 50c15 0 24 18 24 40s-9 34-24 34-24-12-24-34 9-40 24-40z" fill="#fbf7ee" />
      {/* cheeks */}
      <circle cx="63" cy="78" r="6" fill="#ffb4b4" opacity=".7" />
      <circle cx="97" cy="78" r="6" fill="#ffb4b4" opacity=".7" />
      {/* eyes */}
      <circle cx="70" cy="70" r="4" fill="#20202a" />
      <circle cx="90" cy="70" r="4" fill="#20202a" />
      {/* beak */}
      <path d="M74 84c2 6 4 9 6 9s4-3 6-9c-4 3-8 3-12 0z" fill="#f3a53c" />
      {/* feet */}
      <path d="M64 122c-4 4-10 5-14 4 2 4 10 6 16 3z" fill="#f3a53c" />
      <path d="M96 122c4 4 10 5 14 4-2 4-10 6-16 3z" fill="#f3a53c" />
      {/* scarf */}
      <path d="M56 62c8 6 40 6 48 0-2 8-6 12-6 12H62s-4-4-6-12z" fill="var(--red)" />
      {/* little notebook */}
      <g transform="translate(104 100) rotate(-12)">
        <rect x="0" y="0" width="26" height="20" rx="2" fill="#fff" stroke="var(--border-gold)" />
        <line x1="0" y1="6" x2="26" y2="6" stroke="var(--red)" strokeWidth="2" />
      </g>
    </svg>
  );
}

function MoonMicIllustration() {
  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" role="img" aria-hidden="true">
      <circle cx="80" cy="80" r="78" fill="#17141a" />
      <circle cx="52" cy="46" r="2" fill="#fff" opacity=".6" />
      <circle cx="118" cy="58" r="1.6" fill="#fff" opacity=".5" />
      <circle cx="104" cy="34" r="1.4" fill="#fff" opacity=".5" />
      <circle cx="36" cy="90" r="1.4" fill="#fff" opacity=".4" />
      {/* crescent moon */}
      <path d="M100 38a34 34 0 1 0 0 60 28 28 0 0 1 0-60z" fill="var(--gold)" opacity=".9" />
      {/* mic body */}
      <g transform="translate(80 118)">
        <line x1="0" y1="0" x2="0" y2="18" stroke="#d8b26a" strokeWidth="3" strokeLinecap="round" />
        <line x1="-10" y1="18" x2="10" y2="18" stroke="#d8b26a" strokeWidth="3" strokeLinecap="round" />
      </g>
      <rect x="68" y="70" width="24" height="42" rx="12" fill="#efe6d3" />
      <rect x="68" y="76" width="24" height="3" fill="#17141a" opacity=".3" />
      <rect x="68" y="83" width="24" height="3" fill="#17141a" opacity=".3" />
      <rect x="68" y="90" width="24" height="3" fill="#17141a" opacity=".3" />
      {/* sound waves */}
      <path d="M56 88c-4 6-4 14 0 20" stroke="var(--red)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" />
      <path d="M104 88c4 6 4 14 0 20" stroke="var(--red)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

export const CAROUSEL_ILLUSTRATIONS = {
  penguin: PenguinIllustration,
  moonMic: MoonMicIllustration,
};

export default function EventCarousel({ slides }) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);

  const goTo = useCallback((n) => {
    const next = (n + slides.length) % slides.length;
    currentRef.current = next;
    setCurrent(next);
  }, [slides.length]);
  const move = useCallback((dir) => goTo(currentRef.current + dir), [goTo]);

  useEffect(() => {
    if (slides.length < 2) return;
    autoRef.current = setInterval(() => move(1), 8000);
    return () => clearInterval(autoRef.current);
  }, [move, slides.length]);

  const pause = () => clearInterval(autoRef.current);
  const resume = () => { if (slides.length > 1) autoRef.current = setInterval(() => move(1), 8000); };

  if (slides.length === 0) return null;
  const slide = slides[current];
  const Illustration = CAROUSEL_ILLUSTRATIONS[slide.illustration] || PenguinIllustration;

  return (
    <div className="ev-carousel" onMouseEnter={pause} onMouseLeave={resume}>
      <div className="ev-carousel-card" style={{ borderLeftColor: slide.accent || "var(--red)" }}>
        <div className="ev-carousel-art">
          <Illustration />
        </div>
        <div className="ev-carousel-body">
          <div className="highlight-pill" style={{ marginBottom: ".8rem" }}>
            <span className="highlight-pill-dot" />
            <span className="highlight-pill-text">{slide.badge}</span>
          </div>
          <strong style={{ fontSize: "1.05rem" }}>{slide.title}</strong>
          <p>{slide.desc}</p>
          {slide.note && (
            <p style={{ marginTop: ".3rem", fontSize: ".7rem", fontStyle: "italic", opacity: .8 }}>{slide.note}</p>
          )}
          <a href={slide.ctaHref} className="btn btn-gold" style={{ marginTop: ".8rem", display: "inline-block" }}>
            {slide.cta}
          </a>
        </div>
        {slides.length > 1 && (
          <>
            <button className="ev-carousel-nav ev-carousel-nav-prev" onClick={() => move(-1)} aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="ev-carousel-nav ev-carousel-nav-next" onClick={() => move(1)} aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="ev-carousel-dots">
          {slides.map((_, i) => (
            <button key={i} className={`ev-carousel-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
