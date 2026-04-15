// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import type { CalendarEvent } from "./lib/supabase";

const MONTHS_BY_LANG = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  fr: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  ja: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  es: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
  it: ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
  ko: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
  zh: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
};
const DAYS_BY_LANG = {
  en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  fr: ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
  ja: ["月","火","水","木","金","土","日"],
  es: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
  it: ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"],
  de: ["Mo","Di","Mi","Do","Fr","Sa","So"],
  ko: ["월","화","수","목","금","토","일"],
  zh: ["一","二","三","四","五","六","日"],
};

const TYPES = {
  event:       { bg: "#C8102E", light: "rgba(200,16,46,.08)",  label: "Event",       icon: "🎌" },
  available:   { bg: "#1a6934", light: "rgba(26,105,52,.08)",  label: "Available",   icon: "✓"  },
  unavailable: { bg: "#1a2744", light: "rgba(26,39,68,.06)",   label: "Unavailable", icon: "✗"  },
};

export default function Calendar({
  upcomingLabel = "Upcoming",
  noEventsLabel = "No events on this day.",
  noUpcomingLabel = "No upcoming events.",
  lang = "en",
}: {
  upcomingLabel?: string;
  noEventsLabel?: string;
  noUpcomingLabel?: string;
  lang?: string;
}) {
  const [today] = useState(() => new Date());
  const [year, setYear]     = useState(() => new Date().getFullYear());
  const [month, setMonth]   = useState(() => new Date().getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSel]  = useState<string|null>(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").order("date",{ascending:true}).then(({data}) => {
      setEvents(data||[]); setLoad(false);
    });
  }, []);

  const MONTHS = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.en;
  const DAYS   = DAYS_BY_LANG[lang]   || DAYS_BY_LANG.en;

  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month+1, 0);
  const startOffset = (firstDay.getDay()+6)%7;
  const rows        = Math.ceil((startOffset+lastDay.getDate())/7);
  const todayStr    = today.toISOString().split("T")[0];
  const upcoming    = events.filter(e=>e.date>=todayStr).slice(0,5);
  const selEvs      = selected ? events.filter(e=>e.date===selected) : [];

  function ds(d:number){ return `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
  function dayEvs(d:number){ return events.filter(e=>e.date===ds(d)); }
  const prev = ()=>{ if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); setSel(null); };
  const next = ()=>{ if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); setSel(null); };

  return (
    <div className="kcal-wrap">

      {/* ── MAIN CALENDAR ── */}
      <div className="kcal-main">

        {/* Header */}
        <div className="kcal-header">
          <button className="kcal-nav-btn" onClick={prev} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="kcal-header-center">
            <span className="kcal-month-name">{MONTHS[month]}</span>
            <span className="kcal-year">{year}</span>
          </div>
          <button className="kcal-nav-btn" onClick={next} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="kcal-days-header">
          {DAYS.map(d=><div key={d} className="kcal-day-lbl">{d}</div>)}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="kcal-spinner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
        ) : (
          <div className="kcal-grid">
            {Array.from({length: rows*7}).map((_,i)=>{
              const d   = i - startOffset + 1;
              const ok  = d>=1 && d<=lastDay.getDate();
              const str = ok ? ds(d) : "";
              const evs = ok ? dayEvs(d) : [];
              const isToday = str===todayStr;
              const isSel   = str===selected;
              const isPast  = ok && str<todayStr;
              const mainEv  = evs[0];
              return (
                <div key={i}
                  className={["kcal-cell", !ok?"kcal-empty":"kcal-valid", isToday?"kcal-today":"", isSel?"kcal-sel":"", isPast?"kcal-past":""].filter(Boolean).join(" ")}
                  onClick={()=>ok&&setSel(isSel?null:str)}
                >
                  {ok && (
                    <>
                      <span className="kcal-num">{d}</span>
                      {evs.length>0 && (
                        <div className="kcal-ev-pills">
                          {evs.slice(0,2).map((ev,j)=>(
                            <span key={j} className="kcal-ev-pill"
                              style={{color: TYPES[ev.type]?.bg, background: `${TYPES[ev.type]?.bg}18`}}>
                              <span style={{width:"5px",height:"5px",borderRadius:"50%",background:TYPES[ev.type]?.bg,flexShrink:0,display:"inline-block"}}/>
                              {ev.title.length>12 ? ev.title.slice(0,11)+"…" : ev.title}
                            </span>
                          ))}
                          {evs.length>2 && <span className="kcal-ev-more">+{evs.length-2}</span>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="kcal-legend">
          {Object.entries(TYPES).map(([k,v])=>(
            <div key={k} className="kcal-legend-item">
              <span className="kcal-legend-dot" style={{background:v.bg}}/>
              <span>{v.label}</span>
            </div>
          ))}
          <span className="kcal-tz">JST · UTC+9</span>
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div className="kcal-side">

        {/* Selected day */}
        <div className="kcal-detail-box">
          {!selected ? (
            <div className="kcal-hint">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" opacity=".5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>Select a day<br/>to see details</p>
            </div>
          ) : (
            <>
              <div className="kcal-sel-date">
                {new Date(selected+"T12:00:00").toLocaleDateString(
                  lang==="ja"?"ja-JP":lang==="ko"?"ko-KR":lang==="zh"?"zh-CN":"en-US",
                  {weekday:"long",month:"long",day:"numeric"}
                )}
              </div>
              {selEvs.length===0 ? (
                <p className="kcal-no-ev">{noEventsLabel}</p>
              ) : selEvs.map(ev=>(
                <div key={ev.id} className="kcal-ev-detail">
                  <span className="kcal-ev-tag" style={{background:TYPES[ev.type]?.bg}}>
                    {TYPES[ev.type]?.icon} {TYPES[ev.type]?.label}
                  </span>
                  <strong className="kcal-ev-name">{ev.title}</strong>
                  {ev.store && <span className="kcal-ev-place">📍 {ev.store}</span>}
                  {ev.description && <p className="kcal-ev-body">{ev.description}</p>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Upcoming */}
        <div className="kcal-upcoming-box">
          <div className="kcal-upcoming-head">{upcomingLabel}</div>
          {upcoming.length===0 ? (
            <p className="kcal-no-ev" style={{padding:"1rem 1.2rem"}}>{noUpcomingLabel}</p>
          ) : upcoming.map(ev=>(
            <div key={ev.id} className="kcal-upcoming-row" onClick={()=>setSel(ev.date)}>
              <div className="kcal-upcoming-bar" style={{background:TYPES[ev.type]?.bg}}/>
              <div className="kcal-upcoming-info">
                <strong>{ev.title}</strong>
                {ev.store && <span>📍 {ev.store}</span>}
              </div>
              <div className="kcal-upcoming-dt">
                {new Date(ev.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
