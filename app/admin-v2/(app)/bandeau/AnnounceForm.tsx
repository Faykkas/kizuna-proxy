"use client";

import { useState } from "react";
import { saveAnnounce } from "./actions";
import { useRun } from "../../components/useRun";

export type AnnounceRow = { text_en: string | null; from_date: string | null; to_date: string | null; active: boolean | null };

export default function AnnounceForm({ initial }: { initial: AnnounceRow }) {
  const { pending, msg, run } = useRun();
  const [f, setF] = useState({ text_en: initial.text_en ?? "", from_date: initial.from_date ?? "", to_date: initial.to_date ?? "", active: !!initial.active });

  return (
    <form
      className="av2-card"
      style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveAnnounce(f), "Bandeau enregistré.");
      }}
    >
      <label style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontWeight: 600 }}>
        <input type="checkbox" checked={f.active} onChange={(e) => setF((x) => ({ ...x, active: e.target.checked }))} />
        {f.active ? "Le bandeau est affiché sur le site" : "Le bandeau est masqué"}
      </label>
      <div className="av2-field">
        <label htmlFor="a-text">Message</label>
        <input id="a-text" className="av2-input" style={{ maxWidth: "none" }} value={f.text_en} onChange={(e) => setF((x) => ({ ...x, text_en: e.target.value }))} placeholder="Orders paused from April 20 to June 1" maxLength={400} />
        <span className="av2-sub">Affiché en haut de toutes les pages (en anglais, comme avant).</span>
      </div>
      <div className="av2-grid cols-2">
        <div className="av2-field">
          <label htmlFor="a-from">Du</label>
          <input id="a-from" className="av2-input" style={{ maxWidth: "none" }} value={f.from_date} onChange={(e) => setF((x) => ({ ...x, from_date: e.target.value }))} placeholder="April 20" />
        </div>
        <div className="av2-field">
          <label htmlFor="a-to">Au</label>
          <input id="a-to" className="av2-input" style={{ maxWidth: "none" }} value={f.to_date} onChange={(e) => setF((x) => ({ ...x, to_date: e.target.value }))} placeholder="June 1" />
        </div>
      </div>
      {f.active && f.text_en ? (
        <div className="av2-banner info" role="note">
          <div>
            <strong>Aperçu :</strong> {f.text_en} {f.from_date ? <strong>{f.from_date}</strong> : null}
            {f.to_date ? <> → <strong>{f.to_date}</strong></> : null}
          </div>
        </div>
      ) : null}
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        <button className="av2-btn" type="submit" disabled={pending}>{pending ? "…" : "Enregistrer"}</button>
        {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
      </div>
    </form>
  );
}
