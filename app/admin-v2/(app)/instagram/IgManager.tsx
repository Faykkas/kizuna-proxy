"use client";

import { useState } from "react";
import { createIgPost, deleteIgPost, setIgStatus, updateIgPost } from "./actions";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import { IG_KINDS, captionFor, type IgInput, type IgKind, type IgPost, type IgStatus } from "../../../lib/igPosts";

function kindLabel(t: (s: string) => string, k: string) {
  // Libellés écrits en clair pour que la vérification des traductions les trouve.
  if (k === "event") return t("Événement");
  if (k === "popup") return t("Pop-up store");
  if (k === "release") return t("Nouvelle sortie");
  if (k === "collab") return t("Collab limitée");
  if (k === "lottery") return t("Loterie / Ichiban Kuji");
  return t("Autre");
}

function statusLabel(t: (s: string) => string, s: string) {
  if (s === "draft") return t("Brouillon");
  if (s === "approved") return t("Validé");
  if (s === "published") return t("Publié");
  return t("Archivé");
}

const EMPTY: IgInput = { kind: "event", title: "", subtitle: "", dates: "", place: "", highlights: "", officialUrl: "", sourceName: "", caption: "" };

function toInput(p: IgPost): IgInput {
  return {
    kind: p.kind,
    title: p.title,
    subtitle: p.subtitle ?? "",
    dates: p.dates ?? "",
    place: p.place ?? "",
    highlights: p.highlights.join("\n"),
    officialUrl: p.official_url,
    sourceName: p.source_name ?? "",
    caption: p.caption ?? "",
  };
}

/** Formulaire de post (création ou modification). */
function PostForm({ initial, submitLabel, onSubmit, pending, onCancel }: { initial: IgInput; submitLabel: string; onSubmit: (v: IgInput) => void; pending: boolean; onCancel?: () => void }) {
  const { t } = useL();
  const [v, setV] = useState<IgInput>(initial);
  const set = (k: keyof IgInput) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="av2-grid cols-2">
        <div className="av2-field">
          <label>{t("Type")}</label>
          <select className="av2-select" value={v.kind} onChange={set("kind")}>
            {IG_KINDS.map((k) => (
              <option key={k} value={k}>{kindLabel(t, k)}</option>
            ))}
          </select>
        </div>
        <div className="av2-field">
          <label>{t("Titre (anglais, 90 caractères max)")}</label>
          <input className="av2-input" value={v.title} maxLength={90} onChange={set("title")} placeholder="Pokémon Center Christmas pop-up" />
        </div>
      </div>
      <div className="av2-grid cols-2">
        <div className="av2-field">
          <label>{t("Sous-titre (facultatif)")}</label>
          <input className="av2-input" value={v.subtitle} maxLength={120} onChange={set("subtitle")} placeholder="Limited holiday plush & goods" />
        </div>
        <div className="av2-field">
          <label>{t("Dates")}</label>
          <input className="av2-input" value={v.dates} maxLength={80} onChange={set("dates")} placeholder="Nov 21 – Dec 25, 2026" />
        </div>
      </div>
      <div className="av2-grid cols-2">
        <div className="av2-field">
          <label>{t("Lieu")}</label>
          <input className="av2-input" value={v.place} maxLength={100} onChange={set("place")} placeholder="Pokémon Center Shibuya, Tokyo" />
        </div>
        <div className="av2-field">
          <label>{t("Source officielle (nom affiché)")}</label>
          <input className="av2-input" value={v.sourceName} maxLength={80} onChange={set("sourceName")} placeholder="Pokémon Center" />
        </div>
      </div>
      <div className="av2-field">
        <label>{t("Lien officiel (page ou post de l'organisateur, https://)")}</label>
        <input className="av2-input" value={v.officialUrl} maxLength={500} onChange={set("officialUrl")} placeholder="https://…" />
      </div>
      <div className="av2-field">
        <label>{t("Ce qu'on peut acheter (un point par ligne, 5 maximum)")}</label>
        <textarea className="av2-input" rows={4} value={v.highlights} onChange={set("highlights")} placeholder={"Christmas Pikachu plush\nLimited keychains"} />
      </div>
      <div className="av2-field">
        <label>{t("Légende Instagram (facultatif : laissez vide pour la légende automatique)")}</label>
        <textarea className="av2-input" rows={5} value={v.caption} maxLength={2200} onChange={set("caption")} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="av2-btn" type="submit" disabled={pending}>{submitLabel}</button>
        {onCancel ? <button className="av2-btn ghost" type="button" onClick={onCancel}>{t("Annuler")}</button> : null}
      </div>
    </form>
  );
}

const TABS: IgStatus[] = ["draft", "approved", "published", "archived"];

