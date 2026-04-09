// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CAL_TYPES = [
  { value: "event",       label: "🎌 Event",      color: "#b82a24" },
  { value: "available",   label: "✅ Available",   color: "#3a7d44" },
  { value: "unavailable", label: "⛔ Unavailable", color: "#8a7f74" },
];
const NEWS_CATS = [
  { value: "shipping", label: "🚚 Shipping",  color: "#4d148c" },
  { value: "service",  label: "⭐ Service",   color: "#b8976a" },
  { value: "event",    label: "🎌 Event",     color: "#1a6934" },
  { value: "general",  label: "📢 General",   color: "#16120e" },
];
const LANGS = ["en","fr","ja","es","it","de","ko","zh"];
const LANG_NAMES = { en:"English", fr:"Français", ja:"日本語", es:"Español", it:"Italiano", de:"Deutsch", ko:"한국어", zh:"中文" };

const emptyEvent = { title:"", date:"", type:"event", description:"", store:"" };
const emptyNews  = { title:"", content:"", category:"general" };
const emptyGallery = { title:"", subtitle:"", image_url:"", sort_order:0 };

// ─── STYLES ──────────────────────────────────────────────────────────────────
const lbl = { fontSize:".63rem", letterSpacing:".14em", textTransform:"uppercase" as const, color:"var(--warm)", display:"block", marginBottom:".4rem" };
const inp = { width:"100%", padding:".7rem 1rem", border:"1px solid var(--border-gold)", borderRadius:"1px", fontSize:".88rem", fontFamily:"'Jost',sans-serif", background:"var(--beige)", color:"var(--ink)", outline:"none", boxSizing:"border-box" as const };
const btnPrimary = { background:"var(--gold-d)", color:"#fff", border:"none", padding:".6rem 1.4rem", borderRadius:"1px", fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase" as const, fontFamily:"'Jost',sans-serif", cursor:"pointer", fontWeight:500 };
const btnGhost = { background:"transparent", color:"var(--warm)", border:"1px solid var(--border-gold)", padding:".6rem 1.2rem", borderRadius:"1px", fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase" as const, fontFamily:"'Jost',sans-serif", cursor:"pointer" };
const btnSmall = { border:"1px solid var(--border-gold)", padding:".3rem .7rem", borderRadius:"1px", fontSize:".68rem", fontFamily:"'Jost',sans-serif", cursor:"pointer", color:"var(--ink)", background:"var(--beige)" };
const btnDanger = { border:"none", padding:".3rem .7rem", borderRadius:"1px", fontSize:".68rem", fontFamily:"'Jost',sans-serif", cursor:"pointer", color:"#b91c1c", background:"#fee2e2" };
const card = { background:"var(--white)", border:"1px solid var(--border-gold)", borderRadius:"1px", padding:"2rem", marginBottom:"1.5rem" };
const cardHeader = { padding:"1rem 1.5rem", borderBottom:"1px solid var(--border-gold)", background:"var(--beige)", fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase" as const, color:"var(--warm)", fontWeight:500, marginBottom:0 };
const row2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" };
const msg_ok = { fontSize:".78rem", color:"#3a7d44", marginBottom:".75rem" };
const msg_err = { fontSize:".78rem", color:"var(--red)", marginBottom:".75rem" };

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("announce");

  // Security: rate limit login attempts
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked]     = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const lockRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    if (locked) return;
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setLocked(true);
        let t = 60;
        setLockTimer(t);
        lockRef.current = setInterval(() => {
          t--;
          setLockTimer(t);
          if (t <= 0) { clearInterval(lockRef.current); setLocked(false); setAttempts(0); }
        }, 1000);
      }
      setLoginErr(next >= 5 ? "Too many attempts. Wait 60s." : `Wrong credentials. ${5-next} attempt(s) left.`);
    }
  }

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--beige)" }}><p style={{ color:"var(--warm)", fontSize:".85rem" }}>Loading…</p></div>;

  if (!session) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--beige)" }}>
      <div style={{ background:"var(--white)", border:"1px solid var(--border-gold)", padding:"2.5rem", width:"100%", maxWidth:"360px", boxShadow:"0 8px 32px rgba(13,11,9,.08)" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:600, color:"var(--ink)", marginBottom:".3rem" }}>
          <span style={{ color:"var(--gold)" }}>Kizuna</span> Admin
        </div>
        <p style={{ fontSize:".8rem", color:"var(--warm)", marginBottom:"1.5rem" }}>Sign in to manage your site</p>
        {locked && <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", padding:".75rem 1rem", marginBottom:"1rem", fontSize:".78rem", color:"#b91c1c", borderRadius:"1px" }}>🔒 Account locked. Try again in {lockTimer}s.</div>}
        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="kizunaproxy@gmail.com" style={{...inp, marginBottom:".75rem"}} autoFocus disabled={locked} />
        <label style={lbl}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="••••••••" style={{...inp, marginBottom:".5rem", borderColor:loginErr?"var(--red)":undefined}} disabled={locked} />
        {loginErr && !locked && <p style={msg_err}>{loginErr}</p>}
        <button onClick={handleLogin} disabled={locked} style={{...btnPrimary, width:"100%", marginTop:".5rem", opacity:locked?.5:1}}>Sign in</button>
      </div>
    </div>
  );

  const TABS = [
    { id:"announce", label:"📢 Banner" },
    { id:"calendar", label:"📅 Calendar" },
    { id:"news",     label:"🗞 News" },
    { id:"gallery",  label:"🖼 Gallery" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--beige)", padding:"2rem" }}>
      <div style={{ maxWidth:"960px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"var(--ink)" }}>
              <span style={{ color:"var(--gold)" }}>Kizuna</span> Admin
            </h1>
            <p style={{ fontSize:".8rem", color:"var(--warm)" }}>Logged in as {session.user.email}</p>
          </div>
          <div style={{ display:"flex", gap:".75rem", alignItems:"center" }}>
            <a href="/" style={{ fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--warm)", textDecoration:"none" }}>← Site</a>
            <button onClick={() => supabase.auth.signOut()} style={btnGhost}>Sign out</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"1px", marginBottom:"2rem", background:"var(--border-gold)", border:"1px solid var(--border-gold)", width:"fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{...btnGhost, border:"none", background:tab===t.id?"var(--ink)":"var(--beige)", color:tab===t.id?"var(--gold)":"var(--warm)", borderRadius:0, padding:".6rem 1.3rem"}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "announce" && <AnnounceTab />}
        {tab === "calendar" && <CalendarTab />}
        {tab === "news"     && <NewsTab />}
        {tab === "gallery"  && <GalleryTab />}
      </div>
    </div>
  );
}

// ─── ANNOUNCE TAB ─────────────────────────────────────────────────────────────
function AnnounceTab() {
  const [data, setData]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("announce").select("*").limit(1).single();
    if (data) setData(data);
  }

  async function save() {
    setSaving(true);
    await supabase.from("announce").update({ ...data, updated_at: new Date().toISOString() }).eq("id", data.id);
    setSaving(false);
    setMsg("✓ Banner updated.");
    setTimeout(() => setMsg(""), 3000);
  }

  if (!data) return <div style={{ padding:"2rem", color:"var(--warm)", fontSize:".85rem" }}>Loading…</div>;

  return (
    <>
      <div style={card}>
        <p style={{ ...cardHeader, marginBottom:"1.5rem" }}>Announcement Banner</p>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem", padding:"1rem", background: data.active?"rgba(58,125,68,.08)":"rgba(138,127,116,.08)", border:`1px solid ${data.active?"#3a7d44":"var(--border-gold)"}`, borderRadius:"1px" }}>
          <label style={{ display:"flex", alignItems:"center", gap:".6rem", cursor:"pointer", fontSize:".82rem", color:"var(--ink)", fontWeight:500 }}>
            <input type="checkbox" checked={data.active} onChange={e => setData(d => ({...d, active:e.target.checked}))} style={{ width:"16px", height:"16px", accentColor:"var(--gold)" }} />
            {data.active ? "🟢 Banner is VISIBLE on site" : "⚫ Banner is HIDDEN"}
          </label>
        </div>
        <div style={row2}>
          <div><label style={lbl}>From date</label><input style={inp} value={data.from_date} onChange={e => setData(d => ({...d,from_date:e.target.value}))} placeholder="April 20" /></div>
          <div><label style={lbl}>To date</label><input style={inp} value={data.to_date} onChange={e => setData(d => ({...d,to_date:e.target.value}))} placeholder="June 1 included" /></div>
        </div>
        <p style={{ fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--warm)", marginBottom:"1rem", marginTop:".5rem" }}>Translations</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".75rem" }}>
          {LANGS.map(l => (
            <div key={l}>
              <label style={lbl}>{LANG_NAMES[l]}</label>
              <input style={inp} value={data[`text_${l}`] || ""} onChange={e => setData(d => ({...d,[`text_${l}`]:e.target.value}))} placeholder={`Text in ${LANG_NAMES[l]}`} />
            </div>
          ))}
        </div>
        {msg && <p style={{...msg_ok, marginTop:"1rem"}}>{msg}</p>}
        <div style={{ marginTop:"1.2rem" }}>
          <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? "Saving…" : "Save banner"}</button>
        </div>
      </div>
    </>
  );
}

// ─── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalendarTab() {
  const [events, setEvents]   = useState([]);
  const [form, setForm]       = useState(emptyEvent);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("events").select("*").order("date");
    setEvents(data || []);
  }
  async function save() {
    if (!form.title || !form.date) { setMsg("Please fill title and date."); return; }
    setSaving(true);
    const p = { title:form.title, date:form.date, type:form.type, description:form.description, store:form.store };
    if (editing) await supabase.from("events").update(p).eq("id", editing);
    else await supabase.from("events").insert(p);
    setSaving(false); setForm(emptyEvent); setEditing(null);
    setMsg(editing ? "✓ Updated." : "✓ Added."); setTimeout(() => setMsg(""), 3000); load();
  }
  async function del(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("events").delete().eq("id", id); load();
  }

  return (
    <>
      <div style={card}>
        <p style={{...cardHeader, marginBottom:"1.5rem"}}>{editing ? "✏️ Edit event" : "➕ Add event"}</p>
        <div style={row2}>
          <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} /></div>
          <div><label style={lbl}>Date *</label><input style={inp} type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
        </div>
        <div style={row2}>
          <div><label style={lbl}>Type *</label><select style={inp} value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>{CAL_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label style={lbl}>Store / Location</label><input style={inp} value={form.store} onChange={e => setForm(f=>({...f,store:e.target.value}))} /></div>
        </div>
        <div style={{marginBottom:"1.2rem"}}><label style={lbl}>Description</label><textarea style={{...inp,resize:"vertical",minHeight:"70px"}} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} /></div>
        {msg && <p style={msg.startsWith("✓")?msg_ok:msg_err}>{msg}</p>}
        <div style={{display:"flex",gap:".75rem"}}>
          <button onClick={save} disabled={saving} style={btnPrimary}>{saving?"Saving…":editing?"Update":"Add"}</button>
          {editing && <button onClick={()=>{setEditing(null);setForm(emptyEvent);}} style={btnGhost}>Cancel</button>}
        </div>
      </div>
      <div style={{background:"var(--white)",border:"1px solid var(--border-gold)"}}>
        <p style={cardHeader}>All events ({events.length})</p>
        {events.length===0?<p style={{padding:"2rem",fontSize:".85rem",color:"var(--warm)",textAlign:"center"}}>No events yet.</p>:events.map(ev=>(
          <div key={ev.id} style={{display:"flex",alignItems:"center",gap:"1rem",padding:"1rem 1.5rem",borderBottom:"1px solid var(--border-gold)",flexWrap:"wrap"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:CAL_TYPES.find(t=>t.value===ev.type)?.color,flexShrink:0}}/>
            <div style={{flex:1,minWidth:"140px"}}>
              <strong style={{fontSize:".88rem",color:"var(--ink)",display:"block"}}>{ev.title}</strong>
              {ev.store&&<span style={{fontSize:".72rem",color:"var(--warm)"}}>📍 {ev.store}</span>}
            </div>
            <span style={{fontSize:".78rem",color:"var(--warm)"}}>{ev.date}</span>
            <span style={{fontSize:".65rem",letterSpacing:".08em",textTransform:"uppercase",color:"#fff",background:CAL_TYPES.find(t=>t.value===ev.type)?.color,padding:".18rem .55rem"}}>{ev.type}</span>
            <div style={{display:"flex",gap:".5rem"}}>
              <button onClick={()=>{setEditing(ev.id);setForm({title:ev.title,date:ev.date,type:ev.type,description:ev.description||"",store:ev.store||""});window.scrollTo({top:0,behavior:"smooth"});}} style={btnSmall}>Edit</button>
              <button onClick={()=>del(ev.id)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────
function NewsTab() {
  const [list, setList]       = useState([]);
  const [form, setForm]       = useState(emptyNews);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("news").select("*").order("published_at",{ascending:false});
    setList(data||[]);
  }
  async function save() {
    if (!form.title||!form.content) { setMsg("Fill title and content."); return; }
    setSaving(true);
    const p = { title:form.title, content:form.content, category:form.category };
    if (editing) await supabase.from("news").update(p).eq("id",editing);
    else await supabase.from("news").insert(p);
    setSaving(false); setForm(emptyNews); setEditing(null);
    setMsg(editing?"✓ Updated.":"✓ Published."); setTimeout(()=>setMsg(""),3000); load();
  }
  async function del(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("news").delete().eq("id",id); load();
  }

  return (
    <>
      <div style={card}>
        <p style={{...cardHeader,marginBottom:"1.5rem"}}>{editing?"✏️ Edit":"➕ Publish news"}</p>
        <div style={row2}>
          <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
          <div><label style={lbl}>Category</label><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{NEWS_CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        </div>
        <div style={{marginBottom:"1.2rem"}}><label style={lbl}>Content *</label><textarea style={{...inp,resize:"vertical",minHeight:"100px"}} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} /></div>
        {msg&&<p style={msg.startsWith("✓")?msg_ok:msg_err}>{msg}</p>}
        <div style={{display:"flex",gap:".75rem"}}>
          <button onClick={save} disabled={saving} style={btnPrimary}>{saving?"Saving…":editing?"Update":"Publish"}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(emptyNews);}} style={btnGhost}>Cancel</button>}
        </div>
      </div>
      <div style={{background:"var(--white)",border:"1px solid var(--border-gold)"}}>
        <p style={cardHeader}>Published ({list.length})</p>
        {list.length===0?<p style={{padding:"2rem",fontSize:".85rem",color:"var(--warm)",textAlign:"center"}}>No news yet.</p>:list.map(item=>(
          <div key={item.id} style={{padding:"1.2rem 1.5rem",borderBottom:"1px solid var(--border-gold)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:".6rem",marginBottom:".4rem",alignItems:"center"}}>
                  <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#fff",background:NEWS_CATS.find(c=>c.value===item.category)?.color,padding:".15rem .5rem"}}>{item.category}</span>
                  <span style={{fontSize:".7rem",color:"var(--warm)"}}>{new Date(item.published_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                </div>
                <strong style={{fontSize:".9rem",color:"var(--ink)",display:"block",marginBottom:".3rem"}}>{item.title}</strong>
                <p style={{fontSize:".8rem",color:"var(--warm)",fontWeight:300,lineHeight:1.6,margin:0}}>{item.content}</p>
              </div>
              <div style={{display:"flex",gap:".5rem",flexShrink:0}}>
                <button onClick={()=>{setEditing(item.id);setForm({title:item.title,content:item.content,category:item.category});window.scrollTo({top:0,behavior:"smooth"});}} style={btnSmall}>Edit</button>
                <button onClick={()=>del(item.id)} style={btnDanger}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── GALLERY TAB ─────────────────────────────────────────────────────────────
function GalleryTab() {
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(emptyGallery);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState("");
  const fileRef               = useRef(null);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("gallery").select("*").order("sort_order");
    setItems(data||[]);
  }

  async function uploadImage(file) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("gallery").upload(name, file, { upsert: true });
    if (error) { setMsg("Upload failed: " + error.message); setUploading(false); return null; }
    const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(name);
    setUploading(false);
    return publicUrl;
  }

  async function save() {
    if (!form.title || !form.image_url) { setMsg("Title and image are required."); return; }
    setSaving(true);
    const p = { title:form.title, subtitle:form.subtitle, image_url:form.image_url, sort_order:Number(form.sort_order)||0 };
    if (editing) await supabase.from("gallery").update(p).eq("id",editing);
    else await supabase.from("gallery").insert(p);
    setSaving(false); setForm(emptyGallery); setEditing(null);
    setMsg(editing?"✓ Updated.":"✓ Added."); setTimeout(()=>setMsg(""),3000); load();
  }

  async function del(id, image_url) {
    if (!confirm("Delete this photo?")) return;
    // Delete from storage too
    const filename = image_url.split("/").pop();
    await supabase.storage.from("gallery").remove([filename]);
    await supabase.from("gallery").delete().eq("id",id);
    load();
  }

  async function moveOrder(id, dir) {
    const idx = items.findIndex(i=>i.id===id);
    const swap = items[idx+dir];
    if (!swap) return;
    await supabase.from("gallery").update({sort_order:swap.sort_order}).eq("id",id);
    await supabase.from("gallery").update({sort_order:items[idx].sort_order}).eq("id",swap.id);
    load();
  }

  return (
    <>
      <div style={card}>
        <p style={{...cardHeader,marginBottom:"1.5rem"}}>{editing?"✏️ Edit photo":"➕ Add photo"}</p>
        <div style={row2}>
          <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Pokémon Center Tokyo" /></div>
          <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))} placeholder="Rare cards · Japan" /></div>
        </div>
        <div style={row2}>
          <div>
            <label style={lbl}>Image *</label>
            <div style={{display:"flex",gap:".5rem"}}>
              <input style={{...inp,flex:1}} value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} placeholder="URL or upload below" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              const url = await uploadImage(file);
              if (url) setForm(f=>({...f,image_url:url}));
            }} />
            <button onClick={()=>fileRef.current?.click()} style={{...btnGhost,marginTop:".5rem",fontSize:".65rem"}} disabled={uploading}>
              {uploading ? "⏳ Uploading…" : "📁 Upload image"}
            </button>
          </div>
          <div><label style={lbl}>Sort order</label><input style={inp} type="number" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))} placeholder="0 = first" /></div>
        </div>
        {form.image_url && (
          <div style={{marginBottom:"1rem"}}>
            <img src={form.image_url} alt="preview" style={{height:"120px",objectFit:"cover",border:"1px solid var(--border-gold)"}} />
          </div>
        )}
        {msg&&<p style={msg.startsWith("✓")?msg_ok:msg_err}>{msg}</p>}
        <div style={{display:"flex",gap:".75rem"}}>
          <button onClick={save} disabled={saving||uploading} style={btnPrimary}>{saving?"Saving…":editing?"Update":"Add photo"}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(emptyGallery);}} style={btnGhost}>Cancel</button>}
        </div>
      </div>

      <div style={{background:"var(--white)",border:"1px solid var(--border-gold)"}}>
        <p style={cardHeader}>Gallery ({items.length} photos)</p>
        {items.length===0?<p style={{padding:"2rem",fontSize:".85rem",color:"var(--warm)",textAlign:"center"}}>No photos yet. Add your first one above.</p>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1px",background:"var(--border-gold)"}}>
          {items.map((item,idx)=>(
            <div key={item.id} style={{background:"var(--white)",padding:"1rem",display:"flex",flexDirection:"column",gap:".6rem"}}>
              <img src={item.image_url} alt={item.title} style={{width:"100%",height:"130px",objectFit:"cover",borderRadius:"1px"}} onError={e=>{(e.target as HTMLImageElement).style.opacity=".3";}} />
              <div>
                <strong style={{fontSize:".82rem",color:"var(--ink)",display:"block"}}>{item.title}</strong>
                {item.subtitle&&<span style={{fontSize:".7rem",color:"var(--warm)"}}>{item.subtitle}</span>}
              </div>
              <div style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
                <button onClick={()=>moveOrder(item.id,-1)} disabled={idx===0} style={{...btnSmall,padding:".25rem .5rem"}}>↑</button>
                <button onClick={()=>moveOrder(item.id,1)} disabled={idx===items.length-1} style={{...btnSmall,padding:".25rem .5rem"}}>↓</button>
                <button onClick={()=>{setEditing(item.id);setForm({title:item.title,subtitle:item.subtitle||"",image_url:item.image_url,sort_order:item.sort_order});window.scrollTo({top:0,behavior:"smooth"});}} style={btnSmall}>Edit</button>
                <button onClick={()=>del(item.id,item.image_url)} style={btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>}
      </div>
    </>
  );
}
