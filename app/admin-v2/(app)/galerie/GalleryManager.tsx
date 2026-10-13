"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { deleteGalleryItem, moveGalleryItem, saveGalleryItem } from "./actions";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import ImageField from "../../components/ImageField";

export type GalleryRow = { id: string; title: string; subtitle: string | null; image_url: string; sort_order: number | null };

const EMPTY = { id: "", title: "", subtitle: "", image_url: "" };

export default function GalleryManager({ items }: { items: GalleryRow[] }) {
  const { pending, msg, run } = useRun();
  const { t } = useL();
  const [form, setForm] = useState(EMPTY);
  const editing = !!form.id;

  return (
    <>
      <form
        className="av2-card"
        style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveGalleryItem({ id: form.id || undefined, title: form.title, subtitle: form.subtitle, image_url: form.image_url }), editing ? "Photo mise à jour." : "Photo ajoutée.", () => setForm(EMPTY));
        }}
      >
        <h2>{editing ? t("Modifier la photo") : t("Ajouter une photo")}</h2>
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="g-title">{t("Titre *")}</label>
            <input id="g-title" className="av2-input" style={{ maxWidth: "none" }} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("Pokémon Center Tokyo")} maxLength={200} />
          </div>
          <div className="av2-field">
            <label htmlFor="g-sub">{t("Sous-titre")}</label>
            <input id="g-sub" className="av2-input" style={{ maxWidth: "none" }} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder={t("Cartes rares · Japon")} maxLength={300} />
          </div>
        </div>
        <ImageField label={t("Image *")} value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="av2-btn" type="submit" disabled={pending}>{pending ? "…" : editing ? t("Mettre à jour") : t("Ajouter la photo")}</button>
          {editing ? <button type="button" className="av2-btn ghost" onClick={() => setForm(EMPTY)}>{t("Annuler")}</button> : null}
          {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
        </div>
      </form>

      <h2>{items.length > 1 ? t("Galerie ({n} photos)", { n: items.length }) : t("Galerie ({n} photo)", { n: items.length })}</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>{t("Aucune photo. Si la galerie est vide, la page d'accueil affiche ses photos par défaut.")}</p>
      ) : (
        <div className="av2-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {items.map((i, idx) => (
            <div className="av2-card" key={i.id}>
              <img src={i.image_url} alt={i.title} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8 }} />
              <h3 style={{ margin: "0.5rem 0 0.1rem" }}>{i.title}</h3>
              {i.subtitle ? <div className="av2-sub">{i.subtitle}</div> : null}
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                <button className="av2-btn ghost" disabled={pending || idx === 0} onClick={() => run(() => moveGalleryItem(i.id, -1), "Déplacée.")} aria-label={t("Monter")}>↑</button>
                <button className="av2-btn ghost" disabled={pending || idx === items.length - 1} onClick={() => run(() => moveGalleryItem(i.id, 1), "Déplacée.")} aria-label={t("Descendre")}>↓</button>
                <button className="av2-btn ghost" onClick={() => { setForm({ id: i.id, title: i.title, subtitle: i.subtitle ?? "", image_url: i.image_url }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t("Modifier")}</button>
                <button className="av2-btn ghost" disabled={pending} onClick={() => { if (confirm(t("Supprimer « {name} » ?", { name: i.title }))) run(() => deleteGalleryItem(i.id), "Photo supprimée."); }}>{t("Supprimer")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
