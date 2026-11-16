"use client";

import { useState } from "react";
import { addPurchase, deletePurchase } from "./actions";
import { PURCHASE_CATEGORIES, purchasesTotal, type Purchase } from "../../lib/accounting";
import { formatJPY } from "../../lib/money";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";

const todayTokyo = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

// Achats ponctuels (cartons, boxes en stock, matériel…) : datés, déduits du résultat de LEUR mois.
export default function PurchasesManager({ purchases, year, month }: { purchases: Purchase[]; year: string; month: string }) {
  const { pending, msg, run } = useRun();
  const { t, date, monthLabel } = useL();
  const [day, setDay] = useState(todayTokyo());
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(PURCHASE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const ofYear = purchases.filter((p) => (p.spent_on ?? "").startsWith(year));
  const thisMonth = purchasesTotal(purchases, month);

  return (
    <div className="av2-card" id="achats" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <div>
        <h2>{t("Achats ponctuels")}</h2>
        <p className="av2-sub">{t("Cartons, scotch, boxes achetées pour le stock, matériel… Chaque achat est déduit du résultat de son mois.")}</p>
      </div>

      <p>
        <span style={{ textTransform: "capitalize" }}>{monthLabel(month)}</span> : <strong>{formatJPY(thisMonth)}</strong>
        {" · "}
        {t("Année {year} :", { year })} <strong>{formatJPY(purchasesTotal(purchases, year))}</strong>
      </p>

      <form
        style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addPurchase({ spent_on: day, label, category, amount_jpy: amount, notes }), "Achat ajouté.", () => {
            setLabel("");
            setAmount("");
            setNotes("");
          });
        }}
      >
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="pu-label">{t("Libellé *")}</label>
            <input id="pu-label" className="av2-input" style={{ maxWidth: "none" }} value={label} maxLength={200} onChange={(e) => setLabel(e.target.value)} placeholder={t("Ex : 20 cartons 60 cm")} />
          </div>
          <div className="av2-field">
            <label htmlFor="pu-amount">{t("Montant (¥) *")}</label>
            <input id="pu-amount" className="av2-input" style={{ maxWidth: "none" }} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="0" />
          </div>
          <div className="av2-field">
            <label htmlFor="pu-cat">{t("Catégorie")}</label>
            <select id="pu-cat" className="av2-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {PURCHASE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </div>
          <div className="av2-field">
            <label htmlFor="pu-date">{t("Date de l'achat")}</label>
            <input id="pu-date" className="av2-input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
        </div>
        <div className="av2-field">
          <label htmlFor="pu-notes">{t("Note (facultatif)")}</label>
          <input id="pu-notes" className="av2-input" style={{ maxWidth: "none" }} value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="av2-btn" type="submit" disabled={pending || !label.trim() || amount === ""}>{pending ? "…" : t("Ajouter l'achat")}</button>
          {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
        </div>
      </form>

      {ofYear.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>{t("Aucun achat ponctuel en {year}.", { year })}</p>
      ) : (
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Achat")}</th>
                <th>{t("Catégorie")}</th>
                <th className="r">{t("Montant")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ofYear.map((p) => (
                <tr key={p.id}>
                  <td className="av2-nowrap">{date(p.spent_on)}</td>
                  <td>
                    {p.label}
                    {p.notes ? <small>{p.notes}</small> : null}
                  </td>
                  <td>{p.category ? t(p.category) : "—"}</td>
                  <td className="r"><strong>−{formatJPY(Math.round(Number(p.amount_jpy) || 0))}</strong></td>
                  <td className="r">
                    <button
                      type="button"
                      className="av2-btn ghost"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(t("Supprimer « {name} » ?", { name: p.label }))) run(() => deletePurchase(p.id), "Achat supprimé.");
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
