"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrder, listProfiles, requestShippingPayment, updateOrder, type ProfileOption } from "./actions";
import { diffFields, EDITABLE_FIELDS, ORDER_STATUSES } from "../../lib/orderFields";
import { statusInfo } from "../../lib/status";
import { formatJPY } from "../../lib/money";
import PhotoManager from "../../components/PhotoManager";
import { BASE } from "../../lib/config";

type Order = Record<string, string | number | boolean | null | undefined>;

const PLATFORMS = ["Reddit", "Discord", "Website", "Kizuna website", "Payment link", "Fiverr", "Instagram", "Autre"];

function toForm(o: Order): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const k of EDITABLE_FIELDS) {
    const v = o[k];
    out[k] = typeof v === "boolean" ? v : v == null ? "" : String(v);
  }
  return out;
}

export default function OrderForm({ mode, order }: { mode: "create" | "edit"; order?: Order }) {
  const router = useRouter();
  const initial = useMemo(() => toForm(order ?? { platform: "Reddit", communication: "Discord", payment_method: "PayPal / Goods & Services", payment_received: true, status: "Pending", item_price_jpy: 0, service_fee_jpy: 0 }), [order]);
  const [original, setOriginal] = useState(initial);
  const [form, setForm] = useState(initial);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k: string) => String(form[k] ?? "");

  useEffect(() => {
    listProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, []);

  const { changes, before } = useMemo(() => diffFields(original, form), [original, form]);
  const dirty = Object.keys(changes).length > 0;
  const statusChanged = mode === "edit" && "status" in changes;
  const id = Number(order?.id);

  function save() {
    setMsg(null);
    start(async () => {
      if (mode === "create") {
        const r = await createOrder(form);
        if (!r.ok) return setMsg({ kind: "error", text: r.error });
        router.push(`${BASE}/commandes/${r.id}`);
        router.refresh();
        return;
      }
      const r = await updateOrder({ id, changes, before });
      if (!r.ok) return setMsg({ kind: "error", text: r.error });
      setOriginal(form);
      setMsg({ kind: "ok", text: r.changed.length ? `Enregistré (${r.changed.length} champ${r.changed.length > 1 ? "s" : ""}).` : "Rien à enregistrer." });
      router.refresh();
    });
  }

  function askPayment() {
    const cost = Number(text("shipping_cost_jpy"));
    if (!confirm(`Demander ${formatJPY(cost)} de livraison au client ? Le statut passera à « Livraison à payer » et le client sera prévenu.`)) return;
    setMsg(null);
    start(async () => {
      const r = await requestShippingPayment(id, cost);
      if (!r.ok) return setMsg({ kind: "error", text: r.error });
      setForm((f) => ({ ...f, shipping_cost_jpy: String(cost), shipping_paid: false, status: "Awaiting Shipping Payment" }));
      setOriginal((o) => ({ ...o, shipping_cost_jpy: String(cost), shipping_paid: false, status: "Awaiting Shipping Payment" }));
      setMsg({ kind: "ok", text: "Paiement demandé : le client a été prévenu." });
      router.refresh();
    });
  }

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="av2-field">
      <label htmlFor={k}>{label}</label>
      <input id={k} className="av2-input" value={text(k)} onChange={(e) => set(k, e.target.value)} {...props} />
    </div>
  );
  const area = (k: string, label: string, rows = 3, hint?: string) => (
    <div className="av2-field">
      <label htmlFor={k}>{label}</label>
      <textarea id={k} className="av2-input" style={{ maxWidth: "none", minHeight: `${rows * 1.6}rem`, resize: "vertical" }} value={text(k)} onChange={(e) => set(k, e.target.value)} />
      {hint ? <span className="av2-sub">{hint}</span> : null}
    </div>
  );

  return (
    <form className="av2-content" style={{ gap: "1rem" }} onSubmit={(e) => { e.preventDefault(); if (dirty || mode === "create") save(); }}>
      <div className="av2-card">
        <h2>Statut</h2>
        <div className="av2-field">
          <select id="status" className="av2-select" value={text("status")} onChange={(e) => set("status", e.target.value)} aria-label="Statut de la commande">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{statusInfo(s).label}</option>
            ))}
          </select>
          <span className="av2-sub">
            {statusChanged ? <strong>Enregistrer ce changement de statut prévient le client automatiquement.</strong> : "Changer le statut prévient le client automatiquement."}
          </span>
        </div>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>Client</h2>
          {field("client_name", "Nom *")}
          {field("client_email", "Email", { type: "email" })}
          {field("client_phone", "Téléphone", { type: "tel" })}
          <div className="av2-field">
            <label htmlFor="customer_id">Compte client lié</label>
            <select id="customer_id" className="av2-select" value={text("customer_id")} onChange={(e) => set("customer_id", e.target.value)}>
              <option value="">— Aucun compte lié —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="av2-sub">{text("customer_id") ? "Le client voit cette commande dans son espace." : "Liez un compte pour que le client puisse suivre sa commande."}</span>
          </div>
        </div>

        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>Commande</h2>
          <div className="av2-field">
            <label htmlFor="platform">Origine</label>
            <select id="platform" className="av2-select" value={text("platform")} onChange={(e) => set("platform", e.target.value)}>
              {[...new Set([text("platform"), ...PLATFORMS].filter(Boolean))].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {field("communication", "Contact via")}
          {field("purchase_date", "Date d'achat", { type: "date" })}
          <span className="av2-sub" style={{ marginTop: "-0.4rem" }}>Détermine le mois où la commission est comptée. Vide = aujourd'hui (heure de Tokyo).</span>
          {area("items", "Articles", 4)}
        </div>
      </div>

      <div className="av2-card">
        <h2>Montants (¥)</h2>
        <div className="av2-grid cols-3">
          {field("item_price_jpy", "Prix des articles", { inputMode: "numeric" })}
          {field("service_fee_jpy", "Commission Kizuna", { inputMode: "numeric" })}
          {field("shipping_cost_jpy", "Livraison", { inputMode: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.8rem" }}>
          <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input type="checkbox" checked={!!form.shipping_paid} onChange={(e) => set("shipping_paid", e.target.checked)} /> Livraison payée
          </label>
          <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input type="checkbox" checked={!!form.payment_received} onChange={(e) => set("payment_received", e.target.checked)} /> Paiement reçu
          </label>
          {field("payment_method", "Moyen de paiement")}
          {mode === "edit" ? (
            <button type="button" className="av2-btn ghost" onClick={askPayment} disabled={pending}>Demander le paiement de la livraison</button>
          ) : null}
        </div>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>Expédition</h2>
          {field("shipping_method", "Transporteur (EMS, DHL, Yamato…)")}
          {field("tracking_number", "Numéro de suivi")}
          {field("delivery_country", "Pays de destination")}
          {area("shipping_address", "Adresse de livraison", 3)}
        </div>
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>Événement (facultatif)</h2>
          {field("event_name", "Nom de l'événement")}
          {field("event_date", "Date", { type: "date" })}
          {field("event_status", "Situation (file d'attente, sur place…)")}
          {field("event_result", "Résultat")}
        </div>
      </div>

      {mode === "edit" ? (
        <div className="av2-card">
          <h2>Photos</h2>
          <PhotoManager orderId={id} onUploaded={() => router.refresh()} />
        </div>
      ) : null}

      <div className="av2-grid cols-2">
        <div className="av2-card">{area("notes", "Note pour le client", 3, "Visible dans son espace client.")}</div>
        <div className="av2-card">{area("admin_notes", "Note interne", 3, "Jamais montrée au client.")}</div>
      </div>

      <div className="av2-card" style={{ position: "sticky", bottom: "0.8rem", display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
        <button className="av2-btn" type="submit" disabled={pending || (mode === "edit" && !dirty)}>
          {pending ? "Enregistrement…" : mode === "create" ? "Créer la commande" : "Enregistrer"}
        </button>
        <a className="av2-btn ghost" href={mode === "edit" ? `${BASE}/commandes/${id}` : `${BASE}/commandes`}>Annuler</a>
        {mode === "edit" && dirty ? <span className="av2-sub">{Object.keys(changes).length} modification(s) non enregistrée(s)</span> : null}
        {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
      </div>
    </form>
  );
}
