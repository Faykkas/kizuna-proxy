"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { createBrowserSupabase } from "../lib/supabase-browser";

// Champ « image » : une adresse https, ou un fichier envoyé dans le stockage « gallery »
// (même bucket que l'ancienne admin).

async function uploadToGallery(file: File): Promise<{ url?: string; error?: string }> {
  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const sb = createBrowserSupabase();
  const { error } = await sb.storage.from("gallery").upload(name, file, { upsert: false, cacheControl: "3600" });
  if (error) return { error: `Envoi impossible : ${error.message}` };
  return { url: sb.storage.from("gallery").getPublicUrl(name).data.publicUrl };
}

export default function ImageField({ value, onChange, label = "Image" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choisissez un fichier image.");
    setBusy(true);
    setError("");
    const r = await uploadToGallery(file);
    setBusy(false);
    if (r.error) setError(r.error);
    else if (r.url) onChange(r.url);
  }

  return (
    <div className="av2-field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <input className="av2-input" style={{ maxWidth: "none" }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… ou envoyez un fichier" aria-label={`${label} (adresse)`} />
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" className="av2-btn ghost" onClick={() => input.current?.click()} disabled={busy}>{busy ? "Envoi…" : "Envoyer une image"}</button>
      </div>
      {error ? <span className="av2-error" role="alert">{error}</span> : null}
      {value ? <img src={value} alt="Aperçu" style={{ height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid var(--av2-border)", alignSelf: "flex-start" }} /> : null}
    </div>
  );
}
