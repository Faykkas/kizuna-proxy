"use client";

import { useState } from "react";
import { cancelPaymentLink } from "./actions";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";

// Domaine public où le client ouvre le lien (identique à l'ancienne admin).
const SITE_URL = "https://kizunaproxy.com";

export default function LinkActions({ id, status, label }: { id: string; status: string | null; label: string | null }) {
  const { pending, msg, run } = useRun();
  const { t } = useL();
  const [copied, setCopied] = useState(false);

  if (status !== "pending") return <span style={{ color: "var(--av2-muted)" }}>—</span>;

  return (
    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "nowrap" }}>
      <button
        className="av2-btn ghost sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${SITE_URL}/pay/${id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? t("Copié ✓") : t("Copier")}
      </button>
      <button
        className="av2-btn ghost sm"
        disabled={pending}
        onClick={() => {
          if (confirm(t("Annuler le lien « {label} » ? Il ne sera plus payable.", { label: label ?? "" }))) run(() => cancelPaymentLink(id), "Lien annulé.");
        }}
      >
        {t("Annuler")}
      </button>
      {msg?.kind === "error" ? <small className="av2-error">{msg.text}</small> : null}
    </div>
  );
}
