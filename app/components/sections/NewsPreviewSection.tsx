// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  category: "shipping" | "service" | "event" | "general";
  published_at: string;
};

const CATEGORY_CONFIG = {
  shipping: { label: "Shipping", color: "#4d148c" },
  service:  { label: "Service",  color: "#e03040" },
  event:    { label: "Event",    color: "#1a6934" },
  general:  { label: "General",  color: "#1a2744" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsPreviewSection({ t }: { t: any }) {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const n = t.news || {};

  useEffect(() => {
    let active = true;
    supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (active) setNews(data || []);
      });
    return () => { active = false; };
  }, []);

  if (news === null) return null;

  return (
    <section id="news" className="section-sm reveal">
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: "2rem" }}>
          <p className="sec-label">{n.label || "Latest news"}</p>
          <h2>{n.title || "Updates &"} <em>{n.titleEm || "announcements"}</em></h2>
        </div>

        {news.length > 0 ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              {news.map(item => (
                <a
                  key={item.id}
                  href="/news"
                  style={{
                    background: "var(--surface)",
                    padding: "1.3rem 1.6rem",
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: "1.2rem",
                    alignItems: "start",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                    <span style={{
                      display: "inline-block", fontSize: ".56rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
                      color: "#fff", background: CATEGORY_CONFIG[item.category]?.color || "var(--red)",
                      padding: ".16rem .5rem", borderRadius: "4px", width: "fit-content",
                    }}>
                      {CATEGORY_CONFIG[item.category]?.label || item.category}
                    </span>
                    <span style={{ fontSize: ".66rem", color: "var(--mist)" }}>{timeAgo(item.published_at)}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                </a>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <a href="/news" className="btn btn-outline">{n.seeAll || "See all announcements"} →</a>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--surface)" }}>
            <p style={{ fontSize: ".85rem", color: "var(--warm)", fontWeight: 300, marginBottom: "1.2rem" }}>
              {n.emptyDesc || "Nothing new to report right now — check out upcoming Tokyo events or our shopping guides instead."}
            </p>
            <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/events" className="btn btn-outline">{n.ctaEvents || "Tokyo events"} →</a>
              <a href="/blog" className="btn btn-outline">{n.ctaGuides || "Read our guides"} →</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
