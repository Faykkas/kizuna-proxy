// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function NewsArchivePage() {
  const [news, setNews]     = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>("all");

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setNews(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ["all", "shipping", "service", "event", "general"];
  const filtered = filter === "all" ? news : news.filter(n => n.category === filter);

  return (
    <main style={{ minHeight: "100vh", background: "var(--beige)", padding: "6rem 2rem 8rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--red)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
            <span style={{ display: "block", width: "20px", height: "1px", background: "var(--red)" }} />
            Announcements archive
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 300, color: "var(--ink)", marginBottom: ".5rem" }}>
            All <em style={{ color: "var(--red)", fontStyle: "italic" }}>announcements</em>
          </h1>
          <p style={{ fontSize: ".85rem", color: "var(--warm)", fontWeight: 300 }}>
            Updates, shipping news, service changes and Tokyo events.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: ".35rem .9rem",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: filter === cat ? "var(--red)" : "var(--border)",
                background: filter === cat ? "var(--red)" : "var(--surface)",
                color: filter === cat ? "#fff" : "var(--warm)",
                fontSize: ".68rem",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all .15s",
              }}
            >
              {cat === "all" ? "All" : CATEGORY_CONFIG[cat]?.label}
            </button>
          ))}
        </div>

        {/* News list */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--warm)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--warm)", fontSize: ".85rem" }}>No announcements in this category yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            {filtered.map((item, i) => (
              <div key={item.id} style={{
                background: "var(--surface)",
                padding: "1.5rem 1.8rem",
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "1.5rem",
                alignItems: "start",
                transition: "background .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                  <span style={{
                    display: "inline-block",
                    fontSize: ".58rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
                    color: "#fff",
                    background: CATEGORY_CONFIG[item.category]?.color,
                    padding: ".18rem .55rem",
                    borderRadius: "4px",
                    width: "fit-content",
                  }}>
                    {CATEGORY_CONFIG[item.category]?.label}
                  </span>
                  <span style={{ fontSize: ".68rem", color: "var(--mist)" }}>{timeAgo(item.published_at)}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".5rem", lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: ".8rem", lineHeight: 1.8, color: "var(--warm)", fontWeight: 300, margin: 0 }}>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back */}
        <div style={{ marginTop: "3rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <a href="/" style={{ fontSize: ".72rem", color: "var(--warm)", textDecoration: "none", letterSpacing: ".08em" }}>
            ← Back to home
          </a>
          <p style={{ fontSize: ".72rem", color: "var(--mist)" }}>
            {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </main>
  );
}
