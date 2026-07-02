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
  title_fr?: string; title_ja?: string; title_es?: string; title_it?: string; title_de?: string; title_ko?: string; title_zh?: string;
  content_fr?: string; content_ja?: string; content_es?: string; content_it?: string; content_de?: string; content_ko?: string; content_zh?: string;
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  shipping: { en:"Shipping", fr:"Livraison", ja:"配送", es:"Envío", it:"Spedizione", de:"Versand", ko:"배송", zh:"配送" },
  service:  { en:"Service",  fr:"Service",   ja:"サービス", es:"Servicio", it:"Servizio", de:"Service", ko:"서비스", zh:"服务" },
  event:    { en:"Event",    fr:"Événement", ja:"イベント", es:"Evento", it:"Evento", de:"Event", ko:"이벤트", zh:"活动" },
  general:  { en:"General",  fr:"Général",   ja:"一般", es:"General", it:"Generale", de:"Allgemein", ko:"일반", zh:"一般" },
};

const CATEGORY_COLORS = { shipping:"#4d148c", service:"#e03040", event:"#1a6934", general:"#1a2744" };

const VIEW_ALL: Record<string, string> = {
  en:"View all announcements →", fr:"Voir toutes les annonces →", ja:"すべてのお知らせを見る →",
  es:"Ver todos los anuncios →", it:"Vedi tutti gli annunci →", de:"Alle Ankündigungen ansehen →",
  ko:"모든 공지 보기 →", zh:"查看所有公告 →",
};

const TODAY_LABELS: Record<string, string> = {
  en:"Today", fr:"Aujourd'hui", ja:"今日", es:"Hoy", it:"Oggi", de:"Heute", ko:"오늘", zh:"今天",
};
const YESTERDAY_LABELS: Record<string, string> = {
  en:"Yesterday", fr:"Hier", ja:"昨日", es:"Ayer", it:"Ieri", de:"Gestern", ko:"어제", zh:"昨天",
};

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return TODAY_LABELS[lang] || "Today";
  if (days === 1) return YESTERDAY_LABELS[lang] || "Yesterday";
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US', { month: "short", day: "numeric" });
}

export default function NewsSection({ lang = "en" }: { lang?: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(2)
      .then(({ data }) => { setNews(data || []); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding:"2rem", textAlign:"center", color:"var(--warm)", fontSize:".82rem" }}>Loading…</div>;
  if (news.length === 0) return null;

  return (
    <div>
      <div className="news-grid">
        {news.map(item => {
          // Use translated fields if available, fallback to EN
          const title = item[`title_${lang}`] || item.title;
          const content = item[`content_${lang}`] || item.content;
          const catLabel = CATEGORY_LABELS[item.category]?.[lang] || item.category;
          const catColor = CATEGORY_COLORS[item.category] || "#333";
          return (
            <div key={item.id} className="news-card">
              <div className="news-card-top">
                <span className="news-badge" style={{ background: catColor }}>{catLabel}</span>
                <span className="news-date">{timeAgo(item.published_at, lang)}</span>
              </div>
              <h3 className="news-title">{title}</h3>
              <p className="news-content">{content}</p>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:"1.5rem", textAlign:"right" }}>
        <a href="/news" className="news-archive-link">{VIEW_ALL[lang] || "View all →"}</a>
      </div>
    </div>
  );
}
