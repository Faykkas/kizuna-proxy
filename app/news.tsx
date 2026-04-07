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
  shipping:  { label: "Shipping",  color: "#4d148c" },
  service:   { label: "Service",   color: "#b8976a" },
  event:     { label: "Event",     color: "#1a6934" },
  general:   { label: "General",   color: "#16120e" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(6);
      setNews(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--warm)", fontSize: ".85rem" }}>
      Loading…
    </div>
  );

  if (news.length === 0) return null;

  return (
    <div className="news-grid">
      {news.map((item, i) => (
        <div key={item.id} className={`news-card${i === 0 ? " news-card-featured" : ""}`}>
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
  );
}
