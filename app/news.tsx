// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

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
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(2) // Only 2 on homepage
      .then(({ data }) => {
        setNews(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--warm)", fontSize: ".82rem" }}>
      Loading…
    </div>
  );

  if (news.length === 0) return null;

  return (
    <div>
      <div className="news-grid">
        {news.map(item => (
          <div key={item.id} className="news-card">
            <div className="news-card-top">
              <span className="news-badge" style={{ background: CATEGORY_CONFIG[item.category]?.color }}>
                {CATEGORY_CONFIG[item.category]?.label}
              </span>
              <span className="news-date">{timeAgo(item.published_at)}</span>
            </div>
            <h3 className="news-title">{item.title}</h3>
            <p className="news-content">{item.content}</p>
          </div>
        ))}
      </div>

      {/* Link to archive */}
      <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
        <a href="/news" className="news-archive-link">
          View all announcements →
        </a>
      </div>
    </div>
  );
}
