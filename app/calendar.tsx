// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import type { CalendarEvent } from "./lib/supabase";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TYPE_COLORS = {
  event:       { bg: "#b82a24", text: "#fff", label: "Event" },
  available:   { bg: "#3a7d44", text: "#fff", label: "Available" },
  unavailable: { bg: "#8a7f74", text: "#fff", label: "Unavailable" },
};

export default function Calendar({ upcomingLabel = "Upcoming", noEventsLabel = "No events on this day.", noUpcomingLabel = "No upcoming events." }: { upcomingLabel?: string; noEventsLabel?: string; noUpcomingLabel?: string }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells  = startOffset + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  function dateStr(d: number) {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function eventsOnDay(d: number) {
    return events.filter(e => e.date === dateStr(d));
  }

  const selectedEvents = selected ? events.filter(e => e.date === selected) : [];
  const todayStr = today.toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= todayStr).slice(0, 5);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelected(null); };

  return (
    <div className="cal-wrap">
      <div className="cal-box">
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="cal-days-header">
          {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        </div>
        {loading ? (
          <div className="cal-loading">Loading…</div>
        ) : (
          <div className="cal-grid">
            {Array.from({ length: rows * 7 }).map((_, i) => {
              const dayNum = i - startOffset + 1;
              const valid  = dayNum >= 1 && dayNum <= lastDay.getDate();
              const ds     = valid ? dateStr(dayNum) : "";
              const dayEvs = valid ? eventsOnDay(dayNum) : [];
              const isToday = ds === todayStr;
              const isSel   = ds === selected;
              const isPast  = valid && ds < todayStr;
              return (
                <div key={i} className={["cal-cell", !valid ? "cal-cell-empty" : "", isToday ? "cal-cell-today" : "", isSel ? "cal-cell-sel" : "", isPast ? "cal-cell-past" : ""].join(" ")} onClick={() => valid && setSelected(isSel ? null : ds)}>
                  {valid && (<>
                    <span className="cal-day-num">{dayNum}</span>
                    <div className="cal-dots">{dayEvs.slice(0,3).map((ev,j) => <span key={j} className="cal-dot" style={{ background: TYPE_COLORS[ev.type]?.bg }} />)}</div>
                  </>)}
                </div>
              );
            })}
          </div>
        )}
        <div className="cal-legend">
          {Object.entries(TYPE_COLORS).map(([k,v]) => (
            <div key={k} className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: v.bg }} />
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="cal-side">
        {selected && (
          <div className="cal-detail">
            <p className="cal-detail-date">{new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            {selectedEvents.length === 0 ? (
              <p className="cal-detail-empty">{noEventsLabel}</p>
            ) : (
              selectedEvents.map(ev => (
                <div key={ev.id} className="cal-event-card">
                  <div className="cal-event-type" style={{ background: TYPE_COLORS[ev.type]?.bg }}>{TYPE_COLORS[ev.type]?.label}</div>
                  <strong className="cal-event-title">{ev.title}</strong>
                  {ev.store && <span className="cal-event-store">📍 {ev.store}</span>}
                  {ev.description && <p className="cal-event-desc">{ev.description}</p>}
                </div>
              ))
            )}
          </div>
        )}
        <div className="cal-upcoming">
          <p className="cal-upcoming-title">{upcomingLabel}</p>
          {upcoming.length === 0 ? (
            <p className="cal-detail-empty" style={{padding:"1rem 1.2rem"}}>{noUpcomingLabel}</p>
          ) : (
            upcoming.map(ev => (
              <div key={ev.id} className="cal-upcoming-item" onClick={() => setSelected(ev.date)}>
                <div className="cal-upcoming-bar" style={{ background: TYPE_COLORS[ev.type]?.bg }} />
                <div>
                  <strong>{ev.title}</strong>
                  <span>{new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
