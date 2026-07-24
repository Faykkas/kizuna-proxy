// @ts-nocheck
"use client";

export default function AnnounceBar({ announce }: { announce?: any }) {
  if (!announce?.active) return null;
  return (
    <div className="announce-bar">
      <div className="announce-inner">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{color:"var(--gold)",flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span className="announce-pill">Notice</span>
        <span className="announce-text">
          {announce.text_en}
          {announce.from_date && <> <strong>{announce.from_date}</strong></>}
          {announce.to_date && <> → <strong>{announce.to_date}</strong></>}
        </span>
      </div>
    </div>
  );
}
