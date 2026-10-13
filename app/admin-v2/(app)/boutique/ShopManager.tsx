"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { deleteShopItem, moveShopItem, saveSale, saveShopItem, setShopAvailable } from "./actions";
import type { ShopItemRow } from "../../lib/queries";
import { formatJPY, toYen } from "../../lib/money";
import { formatDateFr } from "../../lib/status";
import { useRun } from "../../components/useRun";
import ImageField from "../../components/ImageField";
import { Tag } from "../../components/ui";

const EMPTY = { id: "", name: "", image_url: "", price_jpy: "", fee_jpy: "6000" };

function SaleRow({ item }: { item: ShopItemRow }) {
  const { pending, msg, run } = useRun();
  const [buyer, setBuyer] = useState(item.buyer_name ?? "");
  const [shipBy, setShipBy] = useState(item.ship_by ?? "");
  const dirty = buyer !== (item.buyer_name ?? "") || shipBy !== (item.ship_by ?? "");
  const total = toYen(item.price_jpy).yen + toYen(item.fee_jpy).yen;
  return (
    <tr>
      <td>{item.name || "Sans nom"}</td>
      <td><input className="av2-input" style={{ maxWidth: 220 }} value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Acheteur" aria-label={`Acheteur de ${item.name}`} /></td>
      <td><input className="av2-input" style={{ maxWidth: 170 }} type="date" value={shipBy} onChange={(e) => setShipBy(e.target.value)} aria-label={`Date d'envoi de ${item.name}`} /></td>
      <td className="r">{formatJPY(total)}</td>
      <td>
        <button className="av2-btn ghost" disabled={!dirty || pending} onClick={() => run(() => saveSale(item.id, buyer, shipBy), "Vente enregistrée.")}>Enregistrer</button>
        {msg ? <small className={msg.kind === "error" ? "av2-error" : ""}>{msg.text}</small> : null}
      </td>
    </tr>
  );
}

export default function ShopManager({ items }: { items: ShopItemRow[] }) {
  const { pending, msg, run } = useRun();
  const [form, setForm] = useState(EMPTY);
  const editing = !!form.id;
  const onSale = items.filter((i) => i.available);
  const sold = items.filter((i) => !i.available);
  const total = (i: ShopItemRow) => toYen(i.price_jpy).yen + toYen(i.fee_jpy).yen;

  return (
    <>
      <form
        className="av2-card"
        style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveShopItem({ id: form.id || undefined, name: form.name, image_url: form.image_url, price_jpy: form.price_jpy, fee_jpy: form.fee_jpy }), editing ? "Article mis à jour." : "Article ajouté.", () => setForm(EMPTY));
        }}
      >
        <h2>{editing ? "Modifier l'article" : "Ajouter un article"}</h2>
        <div className="av2-field">
          <label htmlFor="shop-name">Nom *</label>
          <input id="shop-name" className="av2-input" style={{ maxWidth: "none" }} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={200} />
        </div>
        <ImageField label="Photo *" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="shop-price">Prix de l'article (¥) *</label>
            <input id="shop-price" className="av2-input" inputMode="numeric" value={form.price_jpy} onChange={(e) => setForm((f) => ({ ...f, price_jpy: e.target.value.replace(/\D/g, "") }))} />
          </div>
          <div className="av2-field">
            <label htmlFor="shop-fee">Frais Kizuna (¥)</label>
            <input id="shop-fee" className="av2-input" inputMode="numeric" value={form.fee_jpy} onChange={(e) => setForm((f) => ({ ...f, fee_jpy: e.target.value.replace(/\D/g, "") }))} />
            <span className="av2-sub">Propre à chaque article : le client voit prix + frais.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="av2-btn" type="submit" disabled={pending}>{pending ? "…" : editing ? "Mettre à jour" : "Ajouter l'article"}</button>
          {editing ? <button type="button" className="av2-btn ghost" onClick={() => setForm(EMPTY)}>Annuler</button> : null}
          {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
        </div>
      </form>

      <h2>Articles ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>Aucun article. Ajoutez le premier ci-dessus.</p>
      ) : (
        <div className="av2-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {items.map((i, idx) => (
            <div className="av2-card" key={i.id} style={{ opacity: i.available ? 1 : 0.6 }}>
              {i.image_url ? <img src={i.image_url} alt={i.name ?? "Article"} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", background: "var(--av2-surface-2)", borderRadius: 8 }} /> : null}
              <h3 style={{ margin: "0.6rem 0 0.2rem" }}>{i.name || "Sans nom"}</h3>
              <div className="av2-sub">{formatJPY(toYen(i.price_jpy).yen)} + {formatJPY(toYen(i.fee_jpy).yen)} = <strong>{formatJPY(total(i))}</strong></div>
              <div style={{ margin: "0.4rem 0" }}>{i.available ? <Tag kind="ok">En vente</Tag> : <Tag kind="muted">Vendu</Tag>}</div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                <button className="av2-btn ghost" disabled={pending || idx === 0} onClick={() => run(() => moveShopItem(i.id, -1), "Déplacé.")} aria-label="Monter">↑</button>
                <button className="av2-btn ghost" disabled={pending || idx === items.length - 1} onClick={() => run(() => moveShopItem(i.id, 1), "Déplacé.")} aria-label="Descendre">↓</button>
                <button className="av2-btn ghost" onClick={() => { setForm({ id: i.id, name: i.name ?? "", image_url: i.image_url ?? "", price_jpy: String(i.price_jpy ?? ""), fee_jpy: String(i.fee_jpy ?? 6000) }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Modifier</button>
                <button className="av2-btn ghost" disabled={pending} onClick={() => run(() => setShopAvailable(i.id, !i.available), i.available ? "Marqué vendu." : "Remis en vente.")}>{i.available ? "Marquer vendu" : "Remettre en vente"}</button>
                <button className="av2-btn ghost" disabled={pending} onClick={() => { if (confirm(`Supprimer « ${i.name || "cet article"} » définitivement ?`)) run(() => deleteShopItem(i.id), "Article supprimé."); }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>Suivi des ventes ({sold.length})</h2>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Acheteur</th>
                <th>À envoyer avant le</th>
                <th className="r">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sold.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>Aucune vente. Marquez un article « vendu » pour le suivre ici.</td></tr>
              ) : (
                sold.map((i) => <SaleRow key={`${i.id}-${i.buyer_name}-${i.ship_by}`} item={i} />)
              )}
            </tbody>
          </table>
        </div>
        <p className="av2-sub" style={{ marginTop: "0.5rem" }}>{onSale.length} en vente · dernière date d'envoi saisie : {formatDateFr(sold.map((s) => s.ship_by).filter(Boolean).sort().pop() ?? null)}</p>
      </div>
    </>
  );
}
