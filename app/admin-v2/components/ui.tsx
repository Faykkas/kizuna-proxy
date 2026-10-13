"use client";

import type { ReactNode } from "react";
import { statusInfo } from "../lib/status";
import { useL } from "./LangProvider";

// Composants de présentation, sans accès aux données. Marqués « client » pour pouvoir lire la langue choisie
// (useL) ; les pages serveur et les composants client peuvent tous les utiliser.

export function PageHead({ title, subtitle, tags }: { title: string; subtitle?: ReactNode; tags?: ReactNode }) {
  return (
    <div className="av2-head">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {tags ? <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>{tags}</div> : null}
    </div>
  );
}

export function Tag({ kind, children }: { kind: "soon" | "ro" | "prov" | "ok" | "alert" | "muted"; children: ReactNode }) {
  return <span className={`av2-tag ${kind}`}>{children}</span>;
}

export function ReadOnlyTag() {
  const { t } = useL();
  return <Tag kind="ro">{t("Lecture seule")}</Tag>;
}

export function Banner({ kind, children }: { kind: "info" | "warn" | "alert"; children: ReactNode }) {
  return (
    <div className={`av2-banner ${kind}`} role={kind === "alert" ? "alert" : "note"}>
      <div>{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string | null }) {
  const { statusLabel } = useL();
  const { tone } = statusInfo(status);
  const kind = tone === "info" ? "ro" : tone === "warn" ? "soon" : tone;
  return <span className={`av2-tag ${kind}`}>{statusLabel(status)}</span>;
}

export function StatCard({ label, value, sub, tag }: { label: string; value: ReactNode; sub?: ReactNode; tag?: ReactNode }) {
  return (
    <div className="av2-card">
      <div className="av2-label">
        {label} {tag}
      </div>
      <div className="av2-value">{value}</div>
      {sub ? <div className="av2-sub">{sub}</div> : null}
    </div>
  );
}

/** Zone clairement NON fonctionnelle : hachurée, étiquette « Phase N », jamais de chiffre. */
export function SoonCard({ title, phase, children }: { title: string; phase: string; children?: ReactNode }) {
  const { t } = useL();
  return (
    <div className="av2-soon-card" aria-label={`${title} — ${t("non disponible")} (${phase})`}>
      <h3>
        {title} <Tag kind="soon">{phase} · {t("non disponible")}</Tag>
      </h3>
      {children ? <p style={{ fontSize: "0.88rem" }}>{children}</p> : null}
      <div className="av2-soon-value" aria-hidden="true">
        —
      </div>
    </div>
  );
}

export function StaffNotice() {
  const { t } = useL();
  return (
    <Banner kind="info">
      <strong>{t("Compte « staff » :")}</strong>{" "}
      {t("les politiques d'accès aux données existantes (commandes, clients, paiements) sont aujourd'hui réservées aux administrateurs. L'accès staff sera ouvert, table par table, à la phase 3 — aucun chiffre n'est affiché ici pour ne pas montrer de zéros trompeurs.")}
    </Banner>
  );
}

export function DataError({ message }: { message: string }) {
  const { t } = useL();
  return (
    <Banner kind="alert">
      <strong>{t("Lecture impossible.")}</strong> {message}
    </Banner>
  );
}
