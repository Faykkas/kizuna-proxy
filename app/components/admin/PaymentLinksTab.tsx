// @ts-nocheck
"use client";
// app/components/admin/PaymentLinksTab.tsx
//
// A one-off payment link at a price you set, for a client who doesn't have
// (or doesn't want to use) a Kizuna account — they just get a /pay/<token>
// URL. PayPal's own checkout already lets someone without a PayPal account
// pay by debit/credit card as a guest, and it still lands in the same
// Kizuna PayPal business account as every other payment on the site.

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { formatJPY } from "../../lib/orderStatus";

const SITE_URL = "https://kizunaproxy.com";

export default function PaymentLinksTab({ tokens }) {
  const { BG, SURFACE, BORDER, RED, VIOLET, ALERT, INK, MUTED, BODY } = tokens;

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ label: "", item_amount_jpy: "", fee_amount_jpy: "", client_name: "", client_email: "" });
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("payment_links").select("*").order("created_at", { ascending: false });
    setLinks(data || []);
    setLoading(false);
  }

  async function createLink() {
    const itemAmount = Number(form.item_amount_jpy);
    const feeAmount = Number(form.fee_amount_jpy) || 0;
    if (!form.label.trim() || !itemAmount || itemAmount <= 0) {
      setMsg("Indique un libellé et un prix produit en yen valide.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.from("payment_links").insert({
      label: form.label.trim(),
      item_amount_jpy: itemAmount,
      fee_amount_jpy: feeAmount,
      amount_jpy: itemAmount + feeAmount,
      client_name: form.client_name.trim() || null,
      client_email: form.client_email.trim() || null,
      status: "pending",
    }).select().single();
    setCreating(false);
    if (error) {
      setMsg("Erreur : " + error.message);
      setTimeout(() => setMsg(""), 4000);
      return;
    }
    setLinks(prev => [data, ...prev]);
    setForm({ label: "", item_amount_jpy: "", fee_amount_jpy: "", client_name: "", client_email: "" });
  }

  async function cancelLink(id) {
    if (!confirm("Annuler ce lien de paiement ? Il ne sera plus payable.")) return;
    await supabase.from("payment_links").update({ status: "cancelled" }).eq("id", id);
    setLinks(prev => prev.map(l => l.id === id ? { ...l, status: "cancelled" } : l));
  }

  function copyLink(id) {
    const url = `${SITE_URL}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const STATUS_STYLE = {
    pending: { label: "En attente", color: VIOLET },
    paid: { label: "Payé", color: "#22c55e" },
    cancelled: { label: "Annulé", color: MUTED },
  };

  const inp = { width: "100%", padding: ".6rem .8rem", border: `1px solid ${BORDER}`, borderRadius: "7px", fontSize: ".85rem", fontFamily: BODY, background: BG, color: INK, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: ".68rem", fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: ".35rem", fontFamily: BODY };

  return (
    <div style={{ fontFamily: BODY }}>

      {/* Create form */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, marginBottom: "1rem" }}>Nouveau lien de paiement</p>
        <div style={{ marginBottom: ".8rem" }}>
          <label style={lbl}>Libellé (ce que le client voit)</label>
          <input style={inp} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex : Commande figurines x3 + envoi" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: ".8rem" }}>
          <div>
            <label style={lbl}>Prix produit (¥)</label>
            <input style={inp} type="number" min="1" value={form.item_amount_jpy} onChange={e => setForm(f => ({ ...f, item_amount_jpy: e.target.value }))} placeholder="12000" />
          </div>
          <div>
            <label style={lbl}>Frais Kizuna (¥)</label>
            <input style={inp} type="number" min="0" value={form.fee_amount_jpy} onChange={e => setForm(f => ({ ...f, fee_amount_jpy: e.target.value }))} placeholder="3000" />
          </div>
        </div>
        {(Number(form.item_amount_jpy) > 0 || Number(form.fee_amount_jpy) > 0) && (
          <p style={{ fontSize: ".78rem", color: MUTED, marginBottom: ".8rem" }}>
            Total facturé au client : <strong style={{ color: INK }}>{formatJPY((Number(form.item_amount_jpy) || 0) + (Number(form.fee_amount_jpy) || 0))}</strong> — apparaîtra en 2 lignes séparées (produit + frais) dans le paiement PayPal.
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: "1rem" }}>
          <div>
            <label style={lbl}>Nom du client (optionnel)</label>
            <input style={inp} value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Email du client (optionnel)</label>
            <input style={inp} type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="Rempli automatiquement avec l'email PayPal une fois payé" />
          </div>
        </div>
        <button onClick={createLink} disabled={creating} style={{ background: RED, color: "#fff", border: "none", padding: ".65rem 1.2rem", borderRadius: "8px", fontSize: ".82rem", fontWeight: 600, cursor: "pointer", opacity: creating ? .6 : 1 }}>
          {creating ? "Création…" : "Créer le lien"}
        </button>
        {msg && <p style={{ fontSize: ".78rem", color: msg.startsWith("Erreur") ? ALERT : MUTED, marginTop: ".7rem" }}>{msg}</p>}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Chargement…</p>
      ) : links.length === 0 ? (
        <p style={{ color: MUTED, fontSize: ".85rem", textAlign: "center", padding: "2rem" }}>Aucun lien de paiement pour l'instant.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
          {links.map(l => {
            const st = STATUS_STYLE[l.status] || STATUS_STYLE.pending;
            return (
              <div key={l.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".2rem", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: ".88rem", color: INK, wordBreak: "break-word", overflowWrap: "anywhere" }}>{l.label}</strong>
                    <span style={{ fontSize: ".65rem", fontWeight: 600, color: st.color, border: `1px solid ${st.color}`, borderRadius: "5px", padding: ".05rem .45rem", flexShrink: 0 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: ".78rem", color: MUTED, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {l.client_name && `${l.client_name} · `}{l.client_email && `${l.client_email} · `}
                    {new Date(l.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  {l.fee_amount_jpy > 0 && (
                    <div style={{ fontSize: ".72rem", color: MUTED, marginTop: ".2rem" }}>
                      Produit {formatJPY(l.item_amount_jpy)} + frais {formatJPY(l.fee_amount_jpy)}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 600, color: RED, whiteSpace: "nowrap", flexShrink: 0 }}>{formatJPY(l.amount_jpy)}</div>
                <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
                  {l.status === "pending" && (
                    <>
                      <button onClick={() => copyLink(l.id)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: copiedId === l.id ? "#22c55e" : INK, borderRadius: "6px", padding: ".4rem .7rem", fontSize: ".72rem", cursor: "pointer" }}>
                        {copiedId === l.id ? "✓ Copié" : "🔗 Copier"}
                      </button>
                      <button onClick={() => cancelLink(l.id)} style={{ background: "rgba(255,80,96,.1)", border: `1px solid rgba(255,80,96,.3)`, color: ALERT, borderRadius: "6px", padding: ".4rem .7rem", fontSize: ".72rem", cursor: "pointer" }}>
                        Annuler
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
