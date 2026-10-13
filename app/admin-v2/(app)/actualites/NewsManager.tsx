"use client";

import { useState } from "react";
import { deleteNews, saveNews } from "./actions";
import { useRun } from "../../components/useRun";
import { formatDateFr } from "../../lib/status";
import { Tag } from "../../components/ui";

export type NewsRow = { id: string; title: string; content: string; category: string; published_at: string };

const CATEGORIES = [
  { value: "shipping", label: "Livraison" },
  { value: "service", label: "Service" },
  { value: "event", label: "Événement" },
  { value: "general", label: "Général" },
];
const EMPTY = { id: "", title: "", content: "", category: "general" };

export default function NewsManager({ items }: { items: NewsRow[] }) {
  const { pending, msg, run } = useRun();
  const [form, setForm] = useState(EMPTY);
  const editing = !!form.id;

  return (
    <>
      <form
        className="av2-card"
        style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveNews({ id: form.id || undefined, title: form.title, content: form.content, category: form.category }), editing ? "Article mis à jour." : "Article publié.", () => setForm(EMPTY));
        }}
      >
        <h2>{editing ? "Modifier l'article" : "Nouvel article"}</h2>
        <div className="av2-field">
          <label htmlFor="n-title">Titre *</label>
          <input id="n-title" className="av2-input" style={{ maxWidth: "none" }} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={200} />
        </div>
        <div className="av2-field">
          <label htmlFor="n-content">Contenu *</label>
          <textarea id="n-content" className="av2-input" style={{ maxWidth: "none", minHeight: "8rem", resize: "vertical" }} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} maxLength={8000} />
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="av2-label" style={{ marginBottom: "0.4rem" }}>Catégorie</legend>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <label key={c.value} className="av2-btn ghost" style={{ borderColor: form.category === c.value ? "var(--av2-accent)" : undefined }}>
                <input type="radio" name="cat" checked={form.category === c.value} onChange={() => setForm((f) => ({ ...f, category: c.value }))} /> {c.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="av2-btn" type="submit" disabled={pending}>{pending ? "…" : editing ? "Mettre à jour" : "Publier"}</button>
          {editing ? <button type="button" className="av2-btn ghost" onClick={() => setForm(EMPTY)}>Annuler</button> : null}
          {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
        </div>
      </form>

      <h2>Articles ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>Aucun article. La page d'accueil affiche alors un message par défaut.</p>
      ) : (
        <div className="av2-tablewrap">
          <table className="av2-table">
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td style={{ width: 110 }}>
                    <Tag kind="ro">{CATEGORIES.find((c) => c.value === n.category)?.label ?? n.category}</Tag>
                    <small>{formatDateFr(n.published_at)}</small>
                  </td>
                  <td>
                    <strong>{n.title}</strong>
                    <small style={{ whiteSpace: "pre-wrap" }}>{n.content.length > 180 ? `${n.content.slice(0, 180)}…` : n.content}</small>
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    <button className="av2-btn ghost" onClick={() => { setForm({ id: n.id, title: n.title, content: n.content, category: n.category }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Modifier</button>{" "}
                    <button className="av2-btn ghost" disabled={pending} onClick={() => { if (confirm(`Supprimer « ${n.title} » ?`)) run(() => deleteNews(n.id), "Article supprimé."); }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
