// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";


// ─── ADMIN TRANSLATIONS ───────────────────────────────────────────────────────
const ADMIN_LANGS = {
  en: {
    signIn: "Sign in to manage your site",
    email: "Email", password: "Password", signInBtn: "Sign in",
    backToSite: "← Back to site", signOut: "Sign out",
    tabs: { announce: "📢 Banner", news: "🗞 News", gallery: "🖼 Gallery", orders: "📦 Orders", stats: "📊 Stats" },
    // Banner
    bannerTitle: al.bannerTitle,
    bannerVisible: "Banner visible on site", bannerHidden: "Banner hidden",
    bannerMsg: "Message", bannerMsgHint: al.bannerMsgHint,
    bannerFrom: "From", bannerTo: "To", bannerSave: "Save", bannerSaving: "Saving…", bannerSaved: "✓ Banner updated.",
    // News
    newArticle: al.newArticle, editArticle: al.editArticle,
    titleField: "Title *", contentField: "Content *", categoryField: "Category",
    publish: "Publish", update: "Update", cancel: "Cancel", sending: "Saving…",
    noArticles: al.noArticles,
    published: "✓ Published.", updated: "✓ Updated.",
    titleRequired: "Title and content are required.",
    // Gallery
    addPhoto: al.addPhoto, editPhoto: al.editPhoto,
    photoTitle: "Title *", photoSubtitle: "Subtitle", photoUrl: "Image URL or upload",
    uploadBtn: "📁 Upload image", uploading: "⏳ Uploading…",
    addPhotoBtn: "Add photo", noPhotos: "No photos yet. Add your first one above.",
    photoAdded: "✓ Added.", photoUpdated: "✓ Updated.",
    titleImgRequired: "Title and image are required.",
    // Orders
    newOrder: al.newOrder, editOrder: al.editOrder,
    clientName: al.clientName, country: "Country", platform: "Platform",
    communication: "Communication", items: "Items *", itemPrice: "Item price (JPY)",
    serviceFee: "Service fee (JPY)", status: "Status", purchaseDate: "Purchase date",
    shippingMethod: "Shipping method", trackingNumber: "Tracking number",
    paymentMethod: "Payment method", paymentReceived: "Payment received",
    notes: "Notes", searchPlaceholder: "🔍 Search client, item, country, tracking…",
    allStatuses: al.allStatuses, noOrders: al.noOrders,
    addOrder: al.addOrder, clientRequired: "Client name is required.",
    orderAdded: "✓ Order added.", orderUpdated: "✓ Order updated.",
    totalOrders: "Total orders", totalFees: al.totalFeesLabel, activeOrders: "Active orders",
    actionRequired: "Action required", revenueSummary: al.revenueSummary,
    totalFeesLabel: "Total fees (JPY)", estEur: al.estEur, ordersDelivered: al.ordersDelivered,
    // Stats
    monthlyRevenue: al.monthlyRevenue, feesOnly: al.feesOnly,
    topCountries: al.topCountries, orderStatus: al.orderStatus,
    monthlyBreakdown: al.monthlyBreakdown, totalEarned: "Total earned",
    avgPerOrder: "Avg per order", bestMonth: "Best month", delivered: "Delivered",
    month: al.month, orders: al.orders, revenueJPY: al.revenueJPY, revenueEUR: al.revenueEUR, avgOrder: al.avgOrder,
    total: al.total, sources: al.sources, serviceAvg: "service fee avg",
  },
  fr: {
    signIn: "Connectez-vous pour gérer votre site",
    email: "Email", password: "Mot de passe", signInBtn: "Se connecter",
    backToSite: "← Retour au site", signOut: "Déconnexion",
    tabs: { announce: "📢 Bannière", news: "🗞 Actualités", gallery: "🖼 Galerie", orders: "📦 Commandes", stats: "📊 Stats" },
    bannerTitle: "Bannière d'annonce",
    bannerVisible: "Bannière visible sur le site", bannerHidden: "Bannière masquée",
    bannerMsg: "Message", bannerMsgHint: "Ce message apparaît en haut du site.",
    bannerFrom: "Du", bannerTo: "Au", bannerSave: "Enregistrer", bannerSaving: "Enregistrement…", bannerSaved: "✓ Bannière mise à jour.",
    newArticle: "➕ Nouvel article", editArticle: "✏️ Modifier l'article",
    titleField: "Titre *", contentField: "Contenu *", categoryField: "Catégorie",
    publish: "Publier", update: "Mettre à jour", cancel: "Annuler", sending: "Enregistrement…",
    noArticles: "Aucun article pour l'instant.",
    published: "✓ Publié.", updated: "✓ Mis à jour.",
    titleRequired: "Le titre et le contenu sont requis.",
    addPhoto: "➕ Ajouter une photo", editPhoto: "✏️ Modifier la photo",
    photoTitle: "Titre *", photoSubtitle: "Sous-titre", photoUrl: "URL de l'image ou télécharger",
    uploadBtn: "📁 Télécharger une image", uploading: "⏳ Téléchargement…",
    addPhotoBtn: "Ajouter la photo", noPhotos: "Aucune photo. Ajoutez-en une ci-dessus.",
    photoAdded: "✓ Ajoutée.", photoUpdated: "✓ Mise à jour.",
    titleImgRequired: "Le titre et l'image sont requis.",
    newOrder: "Nouvelle commande", editOrder: "✏️ Modifier la commande",
    clientName: "Nom du client *", country: "Pays", platform: "Plateforme",
    communication: "Contact", items: "Articles *", itemPrice: "Prix article (JPY)",
    serviceFee: "Honoraires (JPY)", status: "Statut", purchaseDate: "Date d'achat",
    shippingMethod: "Mode d'expédition", trackingNumber: "Numéro de suivi",
    paymentMethod: "Méthode de paiement", paymentReceived: "Paiement reçu",
    notes: "Notes", searchPlaceholder: "🔍 Recherche client, article, pays, suivi…",
    allStatuses: "Tous les statuts", noOrders: "Aucune commande trouvée.",
    addOrder: "Ajouter la commande", clientRequired: "Le nom du client est requis.",
    orderAdded: "✓ Commande ajoutée.", orderUpdated: "✓ Commande mise à jour.",
    totalOrders: "Total commandes", totalFees: "Total honoraires (JPY)", activeOrders: "Commandes actives",
    actionRequired: "Action requise", revenueSummary: "Résumé des revenus",
    totalFeesLabel: "Total honoraires (JPY)", estEur: "Est. EUR (÷145)", ordersDelivered: "Commandes livrées",
    monthlyRevenue: "Revenus mensuels", feesOnly: "Honoraires uniquement",
    topCountries: "Top pays", orderStatus: "Statut des commandes",
    monthlyBreakdown: "Détail mensuel", totalEarned: "Total gagné",
    avgPerOrder: "Moyenne par commande", bestMonth: "Meilleur mois", delivered: "Livrées",
    month: "Mois", orders: "Commandes", revenueJPY: "Revenus (JPY)", revenueEUR: "Revenus (EUR)", avgOrder: "Moy/cmd",
    total: "TOTAL", sources: "Sources", serviceAvg: "moy. honoraires",
  },
  ja: {
    signIn: "サイト管理にログイン",
    email: "メール", password: "パスワード", signInBtn: "ログイン",
    backToSite: "← サイトに戻る", signOut: "ログアウト",
    tabs: { announce: "📢 バナー", news: "🗞 ニュース", gallery: "🖼 ギャラリー", orders: "📦 注文", stats: "📊 統計" },
    bannerTitle: "お知らせバナー",
    bannerVisible: "バナーをサイトに表示中", bannerHidden: "バナーは非表示",
    bannerMsg: "メッセージ", bannerMsgHint: "このメッセージはサイトの上部に表示されます。",
    bannerFrom: "開始日", bannerTo: "終了日", bannerSave: "保存", bannerSaving: "保存中…", bannerSaved: "✓ バナーを更新しました。",
    newArticle: "➕ 新しい記事", editArticle: "✏️ 記事を編集",
    titleField: "タイトル *", contentField: "内容 *", categoryField: "カテゴリー",
    publish: "公開", update: "更新", cancel: "キャンセル", sending: "保存中…",
    noArticles: "記事がありません。",
    published: "✓ 公開しました。", updated: "✓ 更新しました。",
    titleRequired: "タイトルと内容は必須です。",
    addPhoto: "➕ 写真を追加", editPhoto: "✏️ 写真を編集",
    photoTitle: "タイトル *", photoSubtitle: "サブタイトル", photoUrl: "画像URLまたはアップロード",
    uploadBtn: "📁 画像をアップロード", uploading: "⏳ アップロード中…",
    addPhotoBtn: "写真を追加", noPhotos: "写真がありません。上から追加してください。",
    photoAdded: "✓ 追加しました。", photoUpdated: "✓ 更新しました。",
    titleImgRequired: "タイトルと画像は必須です。",
    newOrder: "新しい注文", editOrder: "✏️ 注文を編集",
    clientName: "クライアント名 *", country: "国", platform: "プラットフォーム",
    communication: "連絡方法", items: "商品 *", itemPrice: "商品価格 (JPY)",
    serviceFee: "手数料 (JPY)", status: "ステータス", purchaseDate: "購入日",
    shippingMethod: "配送方法", trackingNumber: "追跡番号",
    paymentMethod: "支払い方法", paymentReceived: "入金済み",
    notes: "メモ", searchPlaceholder: "🔍 クライアント、商品、国、追跡番号で検索…",
    allStatuses: "すべてのステータス", noOrders: "注文が見つかりません。",
    addOrder: "注文を追加", clientRequired: "クライアント名は必須です。",
    orderAdded: "✓ 注文を追加しました。", orderUpdated: "✓ 注文を更新しました。",
    totalOrders: "総注文数", totalFees: "総手数料 (JPY)", activeOrders: "進行中の注文",
    actionRequired: "要対応", revenueSummary: "収益サマリー",
    totalFeesLabel: "総手数料 (JPY)", estEur: "EUR換算 (÷145)", ordersDelivered: "配送完了",
    monthlyRevenue: "月別収益", feesOnly: "手数料のみ",
    topCountries: "上位国", orderStatus: "注文ステータス",
    monthlyBreakdown: "月別詳細", totalEarned: "総収益",
    avgPerOrder: "注文平均", bestMonth: "最高月", delivered: "配送完了",
    month: "月", orders: "注文", revenueJPY: "収益 (JPY)", revenueEUR: "収益 (EUR)", avgOrder: "平均/注文",
    total: "合計", sources: "集客源", serviceAvg: "手数料平均",
  },
};
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NEWS_CATS = [
  { value: "shipping", label: "🚚 Shipping", color: "#4d148c" },
  { value: "service",  label: "⭐ Service",  color: "#e03040" },
  { value: "event",    label: "🎌 Event",    color: "#1a6934" },
  { value: "general",  label: "📢 General",  color: "#1a2744" },
];

