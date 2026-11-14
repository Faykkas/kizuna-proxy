"use client";

import { useState } from "react";
import { addLedgerEntry, deleteLedgerEntry, setAdvanceCategory } from "./actions";
import { formatJPY } from "../../lib/money";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import { advanceCategory, advanceNoteText, advancesByCategory, type LedgerEntry } from "../../lib/mayuko";

const todayTokyo = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

// Formulaire pour noter un remboursement (ou une avance en plus), et liste des mouvements déjà notés.
export default function LedgerManager({ entries, due }: { entries: LedgerEntry[]; due: number }) {
  const { pending, msg, run } = useRun();
  const { t, date } = useL();
  // « repayment », ou une avance avec sa catégorie : « advance:shipping », « advance:zonos », « advance:other »
  const [kind, setKind] = useState("repayment");
  const [entryKind, category] = kind.split(":");
  const catLabel = (c: string | null) => (c === "shipping" ? t("Livraison") : c === "zonos" ? t("Taxes Zonos") : c === "other" ? t("Autre") : t("Non classée"));
  const byCat = advancesByCategory(entries);
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
            () => addLedgerEntry({ kind: entryKind, category, date: day, amount, note }),
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
              <option value="advance:shipping">{t("Avance : livraison payée par Mayuko")}</option>
              <option value="advance:zonos">{t("Avance : taxes Zonos payées par Mayuko")}</option>
              <option value="advance:other">{t("Avance : autre")}</option>
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
                    {e.kind === "repayment" ? (
                      <>
                        {t("Remboursement")}
                        {e.note ? <small>{e.note}</small> : null}
                      </>
                    ) : (
                      <>
                        {t("Avance")}{" "}
                        <select
                          className="av2-select"
                          aria-label={t("Type d'avance")}
                          style={{ display: "inline-block", width: "auto", padding: "0.15rem 0.5rem", marginLeft: "0.3rem" }}
                          value={advanceCategory(e.note) ?? ""}
                          disabled={pending}
                          onChange={(ev) => run(() => setAdvanceCategory(e.id, ev.target.value), "Enregistré.")}
                        >
                          {advanceCategory(e.note) ? null : <option value="">{t("Non classée")}</option>}
                          <option value="shipping">{t("Livraison")}</option>
                          <option value="zonos">{t("Taxes Zonos")}</option>
                          <option value="other">{t("Autre")}</option>
                        </select>
                        {advanceNoteText(e.note) ? <small>{advanceNoteText(e.note)}</small> : null}
                      </>
                    )}
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
          {byCat.shipping + byCat.zonos + byCat.other + byCat.unsorted > 0 ? (
            <p style={{ color: "var(--av2-muted)", marginTop: "0.6rem" }}>
              {t("Avances en plus")} : {catLabel("shipping")} <strong>{formatJPY(byCat.shipping)}</strong> · {catLabel("zonos")} <strong>{formatJPY(byCat.zonos)}</strong> · {catLabel("other")} <strong>{formatJPY(byCat.other)}</strong>
              {byCat.unsorted > 0 ? <> · {catLabel(null)} <strong>{formatJPY(byCat.unsorted)}</strong></> : null}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
