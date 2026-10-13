"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "../lib/supabase-browser";

// Photos d'une commande — même fonctionnement que l'ancienne admin : dépôt dans le stockage
// « order-photos », une ligne par photo dans order_photos, et passage de la commande au statut
// « Photos envoyées » (ce qui prévient le client). Rien n'est supprimé sans confirmation.

type Photo = { id: string; url: string };

// Envoi d'une seule photo (hors composant : un nom de fichier unique évite toute collision).
async function uploadOne(sb: ReturnType<typeof createBrowserSupabase>, orderId: number, file: File, sortOrder: number): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const path = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await sb.storage.from("order-photos").upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) return `Envoi impossible : ${upErr.message}`;
  const { data: pub } = sb.storage.from("order-photos").getPublicUrl(path);
  const { error: insErr } = await sb.from("order_photos").insert({ order_id: orderId, url: pub.publicUrl, sort_order: sortOrder });
  return insErr ? `Photo envoyée mais non enregistrée : ${insErr.message}` : null;
}

export default function PhotoManager({ orderId, onUploaded }: { orderId: number; onUploaded?: () => void }) {
  const sb = createBrowserSupabase();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await createBrowserSupabase().from("order_photos").select("id,url").eq("order_id", orderId).order("sort_order");
    setPhotos((data ?? []) as Photo[]);
  }, [orderId]);

  useEffect(() => {
    // Chargement initial des photos depuis la base (synchronisation avec un système externe).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    setError("");
    let done = 0;
    for (const file of list) {
      setProgress(`${done + 1} / ${list.length}`);
      const problem = await uploadOne(sb, orderId, file, photos.length + done);
      if (problem) {
        setError(problem);
        continue;
      }
      done++;
    }
    setBusy(false);
    setProgress("");
    await load();
    if (done > 0) {
      // Comme avant : la commande passe à « Photos envoyées », le client est prévenu.
      await sb.from("orders").update({ status: "Photos Uploaded" }).eq("id", orderId);
      onUploaded?.();
    }
  }

  async function remove(photo: Photo) {
    if (!confirm("Supprimer cette photo ?")) return;
    const marker = "/order-photos/";
    const idx = photo.url.indexOf(marker);
    if (idx > -1) await sb.storage.from("order-photos").remove([photo.url.slice(idx + marker.length)]);
    await sb.from("order_photos").delete().eq("id", photo.id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
      <div
        className="av2-card"
        style={{ borderStyle: "dashed", textAlign: "center", cursor: "pointer", background: dragging ? "var(--av2-surface-2)" : undefined }}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") input.current?.click(); }}
      >
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        {busy ? `Envoi ${progress}…` : "Glissez des photos ici, ou cliquez pour choisir"}
      </div>
      {error ? <p className="av2-error" role="alert">{error}</p> : null}
      {photos.length > 0 ? (
        <div className="av2-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              <img src={p.url} alt="Photo de la commande" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--av2-border)" }} />
              <button type="button" className="av2-btn ghost" style={{ position: "absolute", top: 4, right: 4, padding: "0.1rem 0.5rem" }} onClick={() => remove(p)} aria-label="Supprimer la photo">×</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