const emptyNews    = { title: "", content: "", category: "general" };
const emptyGallery = { title: "", subtitle: "", image_url: "", sort_order: 0 };

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const BG      = "#0f0f11";
const SURFACE = "#1c1c1f";
const SURFACE2= "#242427";
const BORDER  = "rgba(255,255,255,.08)";
const RED     = "#e03040";
const INK     = "#f4f4f5";
const MUTED   = "rgba(244,244,245,.45)";

const lbl = {
  fontSize: ".6rem", letterSpacing: ".14em", textTransform: "uppercase" as const,
  color: MUTED, display: "block", marginBottom: ".4rem", fontFamily: "'Inter',sans-serif",
};
const inp = {
  width: "100%", padding: ".75rem 1rem",
  border: `1px solid ${BORDER}`, borderRadius: "8px",
  fontSize: ".88rem", fontFamily: "'Inter',sans-serif",
  background: SURFACE2, color: INK, outline: "none",
  boxSizing: "border-box" as const, transition: "border-color .15s",
};
const btnPrimary = {
  background: RED, color: "#fff", border: "none",
  padding: ".65rem 1.4rem", borderRadius: "8px",
  fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase" as const,
  fontFamily: "'Inter',sans-serif", cursor: "pointer", fontWeight: 500,
};
const btnGhost = {
  background: "transparent", color: MUTED,
  border: `1px solid ${BORDER}`, padding: ".65rem 1.2rem", borderRadius: "8px",
  fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase" as const,
  fontFamily: "'Inter',sans-serif", cursor: "pointer",
};
const btnSmall = {
  border: `1px solid ${BORDER}`, padding: ".3rem .7rem", borderRadius: "6px",
  fontSize: ".65rem", fontFamily: "'Inter',sans-serif", cursor: "pointer",
  color: INK, background: SURFACE2,
};
const btnDanger = {
  border: "none", padding: ".3rem .7rem", borderRadius: "6px",
  fontSize: ".65rem", fontFamily: "'Inter',sans-serif", cursor: "pointer",
  color: "#ff8080", background: "rgba(224,48,64,.12)",
};
const card = {
  background: SURFACE, border: `1px solid ${BORDER}`,
  borderRadius: "12px", padding: "1.75rem", marginBottom: "1.25rem",
};
const cardHeader = {
  fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase" as const,
  color: MUTED, fontWeight: 500, marginBottom: "1.5rem",
  fontFamily: "'Inter',sans-serif",
};
const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" };
const msgOk  = { fontSize: ".78rem", color: "#4ade80", marginBottom: ".75rem" };
const msgErr = { fontSize: ".78rem", color: RED, marginBottom: ".75rem" };
const sep    = { height: "1px", background: BORDER, margin: "1.5rem 0" };

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminLang, setAdminLang] = useState("en");
  const [session,  setSession]  = useState(null);
  const [email,    setEmail]    = useState("");
  const [pw,       setPw]       = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("announce");
  const [attempts, setAttempts] = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [lockTimer,setLockTimer]= useState(0);
  const lockRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang");
    if (saved && ADMIN_LANGS[saved]) setAdminLang(saved);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const al = ADMIN_LANGS[adminLang] || ADMIN_LANGS.en;

  async function handleLogin() {
    if (locked) return;
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setLocked(true);
        let t = 60; setLockTimer(t);
        lockRef.current = setInterval(() => {
          t--; setLockTimer(t);
          if (t <= 0) { clearInterval(lockRef.current); setLocked(false); setAttempts(0); }
        }, 1000);
      }
      setLoginErr(next >= 5 ? "Too many attempts. Wait 60s." : `Wrong credentials. ${5-next} attempt(s) left.`);
    }
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BG }}>
      <p style={{ color:MUTED, fontSize:".85rem" }}>Loading…</p>
    </div>
  );

  // ── LOGIN ──
  if (!session) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BG }}>
      <div style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:"16px", padding:"2.5rem", width:"100%", maxWidth:"380px" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", fontWeight:600, color:INK, marginBottom:".3rem" }}>
          <span style={{ color:RED }}>Kizuna</span> Admin
        </div>
        <div style={{display:"flex",gap:".4rem",marginBottom:"1rem"}}>
          {["en","fr","ja"].map(l => <button key={l} onClick={()=>{setAdminLang(l);localStorage.setItem("admin-lang",l);}} style={{padding:".25rem .6rem",borderRadius:"6px",border:"1px solid",borderColor:adminLang===l?RED:BORDER,background:adminLang===l?RED:"transparent",color:adminLang===l?"#fff":MUTED,fontSize:".65rem",cursor:"pointer"}}>{l.toUpperCase()}</button>)}
        </div>
        <p style={{ fontSize:".8rem", color:MUTED, marginBottom:"2rem", fontFamily:"'Inter',sans-serif" }}>{al.signIn}</p>
        {locked && (
          <div style={{ background:"rgba(224,48,64,.1)", border:`1px solid rgba(224,48,64,.2)`, padding:".75rem 1rem", marginBottom:"1rem", fontSize:".78rem", color:RED, borderRadius:"8px" }}>
            🔒 Locked. Try again in {lockTimer}s.
          </div>
        )}
        <label style={lbl}>{al.email}</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="kizunaproxy@gmail.com"
          style={{...inp, marginBottom:".75rem"}} autoFocus disabled={locked} />
        <label style={lbl}>{al.password}</label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="••••••••"
          style={{...inp, marginBottom:".5rem", borderColor:loginErr?RED:BORDER}} disabled={locked} />
        {loginErr && !locked && <p style={msgErr}>{loginErr}</p>}
        <button onClick={handleLogin} disabled={locked}
          style={{...btnPrimary, width:"100%", marginTop:".75rem", opacity:locked?.5:1}}>
          {al.signInBtn}
        </button>
      </div>
    </div>
  );

  const TABS = [
    { id:"announce", label:al.tabs.announce },
    { id:"news",     label:al.tabs.news },
    { id:"gallery",  label:al.tabs.gallery },
    { id:"orders",   label:al.tabs.orders },
    { id:"stats",    label:al.tabs.stats },
  ];

  return (
    <div style={{ minHeight:"100vh", background:BG, padding:"2rem 1.5rem" }}>
      <div style={{ maxWidth:"920px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:INK, marginBottom:".2rem" }}>
              <span style={{ color:RED }}>Kizuna</span> Admin
            </h1>
            <p style={{ fontSize:".75rem", color:MUTED, fontFamily:"'Inter',sans-serif" }}>{session.user.email}</p>
          </div>
          <div style={{ display:"flex", gap:".75rem", alignItems:"center" }}>
            <div style={{display:"flex",gap:".3rem"}}>
              {["en","fr","ja"].map(l => <button key={l} onClick={()=>{setAdminLang(l);localStorage.setItem("admin-lang",l);}} style={{padding:".25rem .55rem",borderRadius:"6px",border:"1px solid",borderColor:adminLang===l?RED:BORDER,background:adminLang===l?RED:"transparent",color:adminLang===l?"#fff":MUTED,fontSize:".62rem",cursor:"pointer"}}>{l.toUpperCase()}</button>)}
            </div>
            <a href="/" style={{ fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:MUTED, textDecoration:"none", fontFamily:"'Inter',sans-serif" }}>{al.backToSite}</a>
            <button onClick={()=>supabase.auth.signOut()} style={btnGhost}>{al.signOut}</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"4px", marginBottom:"2rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:".6rem 1.3rem", borderRadius:"8px", border:"none", cursor:"pointer",
              fontFamily:"'Inter',sans-serif", fontSize:".68rem", letterSpacing:".1em",
              textTransform:"uppercase" as const, fontWeight:500,
              background: tab===t.id ? RED : SURFACE,
              color: tab===t.id ? "#fff" : MUTED,
              transition:"all .15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab==="announce" && <AnnounceTab al={al} />}
        {tab==="news"     && <NewsTab al={al} />}
        {tab==="gallery"  && <GalleryTab al={al} />}
        {tab==="orders"   && <OrdersTab supabase={supabase} al={al} />}
        {tab==="stats"    && <StatsTab supabase={supabase} al={al} />}
      </div>
    </div>
  );
}

// ─── ANNOUNCE TAB ─────────────────────────────────────────────────────────────
function AnnounceTab({ al }) {
  const [data,   setData]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("announce").select("*").limit(1).single();
    if (data) setData(data);
  }
  async function save() {
    setSaving(true);
    await supabase.from("announce").update({
      text_en: data.text_en, from_date: data.from_date,
      to_date: data.to_date, active: data.active,
      updated_at: new Date().toISOString()
    }).eq("id", data.id);
    setSaving(false);
    setMsg(al.bannerSaved); setTimeout(()=>setMsg(""),3000);
  }

  if (!data) return <p style={{color:MUTED,fontSize:".85rem",padding:"1rem"}}>Loading…</p>;

  return (
    <div style={card}>
      <p style={cardHeader}>📢 Announcement Banner</p>

      {/* Toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem", padding:"1rem 1.2rem", background:data.active?"rgba(74,222,128,.06)":"rgba(255,255,255,.03)", border:`1px solid ${data.active?"rgba(74,222,128,.2)":BORDER}`, borderRadius:"8px" }}>
        <label style={{ display:"flex", alignItems:"center", gap:".7rem", cursor:"pointer", fontSize:".85rem", color:INK, fontWeight:500, userSelect:"none", fontFamily:"'Inter',sans-serif" }}>
          <input type="checkbox" checked={data.active} onChange={e=>setData(d=>({...d,active:e.target.checked}))}
            style={{ width:"18px", height:"18px", accentColor:RED, cursor:"pointer" }} />
          {data.active ? al.bannerVisible : al.bannerHidden}
        </label>
      </div>

      {/* Message */}
      <div style={{ marginBottom:"1rem" }}>
        <label style={lbl}>{al.bannerMsg}</label>
        <input style={inp} value={data.text_en||""} onChange={e=>setData(d=>({...d,text_en:e.target.value}))}
          placeholder="Orders paused from April 20 to June 1" />
        <p style={{ fontSize:".68rem", color:MUTED, marginTop:".4rem", fontFamily:"'Inter',sans-serif" }}>This message appears at the top of the site.</p>
      </div>

      {/* Dates */}
      <div style={row2}>
        <div>
          <label style={lbl}>{al.bannerFrom}</label>
          <input style={inp} value={data.from_date||""} onChange={e=>setData(d=>({...d,from_date:e.target.value}))} placeholder="April 20" />
        </div>
        <div>
          <label style={lbl}>{al.bannerTo}</label>
          <input style={inp} value={data.to_date||""} onChange={e=>setData(d=>({...d,to_date:e.target.value}))} placeholder="June 1" />
        </div>
      </div>

      {/* Preview */}
      {data.active && (
        <div style={{ margin:"1rem 0", padding:".7rem 1.2rem", background:"#080809", borderLeft:`3px solid ${RED}`, fontSize:".78rem", color:"rgba(244,244,245,.7)", display:"flex", gap:".6rem", alignItems:"center", borderRadius:"0 8px 8px 0", fontFamily:"'Inter',sans-serif" }}>
          <span style={{ background:RED, color:"#fff", fontSize:".58rem", letterSpacing:".12em", textTransform:"uppercase", padding:".12rem .45rem", flexShrink:0, borderRadius:"4px" }}>Notice</span>
          <span>{data.text_en} {data.from_date&&<strong style={{color:INK}}>{data.from_date}</strong>}{data.to_date&&<> → <strong style={{color:INK}}>{data.to_date}</strong></>}</span>
        </div>
      )}

      {msg && <p style={msgOk}>{msg}</p>}
      <button onClick={save} disabled={saving} style={btnPrimary}>{saving?al.bannerSaving:al.bannerSave}</button>
    </div>
  );
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────
function NewsTab({ al }) {
  const [items,   setItems]   = useState([]);
  const [form,    setForm]    = useState(emptyNews);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("news").select("*").order("published_at",{ascending:false});
    setItems(data||[]);
  }
  async function save() {
    if (!form.title||!form.content) { setMsg(al.titleRequired); return; }
    setSaving(true);
    if (editing) await supabase.from("news").update({...form,published_at:new Date().toISOString()}).eq("id",editing);
    else await supabase.from("news").insert({...form,published_at:new Date().toISOString()});
    setSaving(false); setForm(emptyNews); setEditing(null);
    setMsg(editing?al.updated:al.published); setTimeout(()=>setMsg(""),3000); load();
  }
  async function del(id) {
    if (!confirm("Delete this article?")) return;
    await supabase.from("news").delete().eq("id",id); load();
  }

  const cat = NEWS_CATS.find(c=>c.value===form.category)||NEWS_CATS[0];

  return (
    <>
      <div style={card}>
        <p style={cardHeader}>{editing?"✏️ Edit article":"➕ New article"}</p>
        <div style={{marginBottom:"1rem"}}>
          <label style={lbl}>Title *</label>
          <input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Weekly shipping update" />
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={lbl}>Content *</label>
          <textarea style={{...inp,minHeight:"120px",resize:"vertical"}} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder="Details of the announcement…" />
        </div>
        <div style={{marginBottom:"1.25rem"}}>
          <label style={lbl}>Category</label>
          <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
            {NEWS_CATS.map(c=>(
              <button key={c.value} onClick={()=>setForm(f=>({...f,category:c.value}))} style={{
                padding:".4rem .9rem", borderRadius:"20px", border:`1px solid ${form.category===c.value?c.color:BORDER}`,
                background:form.category===c.value?`${c.color}22`:"transparent",
                color:form.category===c.value?c.color:MUTED,
                fontSize:".68rem", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all .15s",
              }}>{c.label}</button>
            ))}
          </div>
        </div>
        {msg&&<p style={msg.startsWith("✓")?msgOk:msgErr}>{msg}</p>}
        <div style={{display:"flex",gap:".75rem"}}>
          <button onClick={save} disabled={saving} style={btnPrimary}>{saving?al.sending:editing?al.update:al.publish}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(emptyNews);}} style={btnGhost}>{al.cancel}</button>}
        </div>
      </div>

      {/* Articles list */}
      <div style={{display:"flex",flexDirection:"column",gap:"1px",background:BORDER,border:`1px solid ${BORDER}`,borderRadius:"12px",overflow:"hidden"}}>
        {items.length===0 ? (
          <p style={{padding:"2rem",fontSize:".85rem",color:MUTED,textAlign:"center",background:SURFACE}}>No articles yet.</p>
        ) : items.map(item=>(
          <div key={item.id} style={{background:SURFACE,padding:"1.1rem 1.4rem",display:"flex",alignItems:"flex-start",gap:"1rem"}}>
            <span style={{display:"inline-block",fontSize:".58rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"#fff",background:NEWS_CATS.find(c=>c.value===item.category)?.color||"#333",padding:".18rem .55rem",borderRadius:"4px",flexShrink:0,marginTop:"2px"}}>
              {NEWS_CATS.find(c=>c.value===item.category)?.label||item.category}
            </span>
            <div style={{flex:1,minWidth:0}}>
              <strong style={{fontSize:".88rem",color:INK,display:"block",marginBottom:".25rem"}}>{item.title}</strong>
              <p style={{fontSize:".78rem",color:MUTED,margin:0,lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.content}</p>
              <span style={{fontSize:".65rem",color:MUTED,marginTop:".4rem",display:"block"}}>
                {new Date(item.published_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
              </span>
            </div>
            <div style={{display:"flex",gap:".4rem",flexShrink:0}}>
              <button onClick={()=>{setEditing(item.id);setForm({title:item.title,content:item.content,category:item.category});window.scrollTo({top:0,behavior:"smooth"});}} style={btnSmall}>Edit</button>
              <button onClick={()=>del(item.id)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── GALLERY TAB ─────────────────────────────────────────────────────────────
function GalleryTab({ al }) {
  const [items,     setItems]     = useState([]);
  const [form,      setForm]      = useState(emptyGallery);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg,       setMsg]       = useState("");
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("gallery").select("*").order("sort_order");
    setItems(data||[]);
  }

  async function uploadImage(file) {
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const name = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(name, file, { upsert: true });
    if (error) { setMsg("Upload failed: "+error.message); setUploading(false); return null; }
    const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(name);
    setUploading(false);
    return publicUrl;
  }

  async function save() {
    if (!form.title||!form.image_url) { setMsg(al.titleImgRequired); return; }
    setSaving(true);
    const nextOrder = editing ? Number(form.sort_order) : (items.length>0?Math.max(...items.map(i=>i.sort_order))+1:0);
    const p = { title:form.title, subtitle:form.subtitle, image_url:form.image_url, sort_order:nextOrder };
    if (editing) await supabase.from("gallery").update(p).eq("id",editing);
    else await supabase.from("gallery").insert(p);
    setSaving(false); setForm(emptyGallery); setEditing(null);
    setMsg(editing?al.photoUpdated:al.photoAdded); setTimeout(()=>setMsg(""),3000); load();
  }

  async function del(id, image_url) {
    if (!confirm("Delete this photo?")) return;
    const filename = image_url.split("/").pop();
    await supabase.storage.from("gallery").remove([filename]);
    await supabase.from("gallery").delete().eq("id",id);
    load();
  }

  async function moveOrder(id, dir) {
    const idx = items.findIndex(i=>i.id===id);
    const target = items[idx+dir];
    if (!target) return;
    await supabase.from("gallery").update({sort_order:target.sort_order}).eq("id",id);
    await supabase.from("gallery").update({sort_order:items[idx].sort_order}).eq("id",target.id);
    load();
  }

  return (
    <>
      <div style={card}>
        <p style={cardHeader}>{editing?"✏️ Edit photo":"➕ Add photo"}</p>
        <div style={row2}>
          <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Pokémon Center Tokyo" /></div>
          <div><label style={lbl}>Subtitle</label><input style={inp} value={form.subtitle} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))} placeholder="Rare cards · Japan" /></div>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={lbl}>Image URL or upload</label>
          <input style={{...inp,marginBottom:".5rem"}} value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://… or upload below" />
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{
            const file=e.target.files?.[0]; if(!file) return;
            const url=await uploadImage(file);
            if(url) setForm(f=>({...f,image_url:url}));
          }} />
          <button onClick={()=>fileRef.current?.click()} style={{...btnGhost,fontSize:".65rem"}} disabled={uploading}>
            {uploading?"⏳ Uploading…":"📁 Upload image"}
          </button>
        </div>
        {form.image_url && (
          <div style={{marginBottom:"1rem"}}>
            <img src={form.image_url} alt="preview" style={{height:"120px",objectFit:"cover",borderRadius:"8px",border:`1px solid ${BORDER}`}} />
          </div>
        )}
        {msg&&<p style={msg.startsWith("✓")?msgOk:msgErr}>{msg}</p>}
        <div style={{display:"flex",gap:".75rem"}}>
          <button onClick={save} disabled={saving||uploading} style={btnPrimary}>{saving?al.sending:editing?al.update:al.addPhotoBtn}</button>
          {editing&&<button onClick={()=>{setEditing(null);setForm(emptyGallery);}} style={btnGhost}>Cancel</button>}
        </div>
      </div>

      {/* Gallery grid */}
      <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:"12px",overflow:"hidden"}}>
        <p style={{...cardHeader,padding:"1rem 1.4rem",borderBottom:`1px solid ${BORDER}`,margin:0}}>Gallery — {items.length} photo{items.length!==1?"s":""}</p>
        {items.length===0 ? (
          <p style={{padding:"2rem",fontSize:".85rem",color:MUTED,textAlign:"center"}}>No photos yet. Add your first one above.</p>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"1px",background:BORDER}}>
            {items.map((item,idx)=>(
              <div key={item.id} style={{background:SURFACE,padding:"1rem",display:"flex",flexDirection:"column",gap:".6rem"}}>
                <img src={item.image_url} alt={item.title} style={{width:"100%",height:"120px",objectFit:"cover",borderRadius:"8px"}}
                  onError={e=>{(e.target as HTMLImageElement).style.opacity=".3";}} />
                <div>
                  <strong style={{fontSize:".82rem",color:INK,display:"block"}}>{item.title}</strong>
                  {item.subtitle&&<span style={{fontSize:".7rem",color:MUTED}}>{item.subtitle}</span>}
                </div>
                <div style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
                  <button onClick={()=>moveOrder(item.id,-1)} disabled={idx===0} style={{...btnSmall,padding:".25rem .5rem"}}>↑</button>
                  <button onClick={()=>moveOrder(item.id,1)} disabled={idx===items.length-1} style={{...btnSmall,padding:".25rem .5rem"}}>↓</button>
                  <button onClick={()=>{setEditing(item.id);setForm({title:item.title,subtitle:item.subtitle||"",image_url:item.image_url,sort_order:item.sort_order});window.scrollTo({top:0,behavior:"smooth"});}} style={btnSmall}>Edit</button>
                  <button onClick={()=>del(item.id,item.image_url)} style={btnDanger}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// @ts-nocheck
// Paste this inside admin-page.tsx as a new OrdersTab component
// Add "📦 Orders" to the TABS array

function OrdersTab({ supabase, al }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const emptyOrder = {
    client_name: "", platform: "Reddit", communication: "Discord",
    items: "", item_price_jpy: 0, service_fee_jpy: 0,
    payment_method: "PayPal / Goods & Services", payment_received: true,
    status: "Pending", purchase_date: new Date().toISOString().split('T')[0],
    shipping_method: "", tracking_number: "", delivery_country: "", notes: "",
  };
  const [form, setForm] = useState(emptyOrder);

  const STATUSES = ["Pending","Purchased","Purchased — Awaiting Delivery","Purchased — Awaiting Event","Shipped","Delivered","Action Required","Cancelled"];
  const STATUS_COLORS = {
    "Delivered":           "#4ade80",
    "Shipped":             "#60a5fa",
    "Purchased":           "#f59e0b",
    "Purchased — Awaiting Delivery": "#f59e0b",
    "Purchased — Awaiting Event":    "#f59e0b",
    "Action Required":     "#ef4444",
    "Pending":             "#6b7280",
    "Cancelled":           "#374151",
  };

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("purchase_date", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.client_name) { setMsg(al.clientRequired); return; }
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (editing) {
      await supabase.from("orders").update(payload).eq("id", editing);
    } else {
      await supabase.from("orders").insert(payload);
    }
    setSaving(false);
    setForm(emptyOrder);
    setEditing(null);
    setShowForm(false);
    setMsg(editing ? al.orderUpdated : al.orderAdded);
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function del(id) {
    if (!confirm("Delete this order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    load();
  }

  function startEdit(order) {
    setForm({ ...order });
    setEditing(order.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Filtered + searched orders
  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || 
      o.client_name?.toLowerCase().includes(q) ||
      o.items?.toLowerCase().includes(q) ||
      o.delivery_country?.toLowerCase().includes(q) ||
      o.tracking_number?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const totalFee   = orders.reduce((s, o) => s + (o.service_fee_jpy || 0), 0);
  const delivered  = orders.filter(o => o.status === "Delivered").length;
  const active     = orders.filter(o => !["Delivered","Cancelled"].includes(o.status)).length;
  const actionReq  = orders.filter(o => o.status === "Action Required").length;

  const f = form;
  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"1.5rem" }}>
        {[
          { label:al.totalOrders,      value: orders.length,           color:"var(--ink)" },
          { label:al.totalFees,  value:`¥${totalFee.toLocaleString()}`, color:"#4ade80" },
          { label:al.activeOrders,     value: active,                   color:"#60a5fa" },
          { label:al.actionRequired,   value: actionReq,                color: actionReq > 0 ? "#ef4444" : "var(--warm)" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"10px", padding:"1.1rem 1.2rem" }}>
            <div style={{ fontSize:"1.4rem", fontWeight:600, color:s.color, fontFamily:"'Cormorant Garamond',serif" }}>{s.value}</div>
            <div style={{ fontSize:".65rem", color:"var(--mist)", letterSpacing:".08em", marginTop:".2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── New order button ── */}
      {!showForm && (
        <button onClick={() => { setForm(emptyOrder); setEditing(null); setShowForm(true); }}
          style={{ ...btnPrimary, marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:".5rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New order
        </button>
      )}

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div style={card}>
          <p style={cardHeader}>{editing ? "✏️ Edit order" : "➕ New order"}</p>
          {msg && <p style={msg.startsWith("✓") ? msgOk : msgErr}>{msg}</p>}

          <div style={row2}>
            <div><label style={lbl}>Client name *</label><input style={inp} value={f.client_name} onChange={e=>setF("client_name",e.target.value)} placeholder="e.g. Konstantinos" /></div>
            <div><label style={lbl}>Country</label><input style={inp} value={f.delivery_country} onChange={e=>setF("delivery_country",e.target.value)} placeholder="Greece" /></div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl}>Platform</label>
              <select style={inp} value={f.platform} onChange={e=>setF("platform",e.target.value)}>
                {["Reddit","Kizuna website","Fiverr","Instagram","Other"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Communication</label>
              <select style={inp} value={f.communication} onChange={e=>setF("communication",e.target.value)}>
                {["Discord","WhatsApp","Reddit DM","Email","Instagram","Line","Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={lbl}>Items *</label>
            <textarea style={{ ...inp, minHeight:"80px", resize:"vertical" }} value={f.items} onChange={e=>setF("items",e.target.value)} placeholder="Describe the items or paste links" />
          </div>

          <div style={row2}>
            <div><label style={lbl}>Item price (JPY)</label><input style={inp} type="number" value={f.item_price_jpy} onChange={e=>setF("item_price_jpy",+e.target.value)} /></div>
            <div><label style={lbl}>Service fee (JPY)</label><input style={inp} type="number" value={f.service_fee_jpy} onChange={e=>setF("service_fee_jpy",+e.target.value)} /></div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl}>Status</label>
              <select style={inp} value={f.status} onChange={e=>setF("status",e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Purchase date</label><input style={inp} type="date" value={f.purchase_date || ""} onChange={e=>setF("purchase_date",e.target.value)} /></div>
          </div>

          <div style={row2}>
            <div><label style={lbl}>Shipping method</label><input style={inp} value={f.shipping_method} onChange={e=>setF("shipping_method",e.target.value)} placeholder="EMS, FedEx, DHL…" /></div>
            <div><label style={lbl}>Tracking number</label><input style={inp} value={f.tracking_number} onChange={e=>setF("tracking_number",e.target.value)} placeholder="EN123456789JP" /></div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl}>Payment method</label>
              <select style={inp} value={f.payment_method} onChange={e=>setF("payment_method",e.target.value)}>
                {["PayPal / Goods & Services","PayPal / Friends & Family","Fiverr Payment","Bank Transfer","Other"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
              <label style={{ display:"flex", alignItems:"center", gap:".5rem", cursor:"pointer", marginBottom:".5rem" }}>
                <input type="checkbox" checked={f.payment_received} onChange={e=>setF("payment_received",e.target.checked)} style={{ accentColor:"var(--red)", width:16, height:16 }} />
                <span style={{ fontSize:".82rem", color:"var(--ink)" }}>Payment received</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <label style={lbl}>Notes</label>
            <textarea style={{ ...inp, minHeight:"60px", resize:"vertical" }} value={f.notes || ""} onChange={e=>setF("notes",e.target.value)} placeholder="Internal notes…" />
          </div>

          <div style={{ display:"flex", gap:".75rem" }}>
            <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? al.sending : editing ? al.update : al.addOrder}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyOrder); }} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display:"flex", gap:".75rem", flexWrap:"wrap", marginBottom:"1rem" }}>
        <input
          style={{ ...inp, flex:1, minWidth:"200px", padding:".6rem 1rem" }}
          placeholder={al.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inp, width:"auto", padding:".6rem 1rem" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ padding:".6rem 1rem", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", fontSize:".75rem", color:"var(--warm)", display:"flex", alignItems:"center" }}>
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Orders table ── */}
      {loading ? (
        <p style={{ color:"var(--warm)", padding:"2rem", textAlign:"center" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color:"var(--warm)", padding:"2rem", textAlign:"center" }}>No orders found.</p>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, fontSize:".78rem" }}>
            <thead>
              <tr>
                {["Client","Items","Fee (JPY)","Status","Date","Country","Tracking",""].map(h => (
                  <th key={h} style={{ padding:".6rem .8rem", textAlign:"left", fontSize:".58rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--mist)", borderBottom:"1px solid var(--border)", background:"var(--paper)", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--paper)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "var(--surface)" : "var(--paper)"}>
                  <td style={{ padding:".7rem .8rem", color:"var(--ink)", fontWeight:500, whiteSpace:"nowrap" }}>{o.client_name}</td>
                  <td style={{ padding:".7rem .8rem", color:"var(--warm)", maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={o.items}>{o.items}</td>
                  <td style={{ padding:".7rem .8rem", color:"#4ade80", fontWeight:500, whiteSpace:"nowrap" }}>¥{(o.service_fee_jpy||0).toLocaleString()}</td>
                  <td style={{ padding:".7rem .8rem", whiteSpace:"nowrap" }}>
                    <span style={{ display:"inline-block", padding:".15rem .55rem", borderRadius:"20px", fontSize:".62rem", fontWeight:500, background:`${STATUS_COLORS[o.status] || "#6b7280"}22`, color: STATUS_COLORS[o.status] || "var(--warm)" }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding:".7rem .8rem", color:"var(--warm)", whiteSpace:"nowrap" }}>{o.purchase_date ? new Date(o.purchase_date).toLocaleDateString("fr-FR") : "—"}</td>
                  <td style={{ padding:".7rem .8rem", color:"var(--warm)", whiteSpace:"nowrap" }}>{o.delivery_country || "—"}</td>
                  <td style={{ padding:".7rem .8rem" }}>
                    {o.tracking_number ? (
                      <a href={`https://www.17track.net/en/track?nums=${o.tracking_number}`} target="_blank" rel="noopener noreferrer"
                        style={{ color:"var(--red)", fontSize:".68rem", textDecoration:"none" }}>
                        {o.tracking_number}
                      </a>
                    ) : <span style={{ color:"var(--mist)" }}>—</span>}
                  </td>
                  <td style={{ padding:".7rem .8rem", whiteSpace:"nowrap" }}>
                    <button onClick={() => startEdit(o)} style={{ ...btnSmall, marginRight:"4px" }}>Edit</button>
                    <button onClick={() => del(o.id)} style={btnDanger}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Revenue summary ── */}
      <div style={{ marginTop:"1.5rem", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"10px", padding:"1.2rem 1.5rem" }}>
        <p style={cardHeader}>Revenue summary</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
          <div>
            <div style={{ fontSize:".65rem", color:"var(--mist)", marginBottom:".3rem" }}>Total fees (JPY)</div>
            <div style={{ fontSize:"1.4rem", fontFamily:"'Cormorant Garamond',serif", color:"#4ade80" }}>¥{totalFee.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize:".65rem", color:"var(--mist)", marginBottom:".3rem" }}>Est. EUR (÷145)</div>
            <div style={{ fontSize:"1.4rem", fontFamily:"'Cormorant Garamond',serif", color:"#4ade80" }}>{(totalFee/145).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0})}€</div>
          </div>
          <div>
            <div style={{ fontSize:".65rem", color:"var(--mist)", marginBottom:".3rem" }}>Orders delivered</div>
            <div style={{ fontSize:"1.4rem", fontFamily:"'Cormorant Garamond',serif", color:"var(--ink)" }}>{delivered} / {orders.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab({ supabase, al }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("JPY");

  useEffect(() => {
    supabase.from("orders").select("*").then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{color:"var(--warm)",padding:"2rem",textAlign:"center"}}>Loading…</p>;

  const RATE = 145; // JPY to EUR

  // ── Monthly revenue ──────────────────────────────────────────────
  const monthlyMap = {};
  orders.forEach(o => {
    if (!o.purchase_date || !o.service_fee_jpy) return;
    const key = o.purchase_date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[key]) monthlyMap[key] = { fee: 0, count: 0 };
    monthlyMap[key].fee   += o.service_fee_jpy;
    monthlyMap[key].count += 1;
  });

  const months = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      label: new Date(key + "-01").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      fee: val.fee,
      count: val.count,
      eur: Math.round(val.fee / RATE),
    }));

  const maxFee = Math.max(...months.map(m => m.fee), 1);
  const totalFee = orders.reduce((s, o) => s + (o.service_fee_jpy || 0), 0);
  const avgFee = orders.length ? Math.round(totalFee / orders.length) : 0;
  const bestMonth = months.reduce((best, m) => m.fee > (best?.fee || 0) ? m : best, null);

  // ── Country breakdown ─────────────────────────────────────────────
  const countryMap = {};
  orders.forEach(o => {
    if (!o.delivery_country) return;
    const c = o.delivery_country.trim();
    if (!countryMap[c]) countryMap[c] = { count: 0, fee: 0 };
    countryMap[c].count += 1;
    countryMap[c].fee += o.service_fee_jpy || 0;
  });
  const countries = Object.entries(countryMap)
    .sort(([,a],[,b]) => b.count - a.count)
    .slice(0, 8);
  const maxCountry = Math.max(...countries.map(([,v]) => v.count), 1);

  // ── Platform breakdown ────────────────────────────────────────────
  const platformMap = {};
  orders.forEach(o => {
    const p = o.platform?.trim() || "Unknown";
    if (!platformMap[p]) platformMap[p] = 0;
    platformMap[p] += 1;
  });
  const platforms = Object.entries(platformMap).sort(([,a],[,b]) => b - a);

  // ── Status breakdown ──────────────────────────────────────────────
  const STATUS_COLORS = {
    "Delivered": "#4ade80", "Shipped": "#60a5fa",
    "Purchased": "#f59e0b", "Action Required": "#ef4444",
    "Pending": "#6b7280", "Cancelled": "#374151",
  };
  const statusMap = {};
  orders.forEach(o => {
    const s = o.status?.includes("Purchased") ? "Purchased" : (o.status || "Unknown");
    statusMap[s] = (statusMap[s] || 0) + 1;
  });

  const fmt = (jpy) => currency === "EUR"
    ? `${Math.round(jpy / RATE).toLocaleString("fr-FR")}€`
    : `¥${jpy.toLocaleString()}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

      {/* Currency toggle */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:".5rem" }}>
        {["JPY","EUR"].map(c => (
          <button key={c} onClick={() => setCurrency(c)} style={{
            padding:".35rem .9rem", borderRadius:"6px", border:"1px solid",
            borderColor: currency===c ? "var(--red)" : "var(--border)",
            background: currency===c ? "var(--red)" : "var(--surface)",
            color: currency===c ? "#fff" : "var(--warm)",
            fontSize:".68rem", cursor:"pointer", fontFamily:"'Inter',sans-serif",
          }}>{c}</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
        {[
          { label:al.totalEarned,      value: fmt(totalFee),        sub: `${orders.length} orders`, color:"#4ade80" },
          { label:al.avgPerOrder,     value: fmt(avgFee),          sub: al.serviceAvg, color:"var(--ink)" },
          { label:al.bestMonth,        value: bestMonth?.label || "—", sub: bestMonth ? fmt(bestMonth.fee) : "—", color:"#f59e0b" },
          { label:"Delivered",         value: orders.filter(o=>o.status==="Delivered").length, sub: `of ${orders.length} total`, color:"#4ade80" },
        ].map(k => (
          <div key={k.label} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"10px", padding:"1.1rem 1.2rem" }}>
            <div style={{ fontSize:"1.5rem", fontWeight:600, color:k.color, fontFamily:"'Cormorant Garamond',serif", lineHeight:1.1 }}>{k.value}</div>
            <div style={{ fontSize:".65rem", color:"var(--mist)", marginTop:".3rem" }}>{k.label}</div>
            <div style={{ fontSize:".68rem", color:"var(--warm)", marginTop:".15rem" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <p style={cardHeader}>Monthly revenue</p>
          <span style={{ fontSize:".68rem", color:"var(--mist)" }}>Service fees only</span>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"180px", overflowX:"auto", paddingBottom:".5rem" }}>
          {months.map((m, i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", flex:"0 0 auto", minWidth:"42px" }}>
              {/* Value on hover */}
              <div style={{ fontSize:".6rem", color:"var(--warm)", textAlign:"center", minHeight:"16px" }}>
                {fmt(m.fee)}
              </div>
              {/* Bar */}
              <div style={{
                width:"32px", borderRadius:"4px 4px 0 0",
                height:`${Math.round((m.fee / maxFee) * 140)}px`,
                background: i === months.length - 1
                  ? "var(--red)"
                  : `linear-gradient(to top, rgba(224,48,64,.6), rgba(224,48,64,.3))`,
                transition:"height .3s",
                position:"relative",
                minHeight:"4px",
              }} />
              {/* Label */}
              <div style={{ fontSize:".58rem", color:"var(--mist)", whiteSpace:"nowrap" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Country + Platform side by side */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>

        {/* Country breakdown */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.5rem" }}>
          <p style={cardHeader}>Top countries</p>
          <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
            {countries.map(([country, val]) => (
              <div key={country}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".25rem" }}>
                  <span style={{ fontSize:".78rem", color:"var(--ink)" }}>{country}</span>
                  <span style={{ fontSize:".72rem", color:"var(--warm)" }}>{val.count} orders</span>
                </div>
                <div style={{ height:"4px", background:"var(--border)", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(val.count/maxCountry)*100}%`, background:"var(--red)", borderRadius:"2px", transition:"width .3s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform + Status */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

          {/* Platform */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.2rem" }}>
            <p style={cardHeader}>Sources</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem" }}>
              {platforms.map(([p, count]) => (
                <div key={p} style={{ background:"var(--paper)", border:"1px solid var(--border)", borderRadius:"20px", padding:".3rem .8rem", fontSize:".72rem", color:"var(--warm)" }}>
                  {p} <strong style={{ color:"var(--ink)" }}>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.2rem" }}>
            <p style={cardHeader}>Order status</p>
            <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
              {Object.entries(statusMap).sort(([,a],[,b])=>b-a).map(([status, count]) => (
                <div key={status} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                    <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: STATUS_COLORS[status] || "var(--mist)" }} />
                    <span style={{ fontSize:".75rem", color:"var(--warm)" }}>{status}</span>
                  </div>
                  <span style={{ fontSize:".75rem", fontWeight:500, color:"var(--ink)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"1.5rem" }}>
        <p style={cardHeader}>Monthly breakdown</p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".78rem" }}>
          <thead>
            <tr>
              {["Month","Orders","Revenue (JPY)","Revenue (EUR)","Avg/order"].map(h => (
                <th key={h} style={{ padding:".5rem .8rem", textAlign:"left", fontSize:".58rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--mist)", borderBottom:"1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...months].reverse().map((m, i) => (
              <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                <td style={{ padding:".6rem .8rem", color:"var(--ink)", fontWeight:500 }}>{m.label}</td>
                <td style={{ padding:".6rem .8rem", color:"var(--warm)" }}>{m.count}</td>
                <td style={{ padding:".6rem .8rem", color:"#4ade80" }}>¥{m.fee.toLocaleString()}</td>
                <td style={{ padding:".6rem .8rem", color:"#4ade80" }}>{m.eur.toLocaleString()}€</td>
                <td style={{ padding:".6rem .8rem", color:"var(--warm)" }}>¥{Math.round(m.fee/m.count).toLocaleString()}</td>
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ background:"var(--paper)" }}>
              <td style={{ padding:".7rem .8rem", color:"var(--ink)", fontWeight:600 }}>TOTAL</td>
              <td style={{ padding:".7rem .8rem", color:"var(--ink)", fontWeight:600 }}>{orders.length}</td>
              <td style={{ padding:".7rem .8rem", color:"#4ade80", fontWeight:600 }}>¥{totalFee.toLocaleString()}</td>
              <td style={{ padding:".7rem .8rem", color:"#4ade80", fontWeight:600 }}>{Math.round(totalFee/RATE).toLocaleString()}€</td>
              <td style={{ padding:".7rem .8rem", color:"var(--warm)" }}>¥{avgFee.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
