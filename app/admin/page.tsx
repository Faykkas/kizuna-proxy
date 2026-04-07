// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─── CALENDAR CONFIG ──────────────────────────────────────────────────────────
const CAL_TYPES = [
  { value: "event",       label: "🎌 Event",      color: "#b82a24" },
  { value: "available",   label: "✅ Available",   color: "#3a7d44" },
  { value: "unavailable", label: "⛔ Unavailable", color: "#8a7f74" },
];
const emptyEvent = { title: "", date: "", type: "event", description: "", store: "" };

// ─── NEWS CONFIG ──────────────────────────────────────────────────────────────
const NEWS_CATS = [
  { value: "shipping", label: "🚚 Shipping",  color: "#4d148c" },
  { value: "service",  label: "⭐ Service",   color: "#b8976a" },
  { value: "event",    label: "🎌 Event",     color: "#1a6934" },
  { value: "general",  label: "📢 General",   color: "#16120e" },
];
const emptyNews = { title: "", content: "", category: "general" };

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("calendar"); // "calendar" | "news"

  // Calendar state
  const [events, setEvents]   = useState([]);
  const [evForm, setEvForm]   = useState(emptyEvent);
  const [evEditing, setEvEditing] = useState(null);
  const [evSaving, setEvSaving]   = useState(false);
  const [evMsg, setEvMsg]         = useState("");

  // News state
  const [newsList, setNewsList]     = useState([]);
  const [newsForm, setNewsForm]     = useState(emptyNews);
  const [newsEditing, setNewsEditing] = useState(null);
  const [newsSaving, setNewsSaving]   = useState(false);
  const [newsMsg, setNewsMsg]         = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) { loadEvents(); loadNews(); }
  }, [session]);

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*").order("date");
    setEvents(data || []);
  }
  async function loadNews() {
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    setNewsList(data || []);
  }

  async function saveEvent() {
    if (!evForm.title || !evForm.date || !evForm.type) { setEvMsg("Please fill title, date and type."); return; }
    setEvSaving(true);
    const payload = { title: evForm.title, date: evForm.date, type: evForm.type, description: evForm.description, store: evForm.store };
    if (evEditing) await supabase.from("events").update(payload).eq("id", evEditing);
    else await supabase.from("events").insert(payload);
    setEvSaving(false); setEvForm(emptyEvent); setEvEditing(null);
    setEvMsg(evEditing ? "✓ Event updated." : "✓ Event added.");
    setTimeout(() => setEvMsg(""), 3000);
    loadEvents();
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  }

  async function saveNews() {
    if (!newsForm.title || !newsForm.content) { setNewsMsg("Please fill title and content."); return; }
    setNewsSaving(true);
    const payload = { title: newsForm.title, content: newsForm.content, category: newsForm.category };
    if (newsEditing) await supabase.from("news").update(payload).eq("id", newsEditing);
    else await supabase.from("news").insert(payload);
    setNewsSaving(false); setNewsForm(emptyNews); setNewsEditing(null);
    setNewsMsg(newsEditing ? "✓ News updated." : "✓ News published.");
    setTimeout(() => setNewsMsg(""), 3000);
    loadNews();
  }

  async function deleteNews(id) {
    if (!confirm("Delete this news?")) return;
    await supabase.from("news").delete().eq("id", id);
    loadNews();
  }

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--beige)" }}><p style={{ color:"var(--warm)", fontSize:".85rem" }}>Loading…</p></div>;

  if (!session) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--beige)" }}>
      <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:"2px", padding:"2.5rem", width:"100%", maxWidth:"360px", boxShadow:"0 8px 32px rgba(13,11,9,.08)" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:600, color:"var(--ink)", marginBottom:".3rem" }}>
          <span style={{ color:"var(--gold)" }}>Kizuna</span> Admin
        </div>
        <p style={{ fontSize:".8rem", color:"var(--warm)", marginBottom:"1.5rem" }}>Sign in to manage your site</p>
        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && supabase.auth.signInWithPassword({email,password:pw})} placeholder="contact@kizunaproxy.com" style={{ ...inp, marginBottom:".75rem" }} autoFocus />
        <label style={lbl}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") supabase.auth.signInWithPassword({email,password:pw}).then(({error}) => { if(error) setLoginErr(error.message); }); }} placeholder="••••••••" style={{ ...inp, marginBottom:".5rem", borderColor: loginErr ? "var(--red)" : undefined }} />
        {loginErr && <p style={{ fontSize:".72rem", color:"var(--red)", marginBottom:".5rem" }}>{loginErr}</p>}
        <button onClick={() => supabase.auth.signInWithPassword({email,password:pw}).then(({error}) => { if(error) setLoginErr(error.message); })} style={{ ...btnPrimary, width:"100%", marginTop:".5rem" }}>Sign in</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--beige)", padding:"2rem" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"var(--ink)" }}>
              <span style={{ color:"var(--gold)" }}>Kizuna</span> Admin
            </h1>
            <p style={{ fontSize:".8rem", color:"var(--warm)" }}>Manage your calendar and news</p>
          </div>
          <div style={{ display:"flex", gap:".75rem" }}>
            <a href="/" style={{ fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--warm)", textDecoration:"none", alignSelf:"center" }}>← Site</a>
            <button onClick={() => supabase.auth.signOut()} style={btnGhost}>Sign out</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"1px", marginBottom:"2rem", background:"var(--border-gold)", border:"1px solid var(--border-gold)", width:"fit-content" }}>
          {[{id:"calendar",label:"📅 Calendar"},{id:"news",label:"📢 News"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...btnGhost, border:"none", background: tab === t.id ? "var(--ink)" : "var(--beige)", color: tab === t.id ? "var(--gold)" : "var(--warm)", borderRadius:0, padding:".6rem 1.5rem" }}>{t.label}</button>
          ))}
        </div>

        {/* ── CALENDAR TAB ── */}
        {tab === "calendar" && (
          <>
            <div style={{ background:"var(--white)", border:"1px solid var(--border-gold)", borderRadius:"1px", padding:"2rem", marginBottom:"2rem" }}>
              <p style={sectionTitle}>{evEditing ? "✏️ Edit event" : "➕ Add event"}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
                <div><label style={lbl}>Title *</label><input style={inp} placeholder="Pokémon Center — Spring Set" value={evForm.title} onChange={e => setEvForm(f => ({...f,title:e.target.value}))} /></div>
                <div><label style={lbl}>Date *</label><input style={inp} type="date" value={evForm.date} onChange={e => setEvForm(f => ({...f,date:e.target.value}))} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
                <div><label style={lbl}>Type *</label><select style={inp} value={evForm.type} onChange={e => setEvForm(f => ({...f,type:e.target.value}))}>{CAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label style={lbl}>Store / Location</label><input style={inp} placeholder="Pokémon Center Tokyo…" value={evForm.store} onChange={e => setEvForm(f => ({...f,store:e.target.value}))} /></div>
              </div>
              <div style={{ marginBottom:"1.2rem" }}><label style={lbl}>Description</label><textarea style={{...inp,resize:"vertical",minHeight:"70px"}} placeholder="Details…" value={evForm.description} onChange={e => setEvForm(f => ({...f,description:e.target.value}))} /></div>
              {evMsg && <p style={{ fontSize:".78rem", color: evMsg.startsWith("✓") ? "#3a7d44" : "var(--red)", marginBottom:".75rem" }}>{evMsg}</p>}
              <div style={{ display:"flex", gap:".75rem" }}>
                <button onClick={saveEvent} disabled={evSaving} style={btnPrimary}>{evSaving ? "Saving…" : evEditing ? "Update" : "Add event"}</button>
                {evEditing && <button onClick={() => { setEvEditing(null); setEvForm(emptyEvent); }} style={btnGhost}>Cancel</button>}
              </div>
            </div>
            <div style={{ background:"var(--white)", border:"1px solid var(--border-gold)", borderRadius:"1px", overflow:"hidden" }}>
              <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid var(--border-gold)", background:"var(--beige)" }}><p style={{...sectionTitle, marginBottom:0}}>All events ({events.length})</p></div>
              {events.length === 0 ? <p style={{ padding:"2rem", fontSize:".85rem", color:"var(--warm)", textAlign:"center" }}>No events yet.</p> : events.map(ev => (
                <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1rem 1.5rem", borderBottom:"1px solid var(--border-gold)", flexWrap:"wrap" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: CAL_TYPES.find(t => t.value === ev.type)?.color, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:"140px" }}>
                    <strong style={{ fontSize:".88rem", color:"var(--ink)", display:"block" }}>{ev.title}</strong>
                    {ev.store && <span style={{ fontSize:".72rem", color:"var(--warm)" }}>📍 {ev.store}</span>}
                  </div>
                  <span style={{ fontSize:".78rem", color:"var(--warm)" }}>{new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span>
                  <span style={{ fontSize:".65rem", letterSpacing:".08em", textTransform:"uppercase", color:"#fff", background: CAL_TYPES.find(t => t.value === ev.type)?.color, padding:".18rem .55rem", borderRadius:"1px" }}>{ev.type}</span>
                  <div style={{ display:"flex", gap:".5rem" }}>
                    <button onClick={() => { setEvEditing(ev.id); setEvForm({title:ev.title,date:ev.date,type:ev.type,description:ev.description||"",store:ev.store||""}); window.scrollTo({top:0,behavior:"smooth"}); }} style={{...btnSmall,background:"var(--beige)"}}>Edit</button>
                    <button onClick={() => deleteEvent(ev.id)} style={{...btnSmall,background:"#fee2e2",color:"#b91c1c"}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── NEWS TAB ── */}
        {tab === "news" && (
          <>
            <div style={{ background:"var(--white)", border:"1px solid var(--border-gold)", borderRadius:"1px", padding:"2rem", marginBottom:"2rem" }}>
              <p style={sectionTitle}>{newsEditing ? "✏️ Edit news" : "➕ Publish news"}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
                <div><label style={lbl}>Title *</label><input style={inp} placeholder="Yamato shipping now available" value={newsForm.title} onChange={e => setNewsForm(f => ({...f,title:e.target.value}))} /></div>
                <div><label style={lbl}>Category *</label><select style={inp} value={newsForm.category} onChange={e => setNewsForm(f => ({...f,category:e.target.value}))}>{NEWS_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              </div>
              <div style={{ marginBottom:"1.2rem" }}>
                <label style={lbl}>Content *</label>
                <textarea style={{...inp,resize:"vertical",minHeight:"100px"}} placeholder="Write the news content here…" value={newsForm.content} onChange={e => setNewsForm(f => ({...f,content:e.target.value}))} />
              </div>
              {newsMsg && <p style={{ fontSize:".78rem", color: newsMsg.startsWith("✓") ? "#3a7d44" : "var(--red)", marginBottom:".75rem" }}>{newsMsg}</p>}
              <div style={{ display:"flex", gap:".75rem" }}>
                <button onClick={saveNews} disabled={newsSaving} style={btnPrimary}>{newsSaving ? "Saving…" : newsEditing ? "Update" : "Publish"}</button>
                {newsEditing && <button onClick={() => { setNewsEditing(null); setNewsForm(emptyNews); }} style={btnGhost}>Cancel</button>}
              </div>
            </div>
            <div style={{ background:"var(--white)", border:"1px solid var(--border-gold)", borderRadius:"1px", overflow:"hidden" }}>
              <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid var(--border-gold)", background:"var(--beige)" }}><p style={{...sectionTitle,marginBottom:0}}>Published news ({newsList.length})</p></div>
              {newsList.length === 0 ? <p style={{ padding:"2rem", fontSize:".85rem", color:"var(--warm)", textAlign:"center" }}>No news yet. Publish your first update above.</p> : newsList.map(item => (
                <div key={item.id} style={{ padding:"1.2rem 1.5rem", borderBottom:"1px solid var(--border-gold)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".4rem" }}>
                        <span style={{ fontSize:".6rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#fff", background: NEWS_CATS.find(c => c.value === item.category)?.color, padding:".15rem .5rem", borderRadius:"1px" }}>{item.category}</span>
                        <span style={{ fontSize:".7rem", color:"var(--warm)" }}>{new Date(item.published_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span>
                      </div>
                      <strong style={{ fontSize:".9rem", color:"var(--ink)", display:"block", marginBottom:".3rem" }}>{item.title}</strong>
                      <p style={{ fontSize:".8rem", color:"var(--warm)", fontWeight:300, lineHeight:1.6, margin:0 }}>{item.content}</p>
                    </div>
                    <div style={{ display:"flex", gap:".5rem", flexShrink:0 }}>
                      <button onClick={() => { setNewsEditing(item.id); setNewsForm({title:item.title,content:item.content,category:item.category}); window.scrollTo({top:0,behavior:"smooth"}); }} style={{...btnSmall,background:"var(--beige)"}}>Edit</button>
                      <button onClick={() => deleteNews(item.id)} style={{...btnSmall,background:"#fee2e2",color:"#b91c1c"}}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const lbl = { fontSize:".63rem", letterSpacing:".14em", textTransform:"uppercase" as const, color:"var(--warm)", display:"block", marginBottom:".4rem" };
const inp = { width:"100%", padding:".7rem 1rem", border:"1px solid var(--border-gold)", borderRadius:"1px", fontSize:".88rem", fontFamily:"'Jost',sans-serif", background:"var(--beige)", color:"var(--ink)", outline:"none", boxSizing:"border-box" as const };
const btnPrimary = { background:"var(--gold-d)", color:"#fff", border:"none", padding:".6rem 1.4rem", borderRadius:"1px", fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase" as const, fontFamily:"'Jost',sans-serif", cursor:"pointer", fontWeight:500 };
const btnGhost = { background:"transparent", color:"var(--warm)", border:"1px solid var(--border-gold)", padding:".6rem 1.2rem", borderRadius:"1px", fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase" as const, fontFamily:"'Jost',sans-serif", cursor:"pointer" };
const btnSmall = { border:"1px solid var(--border-gold)", padding:".3rem .7rem", borderRadius:"1px", fontSize:".68rem", fontFamily:"'Jost',sans-serif", cursor:"pointer", color:"var(--ink)" };
const sectionTitle = { fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase" as const, color:"var(--warm)", marginBottom:"1.2rem", fontWeight:500 };
