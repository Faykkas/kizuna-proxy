// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { REAL_REVIEWS } from "./data";

// ─── REVIEWS CAROUSEL ────────────────────────────────────────────────────────
export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);

  const goTo = useCallback((n) => {
    const next = (n + REAL_REVIEWS.length) % REAL_REVIEWS.length;
    currentRef.current = next;
    setCurrent(next);
  }, []);
  const move = useCallback((dir) => goTo(currentRef.current + dir), [goTo]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 5000);
    return () => clearInterval(autoRef.current);
  }, [move]);

  const pause  = () => clearInterval(autoRef.current);
  const resume = () => { autoRef.current = setInterval(() => move(1), 5000); };
  const r = REAL_REVIEWS[current];

  return (
    <div className="rcarousel" onMouseEnter={pause} onMouseLeave={resume}>
      <div className="rcarousel-track">
        {REAL_REVIEWS.map((rev, i) => (
          <div key={i} className={`rcarousel-card${i === current ? " active" : ""}`}>
            <div className="rcard-top">
              <div className="rcard-stars">{"★".repeat(rev.stars)}</div>
              <a href={rev.link} target="_blank" rel="noopener noreferrer" className="rcard-source">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                <span>Reddit</span>
              </a>
            </div>
            <h3 className="rcard-title">{rev.title}</h3>
            <p className="rcard-text">&ldquo;{rev.text}&rdquo;</p>
            <div className="rcard-footer">
              <strong className="rcard-name">{rev.name}</strong>
              <span className="rcard-country">{rev.country}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rcarousel-nav">
        <button className="rcarousel-btn" onClick={() => move(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="rcarousel-dots">
          {REAL_REVIEWS.map((_, i) => <button key={i} className={`rcarousel-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} />)}
        </div>
        <button className="rcarousel-btn" onClick={() => move(1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}
