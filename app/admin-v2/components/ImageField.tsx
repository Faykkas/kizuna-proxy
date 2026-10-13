"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { createBrowserSupabase } from "../lib/supabase-browser";
import type { Translator } from "../lib/i18n";
import { useL } from "./LangProvider";

// Champ « image » : une adresse https, ou un fichier envoyé dans le stockage « gallery »
// (même bucket que l'ancienne admin).

async function uploadToGallery(file: File, t: Translator): Promise<{ url?: string; error?: string }> {
  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const sb = createBrowserSupabase();
  const { error } = await sb.storage.from("gallery").upload(name, file, { upsert: false, cacheControl: "3600" });
  if (error) return { error: `${t("Envoi impossible")} : ${error.message}` };
  return { url: sb.storage.from("gallery").getPublicUrl(name).data.publicUrl };
}

export default function ImageField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const { t } = useL();
  const shownLabel = label ?? t("Image");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(t("Choisissez un fichier image."));
    setBusy(true);
    setError("");
    const r = await uploadToGallery(file, t);
    setBusy(false);
    if (r.error) setError(r.error);
    else if (r.url) onChange(r.url);
  }

  return (
    <div className="av2-field">
      <label>{shownLabel}</label>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <input className="av2-input" style={{ maxWidth: "none" }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={t("https://… ou envoyez un fichier")} aria-label={t("{label} (adresse)", { label: shownLabel })} />
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" className="av2-btn ghost" onClick={() => input.current?.click()} disabled={busy}>{busy ? t("Envoi…") : t("Envoyer une image")}</button>
      </div>
      {error ? <span className="av2-error" role="alert">{error}</span> : null}
      {value ? <img src={value} alt={t("Aperçu")} style={{ height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid var(--av2-border)", alignSelf: "flex-start" }} /> : null}
    </div>
  );
}
