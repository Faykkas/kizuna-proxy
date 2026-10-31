"use client";

import { useState } from "react";
import { addLedgerEntry, deleteLedgerEntry } from "./actions";
import { formatJPY } from "../../lib/money";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import type { LedgerEntry } from "../../lib/mayuko";

const todayTokyo = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

// Formulaire pour noter un remboursement (ou une avance en plus), et liste des mouvements déjà notés.
export default function LedgerManager({ entries, due }: { entries: LedgerEntry[]; due: number }) {
  const { pending, msg, run } = useRun();
  const { t, date } = useL();
  const [kind, setKind] = useState("repayment");
  const [day, setDay] = useState(todayTokyo());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <h2>{t("Remboursements et avances")}</h2>

      <form
        style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => addLedgerEntry({ kind, date: day, amount, note }),
            "Enregistré.",
            () => {
              setAmount("");
              setNote("");
            },
          );
        }}
      >
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="lg-kind">{t("Type")}</label>
            <select id="lg-kind" className="av2-select" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="repayment">{t("Remboursement (je lui ai rendu l'argent)")}</option>
              <option value="advance">{t("Avance en plus (livraison, taxes… qu'elle a payées)")}</option>
            </select>
          </div>
          <div className="av2-field">
            <label htmlFor="lg-date">{t("Date")}</label>
            <input id="lg-date" className="av2-input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
        </div>
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="lg-amount">{t("Montant (¥)")}</label>
            <input id="lg-amount" className="av2-input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="0" />
            {kind === "repayment" && due > 0 ? (
              <button type="button" className="av2-btn ghost" style={{ alignSelf: "flex-start", marginTop: "0.3rem" }} onClick={() => setAmount(String(due))}>
                {t("Remplir avec le solde dû")} ({formatJPY(due)})
              </button>
            ) : null}
          </div>
          <div className="av2-field">
            <label htmlFor="lg-note">{t("Note (facultatif)")}</label>
            <input id="lg-note" className="av2-input" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={t("Ex : virement de la semaine du 2 au 8 nov.")} />
          </div>
        </div>
        <div>
          <button className="av2-btn" type="submit" disabled={pending || amount === ""}>{t("Enregistrer")}</button>
        </div>
        {msg ? <p className={msg.kind === "ok" ? "av2-ok" : "av2-error"} role="status">{msg.text}</p> : null}
      </form>

      {entries.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>{t("Aucun remboursement enregistré pour l'instant.")}</p>
      ) : (
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Type")}</th>
                <th className="r">{t("Montant")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="av2-nowrap">{date(e.entry_date)}</td>
                  <td>
                    {e.kind === "repayment" ? t("Remboursement") : t("Avance en plus")}
                    {e.note ? <small>{e.note}</small> : null}
                  </td>
                  <td className="r">
                    <strong>{e.kind === "repayment" ? "−" : "+"}{formatJPY(e.amount_jpy)}</strong>
                  </td>
                  <td className="r">
                    <button
                      type="button"
                      className="av2-btn ghost"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(t("Supprimer ce mouvement ?"))) run(() => deleteLedgerEntry(e.id), "Supprimé.");
                      }}
                    >
                      {t("Supprimer")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
