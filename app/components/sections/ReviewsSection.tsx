// @ts-nocheck
"use client";

import { REAL_REVIEWS } from "../data";

export default function ReviewsSection({ t }: { t: any }) {
  return (
      <section id="reviews" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.reviews?.label}</p>
            <h2>{t.reviews?.title} <em>{t.reviews?.titleEm}</em></h2>
          </div>
          <div className="reviews-header">
            <div className="reviews-score-block">
              <div className="reviews-big-num">5.0</div>
              <div>
                <div className="reviews-big-stars">★★★★★</div>
                <div className="reviews-big-label">{t.reviews?.basedOn}</div>
                <div className="reviews-count">11 verified reviews</div>
              </div>
            </div>
            <a href="https://www.reddit.com/r/internationalshopper/" target="_blank" rel="noopener noreferrer" className="reviews-reddit-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:"#ff4500"}}><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              <span>All reviews verified on Reddit</span>
            </a>
          </div>
          <div className="reviews-cards-grid">
            {REAL_REVIEWS.map((r, i) => (
              <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="review-card-new">
                <div className="rcn-top">
                  <div className="rcn-stars">{"★".repeat(r.stars)}</div>
                  <div className="rcn-country">{r.country}</div>
                </div>
                <p className="rcn-text">&ldquo;{r.text}&rdquo;</p>
                <div className="rcn-footer">
                  <div className="rcn-avatar">{r.name.replace("u/","").charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="rcn-name">{r.name}</div>
                    <div className="rcn-source">via Reddit</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginLeft:"auto",color:"var(--red)",opacity:.5}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
              </a>
            ))}
          </div>
          <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer" className="trustpilot-bar">
            <div className="tp-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{color:"#00b67a",flexShrink:0}}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              <span className="tp-name">Trustpilot</span>
            </div>
            <div className="tp-stars">{[1,2,3,4,5].map(s=><div key={s} className="tp-star">★</div>)}</div>
            <div className="tp-cta">See our reviews →</div>
          </a>
        </div>
      </section>
  );
}
