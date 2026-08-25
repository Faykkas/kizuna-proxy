// @ts-nocheck
"use client";
// app/components/admin/ChargesTab.tsx
//
// "Combien dois-je mettre de côté pour mes charges japonaises ?" — un
// calculateur, pas un conseil fiscal.
//
// v2: the old model applied every rate directly to revenue (CA), which
// overstates everything — most Japanese charges are computed from PROFIT,
// TAXABLE income, or the PRIOR YEAR's income, not raw turnover. This
// version builds a real base (CA − dépenses = bénéfice), then applies each
// charge's actual formula against the right base:
//   - Kokuho (health insurance) & Jūminzei (resident tax): prior-year income
//   - Shotokuzei (income tax): this year's profit minus deductions, bracket
//   - Kojin Jigyōzei (business tax): this year's profit minus a threshold
//   - Nenkin (pension): flat, unrelated to income
// Every rate/threshold/deduction stays editable in Settings — Japanese
// municipal rates and national brackets change every year.

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";

function fmtYen(n) {
  const sign = n < 0 ? "-" : "";
  return sign + "¥" + Math.round(Math.abs(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// 国税庁 (National Tax Agency) progressive bracket table — nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
const INCOME_TAX_BRACKETS = [
  { upTo: 1949000, rate: 0.05, deduction: 0 },
  { upTo: 3299000, rate: 0.10, deduction: 97500 },
  { upTo: 6949000, rate: 0.20, deduction: 427500 },
  { upTo: 8999000, rate: 0.23, deduction: 636000 },
  { upTo: 17999000, rate: 0.33, deduction: 1536000 },
  { upTo: 39999000, rate: 0.40, deduction: 2796000 },
  { upTo: Infinity, rate: 0.45, deduction: 4796000 },
];
function incomeTaxBracket(taxable) {
  if (taxable <= 0) return 0;
  const b = INCOME_TAX_BRACKETS.find(b => taxable <= b.upTo);
  return Math.max(taxable * b.rate - b.deduction, 0);
}

const DEFAULT_SETTINGS = {
  prev_year_income_override: null,
  kokuho_rate_pct: 10.58, kokuho_flat_jpy: 67073, kokuho_deduction_jpy: 430000, kokuho_proration_months: 12,
  nenkin_monthly_jpy: 17920,
  income_tax_base_deduction_jpy: 480000, income_tax_blue_return_deduction_jpy: 0, income_tax_other_deductions_jpy: 0,
  reconstruction_surtax_pct: 2.1,
  juminzei_deduction_jpy: 430000, juminzei_proportional_pct: 10, juminzei_flat_jpy: 5000,
  jigyozei_threshold_jpy: 2900000, jigyozei_rate_pct: 5,
  consumption_tax_subject: false, consumption_tax_invoice_registered: false, consumption_tax_manual_amount_jpy: 0,
  safety_reserve_pct: 25,
};

const EXPENSE_CATEGORIES = ["Hébergement", "Domaine", "Logiciels", "Publicité", "Frais PayPal/Stripe", "Comptable", "Déplacements", "Fournitures", "Autre"];

export default function ChargesTab({ tokens }) {
  const { BG, SURFACE, BORDER, RED, VIOLET, ALERT, INK, MUTED, BODY } = tokens;

  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showSettings, setShowSettings] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [settingsForm, setSettingsForm] = useState(null);
  const [expenseEditing, setExpenseEditing] = useState(null);
  const [expenseForm, setExpenseForm] = useState(null);
  const [savingsInput, setSavingsInput] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: o }, { data: s }, { data: e }, { data: sv }] = await Promise.all([
      supabase.from("orders").select("purchase_date, service_fee_jpy"),
      supabase.from("business_tax_settings").select("*").limit(1).maybeSingle(),
      supabase.from("business_expenses").select("*").order("sort_order"),
      supabase.from("business_savings").select("*").limit(1).maybeSingle(),
    ]);
    setOrders(o || []);
    setSettings(s || null);
    setSettingsForm(s || DEFAULT_SETTINGS);
    setExpenses(e || []);
    setSavings(sv || null);
    setSavingsInput(sv?.reserved_jpy != null ? String(sv.reserved_jpy) : "");
    setLoading(false);
  }

  // Explicit action, not an auto-insert-on-empty-load side effect — the
  // latter double-fires (and double-inserts) under React StrictMode's dev
  // double-invoke of effects.
  async function initSettings() {
    const { data } = await supabase.from("business_tax_settings").insert(DEFAULT_SETTINGS).select().single();
    setSettings(data);
    setSettingsForm(data);
  }

  async function saveSettings() {
    const payload = { ...settingsForm, updated_at: new Date().toISOString() };
    delete payload.id;
    if (settings?.id) {
      await supabase.from("business_tax_settings").update(payload).eq("id", settings.id);
      setSettings(prev => ({ ...prev, ...payload }));
    } else {
      const { data } = await supabase.from("business_tax_settings").insert(payload).select().single();
      setSettings(data);
    }
    setMsg("✓ Paramètres enregistrés.");
    setTimeout(() => setMsg(""), 3000);
  }

  const years = useMemo(() => {
    const set = new Set(orders.map(o => o.purchase_date?.slice(0, 4)).filter(Boolean));
    set.add(String(new Date().getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [orders]);

  function revenueForYear(y) {
    return orders.filter(o => o.purchase_date?.slice(0, 4) === String(y)).reduce((s, o) => s + (o.service_fee_jpy || 0), 0);
  }

  // Expenses are configured as an ongoing monthly/annual run-rate, not a
  // historical per-year ledger — so the same annualised total is used for
  // whichever year is being looked at (including the prior year, when
  // estimating last year's profit for Kokuho/Jūminzei below).
  const annualExpenses = useMemo(() => {
    return expenses.reduce((s, e) => s + (e.frequency === "monthly" ? (Number(e.amount_jpy) || 0) * 12 : (Number(e.amount_jpy) || 0)), 0);
  }, [expenses]);

  function profitForYear(y) {
    return revenueForYear(y) - annualExpenses;
  }

  const calc = useMemo(() => {
    const st = settings || DEFAULT_SETTINGS;
    const revenue = revenueForYear(year);
    const profit = profitForYear(year); // can be negative (déficit) — shown as-is

    const prevYearProfit = profitForYear(year - 1);
    const prevYearIncome = st.prev_year_income_override != null && st.prev_year_income_override !== ""
      ? Number(st.prev_year_income_override)
      : Math.max(prevYearProfit, 0);

    // ── Kokuho (health insurance) — based on prior-year income, prorated ──
    const kokuhoFull = Math.max(prevYearIncome - Number(st.kokuho_deduction_jpy), 0) * (Number(st.kokuho_rate_pct) / 100) + Number(st.kokuho_flat_jpy);
    const kokuho = kokuhoFull * (Math.min(Math.max(Number(st.kokuho_proration_months), 0), 12) / 12);

    // ── Nenkin (pension) — flat, unrelated to income ──
    const nenkin = Number(st.nenkin_monthly_jpy) * 12;

    // ── Shotokuzei (income tax) — this year's profit, minus deductions ──
    const socialPremiumsPaid = kokuho + nenkin; // 社会保険料控除
    const taxableIncome = Math.max(
      profit
      - Number(st.income_tax_base_deduction_jpy)
      - socialPremiumsPaid
      - Number(st.income_tax_blue_return_deduction_jpy)
      - Number(st.income_tax_other_deductions_jpy),
      0
    );
    const incomeTaxBase = incomeTaxBracket(taxableIncome);
    const incomeTax = incomeTaxBase * (1 + Number(st.reconstruction_surtax_pct) / 100);

    // ── Jūminzei (resident tax) — prior-year income, simplified single deduction ──
    const juminzeiTaxable = Math.max(prevYearIncome - Number(st.juminzei_deduction_jpy), 0);
    const juminzeiProportional = juminzeiTaxable * (Number(st.juminzei_proportional_pct) / 100);
    const juminzei = juminzeiProportional + Number(st.juminzei_flat_jpy);

    // ── Kojin Jigyōzei (individual business tax) — this year's profit, threshold ──
    const jigyozei = Math.max(profit - Number(st.jigyozei_threshold_jpy), 0) * (Number(st.jigyozei_rate_pct) / 100);

    // ── Shōhizei (consumption tax) — manual, only if flagged as subject ──
    const shohizei = st.consumption_tax_subject ? Number(st.consumption_tax_manual_amount_jpy) : 0;

    const totalTaxes = kokuho + nenkin + incomeTax + juminzei + jigyozei + shohizei;
    const remainingIncome = profit - totalTaxes;
    const safetyReserve = Math.max(profit, 0) * (Number(st.safety_reserve_pct) / 100);

    return {
      revenue, profit, prevYearProfit, prevYearIncome,
      kokuho, kokuhoFull, nenkin, socialPremiumsPaid, taxableIncome, incomeTaxBase, incomeTax,
      juminzeiTaxable, juminzeiProportional, juminzei, jigyozei, shohizei,
      totalTaxes, remainingIncome, safetyReserve,
    };
  }, [orders, settings, annualExpenses, year]);

  const monthly = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!o.purchase_date?.startsWith(String(year))) return;
      const key = o.purchase_date.slice(0, 7);
      map[key] = (map[key] || 0) + (o.service_fee_jpy || 0);
    });
    // Expenses are configured as an ongoing run-rate, not tracked per actual
    // month, so each month absorbs an even 1/12 share of the annual total.
    const monthlyExpenseShare = annualExpenses / 12;
    let cumulative = 0;
    let cumulativeProfit = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      const rev = map[key] || 0;
      const profit = rev - monthlyExpenseShare;
      cumulative += rev;
      cumulativeProfit += profit;
      return { key, label: new Date(key + "-01").toLocaleDateString("fr-FR", { month: "short" }), revenue: rev, cumulative, profit, cumulativeProfit };
    });
  }, [orders, year]);

  const reserved = Number(savings?.reserved_jpy) || 0;
  const remainingToSave = Math.max(calc.totalTaxes - reserved, 0);
  const now = new Date();
  const isCurrentYear = year === now.getFullYear();
  const monthsLeft = isCurrentYear ? Math.max(12 - now.getMonth(), 1) : 12;
  const perMonth = remainingToSave / monthsLeft;

  function startAddExpense() {
    setExpenseEditing("new");
    setExpenseForm({ label: "", category: EXPENSE_CATEGORIES[0], amount_jpy: 0, frequency: "monthly", notes: "", sort_order: expenses.length + 1 });
  }
  function startEditExpense(e) {
    setExpenseEditing(e.id);
    setExpenseForm({ ...e });
  }
  async function saveExpense() {
    if (!expenseForm.label.trim()) return;
    const payload = {
      label: expenseForm.label, category: expenseForm.category,
      amount_jpy: Number(expenseForm.amount_jpy) || 0, frequency: expenseForm.frequency,
      notes: expenseForm.notes || null, sort_order: Number(expenseForm.sort_order) || 0,
    };
    if (expenseEditing === "new") {
      const { data } = await supabase.from("business_expenses").insert(payload).select().single();
      if (data) setExpenses(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      await supabase.from("business_expenses").update(payload).eq("id", expenseEditing);
      setExpenses(prev => prev.map(e => e.id === expenseEditing ? { ...e, ...payload } : e).sort((a, b) => a.sort_order - b.sort_order));
    }
    setExpenseEditing(null);
    setExpenseForm(null);
  }
  async function deleteExpense(id) {
    if (!confirm("Supprimer cette dépense ?")) return;
    await supabase.from("business_expenses").delete().eq("id", id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  async function saveSavingsAmount() {
    const amount = Number(savingsInput) || 0;
    if (savings?.id) {
      await supabase.from("business_savings").update({ reserved_jpy: amount, updated_at: new Date().toISOString() }).eq("id", savings.id);
      setSavings(prev => ({ ...prev, reserved_jpy: amount }));
    } else {
      const { data } = await supabase.from("business_savings").insert({ reserved_jpy: amount }).select().single();
      setSavings(data);
    }
    setMsg("✓ Montant mis à jour.");
    setTimeout(() => setMsg(""), 3000);
  }

  const inp = { width: "100%", padding: ".55rem .75rem", border: `1px solid ${BORDER}`, borderRadius: "6px", fontSize: ".82rem", fontFamily: BODY, background: BG, color: INK, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: ".65rem", fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: ".3rem", fontFamily: BODY };
  const row = (label, value, opts = {}) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".55rem 0", borderBottom: opts.noBorder ? "none" : `1px solid ${BORDER}` }}>
      <span style={{ fontSize: opts.bold ? ".9rem" : ".82rem", color: opts.bold ? INK : MUTED, fontWeight: opts.bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: opts.bold ? "1.05rem" : ".88rem", fontWeight: opts.bold ? 700 : 500, color: opts.color || INK }}>{value}</span>
    </div>
  );

  if (loading) return <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Chargement…</p>;

  if (!settings) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: MUTED, fontSize: ".85rem", marginBottom: "1rem" }}>Premier lancement — initialise les paramètres de calcul (taux, seuils, déductions).</p>
        <button onClick={initSettings} style={{ background: RED, color: "#fff", border: "none", borderRadius: "8px", padding: ".6rem 1.2rem", fontSize: ".82rem", fontWeight: 600, cursor: "pointer" }}>
          Initialiser les paramètres
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: BODY }}>

      {/* Disclaimer */}
      <div style={{ background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.35)", borderRadius: "10px", padding: "1rem 1.2rem", marginBottom: "1.5rem", fontSize: ".8rem", color: INK, lineHeight: 1.6 }}>
        ⚠️ <strong>Outil de calcul indicatif, pas un conseil fiscal.</strong> Chaque taxe utilise sa vraie base (bénéfice, revenu imposable, ou revenu de l'année précédente selon le cas) plutôt qu'un pourcentage plat du CA — mais les taux, seuils et déductions restent des repères à vérifier avec un comptable (税理士) ou ta mairie. La Jūminzei et le Kokuho utilisent une approximation du revenu N-1 basée sur tes commandes historiques ; remplace-la par le vrai montant de ton avis d'imposition dans les paramètres dès que tu l'as.
      </div>

      {/* Year */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={lbl}>Année</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...inp, width: "auto", padding: ".5rem .8rem" }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Main dashboard */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, marginBottom: "1rem" }}>Estimation {year}</p>

        {row("CA Kizuna", fmtYen(calc.revenue), { bold: true })}
        {row("Dépenses professionnelles", "− " + fmtYen(annualExpenses), { color: MUTED })}
        {row("Bénéfice", fmtYen(calc.profit), { bold: true, color: calc.profit >= 0 ? RED : ALERT })}

        <div style={{ height: "1px", background: BORDER, margin: ".6rem 0" }} />

        {row("Kokuho estimé (assurance maladie)", "− " + fmtYen(calc.kokuho), { color: MUTED })}
        {row("Nenkin (retraite)", "− " + fmtYen(calc.nenkin), { color: MUTED })}
        {row("Impôt sur le revenu estimé", "− " + fmtYen(calc.incomeTax), { color: MUTED })}
        {row("Jūminzei estimée", "− " + fmtYen(calc.juminzei), { color: MUTED })}
        {row("Kojin Jigyōzei", "− " + fmtYen(calc.jigyozei), { color: MUTED })}
        {row("Shōhizei", "− " + fmtYen(calc.shohizei), { color: MUTED, noBorder: !settings.consumption_tax_subject })}
        {!settings.consumption_tax_subject && (
          <p style={{ fontSize: ".68rem", color: MUTED, marginTop: "-.3rem", marginBottom: ".5rem" }}>Non assujetti à la TVA (configurable dans Paramètres).</p>
        )}

        <div style={{ height: "1px", background: BORDER, margin: ".6rem 0" }} />

        {row("Total charges/taxes estimées", fmtYen(calc.totalTaxes), { bold: true, color: RED })}
        {row("Revenu restant estimé", fmtYen(calc.remainingIncome), { bold: true, color: calc.remainingIncome >= 0 ? "#22c55e" : ALERT, noBorder: true })}
      </div>

      {/* Two distinct results */}
      <div className="adm-stat-grid" style={{ "--cols": 2, marginBottom: "1.5rem" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.2rem" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: RED }}>{fmtYen(calc.totalTaxes)}</div>
          <div style={{ fontSize: ".72rem", color: MUTED, marginTop: ".3rem", fontWeight: 600 }}>Charges fiscales estimées</div>
          <div style={{ fontSize: ".68rem", color: MUTED, marginTop: ".2rem" }}>Calcul détaillé selon les règles configurées ci-dessous.</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${VIOLET}`, borderRadius: "10px", padding: "1.2rem" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: VIOLET }}>{fmtYen(calc.safetyReserve)}</div>
          <div style={{ fontSize: ".72rem", color: MUTED, marginTop: ".3rem", fontWeight: 600 }}>Réserve de sécurité recommandée ({settings.safety_reserve_pct}% du bénéfice)</div>
          <div style={{ fontSize: ".68rem", color: MUTED, marginTop: ".2rem" }}>Outil de trésorerie simple — pas le montant réel des taxes.</div>
        </div>
      </div>

      {/* Monthly reserve tracker */}
      <div className="adm-stat-grid" style={{ "--cols": 3, marginBottom: "1.5rem" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: VIOLET }}>{fmtYen(reserved)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Déjà mis de côté</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: remainingToSave > 0 ? ALERT : "#22c55e" }}>{fmtYen(remainingToSave)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Reste à épargner (charges fiscales)</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: INK }}>{fmtYen(perMonth)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Réserve mensuelle recommandée ({monthsLeft} mois restants)</div>
        </div>
      </div>

      {/* Calculation detail (collapsible) */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowDetail(v => !v)} style={{ background: "transparent", border: "none", color: INK, fontSize: ".9rem", fontWeight: 600, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: ".5rem" }}>
          {showDetail ? "▾" : "▸"} Détail du calcul
        </button>
        {showDetail && (
          <div style={{ marginTop: "1rem" }}>
            {row("Revenu N-1 utilisé (Kokuho + Jūminzei)", fmtYen(calc.prevYearIncome), { color: MUTED })}
            <p style={{ fontSize: ".68rem", color: MUTED, margin: "-.2rem 0 .6rem" }}>
              {settings.prev_year_income_override != null && settings.prev_year_income_override !== "" ? "Valeur saisie manuellement dans Paramètres." : `Estimé depuis le bénéfice ${year - 1} (¥${fmtYen(calc.prevYearProfit).slice(1)}) faute de override — à remplacer par ton vrai revenu N-1 dès que possible.`}
            </p>
            {row("Kokuho plein tarif (avant prorata)", fmtYen(calc.kokuhoFull), { color: MUTED })}
            {row("Cotisations sociales déductibles (Kokuho+Nenkin)", fmtYen(calc.socialPremiumsPaid), { color: MUTED })}
            {row("Revenu imposable (impôt sur le revenu)", fmtYen(calc.taxableIncome), { color: MUTED })}
            {row("Impôt sur le revenu avant surtaxe", fmtYen(calc.incomeTaxBase), { color: MUTED })}
            {row("Base imposable Jūminzei", fmtYen(calc.juminzeiTaxable), { color: MUTED })}
            {row("Jūminzei — part proportionnelle", fmtYen(calc.juminzeiProportional), { color: MUTED, noBorder: true })}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, margin: 0 }}>Dépenses professionnelles</p>
            <p style={{ fontSize: ".72rem", color: MUTED, marginTop: ".2rem" }}>Déduites du CA pour obtenir le bénéfice — total annualisé : {fmtYen(annualExpenses)}</p>
          </div>
          <button onClick={startAddExpense} style={{ background: RED, color: "#fff", border: "none", padding: ".45rem .85rem", borderRadius: "7px", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+ Ajouter une dépense</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {expenses.map(e => (
            <div key={e.id} style={{ border: `1px solid ${BORDER}`, borderRadius: "8px", padding: ".7rem .9rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: ".83rem", color: INK, fontWeight: 500 }}>{e.label}</span>
                <span style={{ fontSize: ".7rem", color: MUTED, marginLeft: ".5rem" }}>({e.category || "Autre"})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                <span style={{ fontSize: ".85rem", color: RED, fontWeight: 600 }}>{fmtYen(e.amount_jpy)} {e.frequency === "monthly" ? "/mois" : "/an"}</span>
                <button onClick={() => startEditExpense(e)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "6px", padding: ".3rem .55rem", fontSize: ".68rem", cursor: "pointer" }}>Modifier</button>
                <button onClick={() => deleteExpense(e.id)} style={{ background: "rgba(255,80,96,.1)", border: `1px solid rgba(255,80,96,.3)`, color: ALERT, borderRadius: "6px", padding: ".3rem .55rem", fontSize: ".68rem", cursor: "pointer" }}>Supprimer</button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p style={{ color: MUTED, fontSize: ".8rem", textAlign: "center", padding: "1rem" }}>Aucune dépense enregistrée — le bénéfice équivaut donc au CA.</p>}
        </div>

        {expenseEditing && (
          <div style={{ background: BG, border: `2px solid ${RED}`, borderRadius: "10px", padding: "1rem", marginTop: "1rem" }}>
            <div style={{ marginBottom: ".7rem" }}>
              <label style={lbl}>Libellé</label>
              <input style={inp} value={expenseForm.label} onChange={e => setExpenseForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex : Hébergement Vercel" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".7rem", marginBottom: ".7rem" }}>
              <div>
                <label style={lbl}>Catégorie</label>
                <select style={inp} value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Montant (¥)</label>
                <input style={inp} type="number" value={expenseForm.amount_jpy} onChange={e => setExpenseForm(f => ({ ...f, amount_jpy: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Fréquence</label>
                <select style={inp} value={expenseForm.frequency} onChange={e => setExpenseForm(f => ({ ...f, frequency: e.target.value }))}>
                  <option value="monthly">Mensuelle</option>
                  <option value="annual">Annuelle</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <button onClick={saveExpense} style={{ background: RED, color: "#fff", border: "none", padding: ".55rem 1rem", borderRadius: "7px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer" }}>Enregistrer</button>
              <button onClick={() => { setExpenseEditing(null); setExpenseForm(null); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: ".55rem 1rem", borderRadius: "7px", fontSize: ".78rem", cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowSettings(v => !v)} style={{ background: "transparent", border: "none", color: INK, fontSize: "1rem", fontWeight: 600, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: ".5rem" }}>
          {showSettings ? "▾" : "▸"} Paramètres (taux, seuils, déductions)
        </button>
        {showSettings && (
          <div style={{ marginTop: "1.2rem" }}>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Revenu de l'année précédente</p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Override manuel (¥) — laisse vide pour estimer automatiquement</label>
              <input style={inp} type="number" value={settingsForm.prev_year_income_override ?? ""} onChange={e => setSettingsForm(f => ({ ...f, prev_year_income_override: e.target.value === "" ? null : e.target.value }))} placeholder="Ex : 3500000" />
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Kokuho (assurance maladie)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: ".7rem", marginBottom: "1rem" }}>
              <div><label style={lbl}>Taux (%)</label><input style={inp} type="number" step="0.01" value={settingsForm.kokuho_rate_pct} onChange={e => setSettingsForm(f => ({ ...f, kokuho_rate_pct: e.target.value }))} /></div>
              <div><label style={lbl}>Part forfaitaire (¥)</label><input style={inp} type="number" value={settingsForm.kokuho_flat_jpy} onChange={e => setSettingsForm(f => ({ ...f, kokuho_flat_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Abattement (¥)</label><input style={inp} type="number" value={settingsForm.kokuho_deduction_jpy} onChange={e => setSettingsForm(f => ({ ...f, kokuho_deduction_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Mois d'affiliation</label><input style={inp} type="number" min="0" max="12" value={settingsForm.kokuho_proration_months} onChange={e => setSettingsForm(f => ({ ...f, kokuho_proration_months: e.target.value }))} /></div>
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Nenkin (retraite)</p>
            <div style={{ marginBottom: "1rem", maxWidth: "220px" }}>
              <label style={lbl}>Cotisation mensuelle (¥)</label>
              <input style={inp} type="number" value={settingsForm.nenkin_monthly_jpy} onChange={e => setSettingsForm(f => ({ ...f, nenkin_monthly_jpy: e.target.value }))} />
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Impôt sur le revenu (Shotokuzei)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: ".7rem", marginBottom: "1rem" }}>
              <div><label style={lbl}>Déduction de base (¥)</label><input style={inp} type="number" value={settingsForm.income_tax_base_deduction_jpy} onChange={e => setSettingsForm(f => ({ ...f, income_tax_base_deduction_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Déduction Blue Return (¥)</label><input style={inp} type="number" value={settingsForm.income_tax_blue_return_deduction_jpy} onChange={e => setSettingsForm(f => ({ ...f, income_tax_blue_return_deduction_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Autres déductions (¥)</label><input style={inp} type="number" value={settingsForm.income_tax_other_deductions_jpy} onChange={e => setSettingsForm(f => ({ ...f, income_tax_other_deductions_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Surtaxe reconstruction (%)</label><input style={inp} type="number" step="0.1" value={settingsForm.reconstruction_surtax_pct} onChange={e => setSettingsForm(f => ({ ...f, reconstruction_surtax_pct: e.target.value }))} /></div>
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Jūminzei (taxe d'habitation)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".7rem", marginBottom: "1rem" }}>
              <div><label style={lbl}>Abattement (¥)</label><input style={inp} type="number" value={settingsForm.juminzei_deduction_jpy} onChange={e => setSettingsForm(f => ({ ...f, juminzei_deduction_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Part proportionnelle (%)</label><input style={inp} type="number" step="0.1" value={settingsForm.juminzei_proportional_pct} onChange={e => setSettingsForm(f => ({ ...f, juminzei_proportional_pct: e.target.value }))} /></div>
              <div><label style={lbl}>Part forfaitaire (¥/an)</label><input style={inp} type="number" value={settingsForm.juminzei_flat_jpy} onChange={e => setSettingsForm(f => ({ ...f, juminzei_flat_jpy: e.target.value }))} /></div>
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Kojin Jigyōzei (taxe professionnelle)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem", marginBottom: "1rem" }}>
              <div><label style={lbl}>Seuil / abattement (¥)</label><input style={inp} type="number" value={settingsForm.jigyozei_threshold_jpy} onChange={e => setSettingsForm(f => ({ ...f, jigyozei_threshold_jpy: e.target.value }))} /></div>
              <div><label style={lbl}>Taux (%)</label><input style={inp} type="number" step="0.1" value={settingsForm.jigyozei_rate_pct} onChange={e => setSettingsForm(f => ({ ...f, jigyozei_rate_pct: e.target.value }))} /></div>
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Shōhizei (TVA)</p>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: INK, cursor: "pointer" }}>
                <input type="checkbox" checked={!!settingsForm.consumption_tax_subject} onChange={e => setSettingsForm(f => ({ ...f, consumption_tax_subject: e.target.checked }))} />
                Assujetti à la TVA
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".82rem", color: INK, cursor: "pointer" }}>
                <input type="checkbox" checked={!!settingsForm.consumption_tax_invoice_registered} onChange={e => setSettingsForm(f => ({ ...f, consumption_tax_invoice_registered: e.target.checked }))} />
                Inscrit au système Invoice (インボイス)
              </label>
              {settingsForm.consumption_tax_subject && (
                <div style={{ minWidth: "180px" }}>
                  <label style={lbl}>Montant estimé (¥/an)</label>
                  <input style={inp} type="number" value={settingsForm.consumption_tax_manual_amount_jpy} onChange={e => setSettingsForm(f => ({ ...f, consumption_tax_manual_amount_jpy: e.target.value }))} />
                </div>
              )}
            </div>

            <p style={{ fontSize: ".78rem", fontWeight: 600, color: INK, marginBottom: ".6rem" }}>Réserve de sécurité</p>
            <div style={{ marginBottom: "1.2rem", maxWidth: "220px" }}>
              <label style={lbl}>% du bénéfice</label>
              <input style={inp} type="number" value={settingsForm.safety_reserve_pct} onChange={e => setSettingsForm(f => ({ ...f, safety_reserve_pct: e.target.value }))} />
            </div>

            <button onClick={saveSettings} style={{ background: RED, color: "#fff", border: "none", padding: ".6rem 1.2rem", borderRadius: "8px", fontSize: ".82rem", fontWeight: 600, cursor: "pointer" }}>Enregistrer les paramètres</button>
            {msg && <p style={{ color: "#22c55e", fontSize: ".78rem", marginTop: ".6rem" }}>{msg}</p>}
          </div>
        )}
      </div>

      {/* Monthly revenue context */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem", overflowX: "auto" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, marginBottom: ".3rem" }}>CA et bénéfice mois par mois — {year}</p>
        <p style={{ fontSize: ".68rem", color: MUTED, marginBottom: "1rem" }}>Le bénéfice mensuel répartit les dépenses professionnelles annualisées à parts égales sur les 12 mois (¥{fmtYen(annualExpenses / 12).slice(1)}/mois) — ce n'est pas un suivi de dépenses réelles mois par mois.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
          <thead>
            <tr>{["Mois", "CA du mois", "CA cumulé", "Bénéfice du mois", "Bénéfice cumulé"].map(h => (
              <th key={h} style={{ padding: ".5rem .7rem", textAlign: "left", fontSize: ".64rem", letterSpacing: ".06em", textTransform: "uppercase", color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.key} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: ".5rem .7rem", color: INK, fontWeight: 500, textTransform: "capitalize" }}>{m.label}</td>
                <td style={{ padding: ".5rem .7rem", color: MUTED }}>{fmtYen(m.revenue)}</td>
                <td style={{ padding: ".5rem .7rem", color: MUTED }}>{fmtYen(m.cumulative)}</td>
                <td style={{ padding: ".5rem .7rem", color: m.profit >= 0 ? RED : ALERT, fontWeight: 500 }}>{fmtYen(m.profit)}</td>
                <td style={{ padding: ".5rem .7rem", color: m.cumulativeProfit >= 0 ? RED : ALERT }}>{fmtYen(m.cumulativeProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Savings tracker */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem" }}>
        <p style={{ fontSize: ".9rem", fontWeight: 600, color: INK, marginBottom: ".8rem" }}>Mettre à jour le montant déjà mis de côté</p>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={lbl}>Montant réservé (¥)</label>
            <input style={inp} type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="0" />
          </div>
          <button onClick={saveSavingsAmount} style={{ background: RED, color: "#fff", border: "none", padding: ".6rem 1.1rem", borderRadius: "8px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}>Mettre à jour</button>
        </div>
      </div>
    </div>
  );
}