export default function IgManager({ posts }: { posts: IgPost[] }) {
  const { pending, msg, setMsg, run } = useRun();
  const { t, date } = useL();
  const [tab, setTab] = useState<IgStatus>(posts.some((p) => p.status === "draft") ? "draft" : "approved");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const shown = posts.filter((p) => p.status === tab);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ kind: "ok", text: t("Copié.") });
    } catch {
      setMsg({ kind: "error", text: t("Copie impossible : sélectionnez le texte à la main.") });
    }
  }

  return (
    <>
      <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h2>{t("Nouveau post")}</h2>
          <button type="button" className="av2-btn ghost" onClick={() => setCreating((v) => !v)}>{creating ? t("Fermer") : t("Créer un post")}</button>
        </div>
        {creating ? (
          <PostForm
            initial={EMPTY}
            submitLabel={t("Enregistrer comme brouillon")}
            pending={pending}
            onSubmit={(v) => run(() => createIgPost(v), "Enregistré.", () => { setCreating(false); setTab("draft"); })}
          />
        ) : null}
        {msg ? <p className={msg.kind === "ok" ? "av2-ok" : "av2-error"} role="status">{msg.text}</p> : null}
      </div>

      <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {TABS.map((s) => (
            <button key={s} type="button" className={`av2-btn ${tab === s ? "" : "ghost"}`} onClick={() => setTab(s)}>
              {statusLabel(t, s)} ({posts.filter((p) => p.status === s).length})
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucun post ici pour l'instant.")}</p>
        ) : (
          shown.map((p) => {
            const img = `/api/ig-card?id=${p.id}&v=${encodeURIComponent(p.updated_at)}`;
            const caption = captionFor(p);
            return (
              <div key={p.id} style={{ borderTop: "1px solid var(--av2-border)", paddingTop: "0.9rem", display: "grid", gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)", gap: "1rem" }}>
                <a href={img} target="_blank" rel="noopener noreferrer" title={t("Voir l'image en grand")}>
                  <img src={img} alt="" width={180} height={225} loading="lazy" style={{ width: "100%", height: "auto", borderRadius: 10, display: "block", border: "1px solid var(--av2-border)" }} />
                </a>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0 }}>
                  <div>
                    <strong>{p.title}</strong>{" "}
                    <span className="av2-tag muted">{kindLabel(t, p.kind)}</span>{" "}
                    {p.created_by === "auto" ? <span className="av2-tag soon">{t("Recherche auto")}</span> : null}
                    <small style={{ display: "block", color: "var(--av2-muted)" }}>
                      {[p.dates, p.place].filter(Boolean).join(" · ")}
                      {` · ${t("créé le {d}", { d: date(p.created_at.slice(0, 10)) })}`}
                      {p.published_at ? ` · ${t("publié le {d}", { d: date(p.published_at.slice(0, 10)) })}` : ""}
                    </small>
                    <small style={{ display: "block", overflowWrap: "anywhere" }}>
                      <a href={p.official_url} target="_blank" rel="noopener noreferrer nofollow">{p.official_url}</a>
                    </small>
                  </div>

                  {editing === p.id ? (
                    <PostForm
                      initial={toInput(p)}
                      submitLabel={t("Enregistrer")}
                      pending={pending}
                      onCancel={() => setEditing(null)}
                      onSubmit={(v) => run(() => updateIgPost(p.id, v), "Enregistré.", () => setEditing(null))}
                    />
                  ) : (
                    <>
                      <details>
                        <summary style={{ cursor: "pointer" }}>{t("Voir la légende")}</summary>
                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: ".85rem", margin: ".5rem 0 0" }}>{caption}</pre>
                      </details>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        <a className="av2-btn ghost" href={img} download={`kizuna-${p.id.slice(0, 8)}.png`}>{t("Télécharger l'image")}</a>
                        <button type="button" className="av2-btn ghost" onClick={() => copy(caption)}>{t("Copier la légende")}</button>
                        <button type="button" className="av2-btn ghost" onClick={() => setEditing(p.id)}>{t("Modifier")}</button>
                        {p.status === "draft" ? (
                          <button type="button" className="av2-btn" disabled={pending} onClick={() => run(() => setIgStatus(p.id, "approved"), "Validé : visible sur kizunaproxy.com/ig.")}>{t("Valider")}</button>
                        ) : null}
                        {p.status === "approved" ? (
                          <button type="button" className="av2-btn" disabled={pending} onClick={() => run(() => setIgStatus(p.id, "published"), "Enregistré.")}>{t("Marquer comme publié sur Instagram")}</button>
                        ) : null}
                        {p.status !== "draft" ? (
                          <button type="button" className="av2-btn ghost" disabled={pending} onClick={() => run(() => setIgStatus(p.id, "draft"), "Enregistré.")}>{t("Remettre en brouillon")}</button>
                        ) : null}
                        {p.status !== "archived" ? (
                          <button type="button" className="av2-btn ghost" disabled={pending} onClick={() => run(() => setIgStatus(p.id, "archived"), "Enregistré.")}>{t("Archiver")}</button>
                        ) : null}
                        <button
                          type="button"
                          className="av2-btn ghost"
                          disabled={pending}
                          onClick={() => {
                            if (window.confirm(t("Supprimer ce post ?"))) run(() => deleteIgPost(p.id), "Supprimé.");
                          }}
                        >
                          {t("Supprimer")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
