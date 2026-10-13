"use client";

import { useState } from "react";
import { deleteExpense, saveExpense } from "./actions";
import { EXPENSE_CATEGORIES, annualExpenseTotal, monthlyExpenseAverage, type Expense } from "../../lib/accounting";
import { formatJPY } from "../../lib/money";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";

const EMPTY = { id: undefined as number | undefined, label: "", category: EXPENSE_CATEGORIES[0], amount_jpy: "", frequency: "monthly", notes: "" };

export default function ExpensesManager({ expenses }: { expenses: Expense[] }) {
  const { pending, msg, run } = useRun();
  const { t } = useL();
  const [form, setForm] = useState(EMPTY);
  const editing = form.id != null;

  return (
    <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <h2>{t("Dépenses professionnelles")}</h2>
      {expenses.length === 0 ? (
        <p style={{ color: "var(--av2-muted)" }}>{t("Aucune dépense enregistrée. Ajoutez vos abonnements et frais récurrents ci-dessous : ils servent au résultat.")}</p>
      ) : (
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Dépense")}</th>
                <th>{t("Catégorie")}</th>
                <th className="r">{t("Montant")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>
                    {e.label}
                    {e.notes ? <small>{e.notes}</small> : null}
                  </td>
                  <td>{e.category ? t(e.category) : "—"}</td>
                  <td className="r">
                    {formatJPY(Math.round(Number(e.amount_jpy) || 0))} {e.frequency === "monthly" ? t("/ mois") : t("/ an")}
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    <button className="av2-btn ghost" onClick={() => setForm({ id: e.id, label: e.label, category: e.category ?? EXPENSE_CATEGORIES[0], amount_jpy: String(Math.round(Number(e.amount_jpy) || 0)), frequency: e.frequency === "yearly" ? "yearly" : "monthly", notes: e.notes ?? "" })}>{t("Modifier")}</button>{" "}
                    <button className="av2-btn ghost" disabled={pending} onClick={() => { if (confirm(t("Supprimer « {name} » ?", { name: e.label }))) run(() => deleteExpense(e.id), "Dépense supprimée."); }}>{t("Supprimer")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="av2-sub">
        {t("Total annuel :")} <strong>{formatJPY(annualExpenseTotal(expenses))}</strong> · {t("moyenne mensuelle :")} <strong>{formatJPY(monthlyExpenseAverage(expenses))}</strong>
      </p>

      <form
        style={{ display: "flex", flexDirection: "column", gap: "0.7rem", borderTop: "1px solid var(--av2-border)", paddingTop: "0.9rem" }}
        onSubmit={(ev) => {
          ev.preventDefault();
          run(() => saveExpense({ id: form.id, label: form.label, category: form.category, amount_jpy: form.amount_jpy, frequency: form.frequency, notes: form.notes }), editing ? "Dépense mise à jour." : "Dépense ajoutée.", () => setForm(EMPTY));
        }}
      >
        <h3>{editing ? t("Modifier la dépense") : t("Ajouter une dépense")}</h3>
        <div className="av2-grid cols-2">
          <div className="av2-field">
            <label htmlFor="x-label">{t("Libellé *")}</label>
            <input id="x-label" className="av2-input" style={{ maxWidth: "none" }} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder={t("Ex : Hébergement Vercel")} maxLength={200} />
          </div>
          <div className="av2-field">
            <label htmlFor="x-cat">{t("Catégorie")}</label>
            <select id="x-cat" className="av2-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </div>
          <div className="av2-field">
            <label htmlFor="x-amount">{t("Montant (¥) *")}</label>
            <input id="x-amount" className="av2-input" style={{ maxWidth: "none" }} inputMode="numeric" value={form.amount_jpy} onChange={(e) => setForm((f) => ({ ...f, amount_jpy: e.target.value.replace(/\D/g, "") }))} />
          </div>
          <div className="av2-field">
            <label htmlFor="x-freq">{t("Fréquence")}</label>
            <select id="x-freq" className="av2-select" value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
              <option value="monthly">{t("Chaque mois")}</option>
              <option value="yearly">{t("Chaque année")}</option>
            </select>
          </div>
        </div>
        <div className="av2-field">
          <label htmlFor="x-notes">{t("Note")}</label>
          <input id="x-notes" className="av2-input" style={{ maxWidth: "none" }} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} maxLength={1000} />
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="av2-btn" type="submit" disabled={pending}>{pending ? "…" : editing ? t("Mettre à jour") : t("Ajouter")}</button>
          {editing ? <button type="button" className="av2-btn ghost" onClick={() => setForm(EMPTY)}>{t("Annuler")}</button> : null}
          {msg ? <span className={msg.kind === "error" ? "av2-error" : "av2-sub"} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}</span> : null}
        </div>
      </form>
    </div>
  );
}
