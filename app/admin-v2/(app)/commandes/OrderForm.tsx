"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrder, listProfiles, requestShippingPayment, updateOrder, type ProfileOption } from "./actions";
import { diffFields, EDITABLE_FIELDS, ORDER_STATUSES } from "../../lib/orderFields";
import { formatJPY } from "../../lib/money";
import PhotoManager from "../../components/PhotoManager";
import { useL } from "../../components/LangProvider";
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
  const { t, statusLabel } = useL();
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
        if (!r.ok) return setMsg({ kind: "error", text: t(r.error) });
        router.push(`${BASE}/commandes/${r.id}`);
        router.refresh();
        return;
      }
      const r = await updateOrder({ id, changes, before });
      if (!r.ok) return setMsg({ kind: "error", text: t(r.error) });
      setOriginal(form);
      setMsg({ kind: "ok", text: r.changed.length ? t("Enregistré ({n} champs).", { n: r.changed.length }) : t("Rien à enregistrer.") });
      router.refresh();
    });
  }

  function askPayment() {
    const cost = Number(text("shipping_cost_jpy"));
    if (!confirm(t("Demander {x} de livraison au client ? Le statut passera à « Livraison à payer » et le client sera prévenu.", { x: formatJPY(cost) }))) return;
    setMsg(null);
    start(async () => {
      const r = await requestShippingPayment(id, cost);
      if (!r.ok) return setMsg({ kind: "error", text: t(r.error) });
      setForm((f) => ({ ...f, shipping_cost_jpy: String(cost), shipping_paid: false, status: "Awaiting Shipping Payment" }));
      setOriginal((o) => ({ ...o, shipping_cost_jpy: String(cost), shipping_paid: false, status: "Awaiting Shipping Payment" }));
      setMsg({ kind: "ok", text: t("Paiement demandé : le client a été prévenu.") });
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
        <h2>{t("Statut")}</h2>
        <div className="av2-field">
          <select id="status" className="av2-select" value={text("status")} onChange={(e) => set("status", e.target.value)} aria-label={t("Statut de la commande")}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <span className="av2-sub">
            {statusChanged ? <strong>{t("Enregistrer ce changement de statut prévient le client automatiquement.")}</strong> : t("Changer le statut prévient le client automatiquement.")}
          </span>
        </div>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>{t("Client")}</h2>
          {field("client_name", t("Nom *"))}
          {field("client_email", t("Email"), { type: "email" })}
          {field("client_phone", t("Téléphone"), { type: "tel" })}
          <div className="av2-field">
            <label htmlFor="customer_id">{t("Compte client lié")}</label>
            <select id="customer_id" className="av2-select" value={text("customer_id")} onChange={(e) => set("customer_id", e.target.value)}>
              <option value="">{t("— Aucun compte lié —")}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="av2-sub">{text("customer_id") ? t("Le client voit cette commande dans son espace.") : t("Liez un compte pour que le client puisse suivre sa commande.")}</span>
          </div>
        </div>

        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>{t("Commande")}</h2>
          <div className="av2-field">
            <label htmlFor="platform">{t("Origine")}</label>
            <select id="platform" className="av2-select" value={text("platform")} onChange={(e) => set("platform", e.target.value)}>
              {[...new Set([text("platform"), ...PLATFORMS].filter(Boolean))].map((p) => (
                <option key={p} value={p}>{p === "Autre" ? t("Autre") : p}</option>
              ))}
            </select>
          </div>
          {field("communication", t("Contact via"))}
          {field("purchase_date", t("Date d'achat"), { type: "date" })}
          <span className="av2-sub" style={{ marginTop: "-0.4rem" }}>{t("Détermine le mois où la commission est comptée. Vide = aujourd'hui (heure de Tokyo).")}</span>
          {area("items", t("Articles"), 4)}
        </div>
      </div>

      <div className="av2-card">
        <h2>{t("Montants (¥)")}</h2>
        <div className="av2-grid cols-3">
          {field("item_price_jpy", t("Prix des articles"), { inputMode: "numeric" })}
          {field("service_fee_jpy", t("Commission Kizuna"), { inputMode: "numeric" })}
          {field("shipping_cost_jpy", t("Livraison"), { inputMode: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.8rem" }}>
          <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input type="checkbox" checked={!!form.shipping_paid} onChange={(e) => set("shipping_paid", e.target.checked)} /> {t("Livraison payée")}
          </label>
          <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input type="checkbox" checked={!!form.payment_received} onChange={(e) => set("payment_received", e.target.checked)} /> {t("Paiement reçu")}
          </label>
          {field("payment_method", t("Moyen de paiement"))}
          {mode === "edit" ? (
            <button type="button" className="av2-btn ghost" onClick={askPayment} disabled={pending}>{t("Demander le paiement de la livraison")}</button>
          ) : null}
        </div>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>{t("Expédition")}</h2>
          {field("shipping_method", t("Transporteur (EMS, Yamato…)"))}
          {field("tracking_number", t("Numéro de suivi"))}
          {field("delivery_country", t("Pays de destination"))}
          {area("shipping_address", t("Adresse de livraison"), 3)}
        </div>
        <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2>{t("Événement (facultatif)")}</h2>
          {field("event_name", t("Nom de l'événement"))}
          {field("event_date", t("Date"), { type: "date" })}
          {field("event_status", t("Situation (file d'attente, sur place…)"))}
          {field("event_result", t("Résultat"))}
        </div>
      </div>

      {mode === "edit" ? (
        <div className="av2-card">
          <h2>{t("Photos")}</h2>
          <PhotoManager orderId={id} onUploaded={() => router.refresh()} />
        </div>
      ) : null}

      <div className="av2-grid cols-2">
        <div className="av2-card">{area("notes", t("Note pour le client"), 3, t("Visible dans son espace client."))}</div>
        <div className="av2-card">{area("admin_notes", t("Note interne"), 3, t("Jamais montrée au client."))}</div>
      </div>

      <div className="av2-card" style={{ position: "sticky", bottom: "0.8rem", display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
        <button className="av2-btn" type="submit" disabled={pending || (mode === "edit" && !dirty)}>
          {pending ? t("Enregistrement…") : mode === "create" ? t("Créer la commande") : t("Enregistrer")}
        </button>
        <a className="av2-btn ghost" href={mode === "edit" ? `${BASE}/commandes/${id}` : `${BASE}/commandes`}>{t("Annuler")}</a>
        {mode === "edit" && dirty ? <span className="av2-sub">{t("{n} modification(s) non enregistrée(s)", { n: Object.keys(changes).length })}</span> : null}
        {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
      </div>
    </form>
  );
}
