// @ts-nocheck
"use client";
// app/components/admin/ChargesTab.tsx
//
// "Combien dois-je mettre de côté pour mes charges japonaises ?" — un
// calculateur, pas un conseil fiscal. Chaque ligne (assurance, retraite,
// impôts, frais Kizuna...) est soit un pourcentage du chiffre d'affaires,
// soit un montant fixe annuel, et entièrement modifiable : les valeurs de
// départ sont des repères grossiers pour un auto-entrepreneur (kojin
// jigyou), pas des taux réels — l'impôt sur le revenu japonais en
// particulier est progressif et ne peut pas être approximé par un seul
// pourcentage plat. À vérifier avec un comptable (税理士) ou le bureau des
// impôts / la mairie avant de s'y fier.

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";

// Sourced from official/authoritative Japanese references (checked August
// 2026, FY2026 = avril 2026-mars 2027). Health insurance and income tax are
// genuinely formula/bracket-based, not flat rates — the % here is a rough
// starting point only; the real structure and sources are in each note.
const STARTER_CHARGES = [
  { label: "Assurance maladie (Kokumin Kenkō Hoken)", type: "percentage", rate: 10, fixed_amount_jpy: null,
    notes: "Calcul réel = (revenu N-1 − 430 000¥ d'abattement) × taux communal + part forfaitaire par personne — le % ici n'est qu'un repère. Plafond national FY2026 : ¥1 130 000/an (médical ¥670k + soutien seniors ¥260k + dépendance 40-64 ans ¥170k + nouvelle part enfance ¥30k, incluse). Vérifie le taux exact auprès de ta mairie. Sources : décret 令和8年政令第2号 (janv. 2026), résumé sur freee.co.jp/kb/kb-trend/national-health-insurance-cap-increase, guide de Shinjuku city.shinjuku.lg.jp/content/000339876.pdf",
    sort_order: 1 },
  { label: "Retraite nationale (Kokumin Nenkin)", type: "fixed", rate: null, fixed_amount_jpy: 215040,
    notes: "Cotisation fixe nationale FY2026 (avril 2026-mars 2027) : ¥17 920/mois × 12. Revalorisée chaque avril — vérifie le montant en vigueur. Une remise existe si tu paies plusieurs mois à l'avance (前納). Source officielle (日本年金機構) : nenkin.go.jp/service/kokunen/hokenryo/hokenryo.html",
    sort_order: 2 },
  { label: "Impôt sur le revenu (Shotokuzei)", type: "percentage", rate: 5, fixed_amount_jpy: null,
    notes: "Progressif par tranches (barème national) : 5% jusqu'à ¥1 949 000, 10% jusqu'à ¥3 299 000 (-¥97 500), 20% jusqu'à ¥6 949 000 (-¥427 500), 23% jusqu'à ¥8 999 000 (-¥636 000), 33% au-delà. + 2,1% de surtaxe de reconstruction sur l'impôt dû. Recalcule avec ton revenu net réel — 5% est un repère bas revenu, pas un taux fixe. Source (国税庁) : nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm",
    sort_order: 3 },
  { label: "Taxe d'habitant — part proportionnelle (Jūminzei)", type: "percentage", rate: 10, fixed_amount_jpy: null,
    notes: "10% du revenu imposable de l'année précédente (4% préfecture + 6% commune) — taux standard national. Source (総務省) : soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_06.html",
    sort_order: 4 },
  { label: "Taxe d'habitant — part forfaitaire (Kintō-wari)", type: "fixed", rate: null, fixed_amount_jpy: 5000,
    notes: "Part fixe par personne : ¥4 000/an standard + ¥1 000/an de taxe environnementale forestière (depuis FY2024) = ¥5 000/an. Source (総務省) : soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_18.html",
    sort_order: 5 },
  { label: "Taxe professionnelle individuelle (Kojin Jigyōzei)", type: "percentage", rate: 5, fixed_amount_jpy: null,
    notes: "5% sur (bénéfice − abattement de ¥2 900 000/an) — en dessous du seuil, pas de taxe. La vente pour compte de tiers (代理業) et la vente de biens (物品販売業) — ce que fait Kizuna — sont explicitement des catégories imposées à 5% selon la métropole de Tokyo. Source : tax.metro.tokyo.lg.jp/kazei/work/kojin_ji",
    sort_order: 6 },
  { label: "Taxe sur la consommation (Shōhizei)", type: "fixed", rate: null, fixed_amount_jpy: 0,
    notes: "Exonéré tant que le CA imposable des 2 années précédentes ≤ ¥10 000 000. Mais si tu t'inscris comme émetteur de factures qualifiées (インボイス制度, pour des clients B2B qui en ont besoin), tu deviens redevable même en dessous — une mesure transitoire plafonne alors la taxe à 20% de la TVA collectée les premières années. Mets à jour si ta situation change. Source (国税庁) : nta.go.jp/taxes/shiraberu/taxanswer/shohi/6501.htm",
    sort_order: 7 },
  { label: "Frais professionnels Kizuna (annuels)", type: "fixed", rate: null, fixed_amount_jpy: 0,
    notes: "Hébergement, logiciels, comptable, renouvellements divers — à remplir toi-même.",
    sort_order: 8 },
];

function fmtYen(n) {
  return "¥" + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function ChargesTab({ tokens }) {
  const { BG, SURFACE, SURFACE2, BORDER, RED, VIOLET, ALERT, INK, MUTED, PIXEL, BODY } = tokens;

  const [orders, setOrders] = useState([]);
  const [charges, setCharges] = useState([]);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [savingsInput, setSavingsInput] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: o }, { data: c }, { data: s }] = await Promise.all([
      supabase.from("orders").select("purchase_date, service_fee_jpy"),
      supabase.from("business_charges").select("*").order("sort_order"),
      supabase.from("business_savings").select("*").limit(1).maybeSingle(),
    ]);
    setOrders(o || []);
    setCharges(c || []);
    setSavings(s || null);
    setSavingsInput(s?.reserved_jpy != null ? String(s.reserved_jpy) : "");
    setLoading(false);
  }

  // Explicit, one-time action rather than an auto-insert-on-empty-load side
  // effect — the latter double-fires (and double-inserts) under React
  // StrictMode's dev double-invoke of effects.
  async function seedStarters() {
    const { data: seeded } = await supabase.from("business_charges").insert(STARTER_CHARGES).select();
    setCharges(seeded || []);
  }

  const years = useMemo(() => {
    const set = new Set(orders.map(o => o.purchase_date?.slice(0, 4)).filter(Boolean));
    set.add(String(new Date().getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [orders]);

  const revenue = useMemo(() => {
    return orders
      .filter(o => o.purchase_date?.slice(0, 4) === String(year))
      .reduce((s, o) => s + (o.service_fee_jpy || 0), 0);
  }, [orders, year]);

  // What one charge line costs for a given month's actual revenue — the
  // fixed ones (nenkin, kintō-wari...) are billed the same every month
  // regardless of how much came in, so they're just the annual amount ÷ 12;
  // the percentage ones scale with that month's real revenue.
  function chargeForMonth(c, monthRevenue) {
    return c.type === "percentage" ? monthRevenue * (Number(c.rate) || 0) / 100 : (Number(c.fixed_amount_jpy) || 0) / 12;
  }

  // Month-by-month: real revenue per month → real charges per month, rather
  // than one annual lump smeared evenly across 12 months.
  const monthly = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!o.purchase_date?.startsWith(String(year))) return;
      const key = o.purchase_date.slice(0, 7); // YYYY-MM
      map[key] = (map[key] || 0) + (o.service_fee_jpy || 0);
    });
    const monthKeys = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
    return monthKeys.map(key => {
      const monthRevenue = map[key] || 0;
      const perCharge = charges.map(c => ({ label: c.label, amount: chargeForMonth(c, monthRevenue) }));
      const total = perCharge.reduce((s, c) => s + c.amount, 0);
      const label = new Date(key + "-01").toLocaleDateString("fr-FR", { month: "short" });
      return { key, label, revenue: monthRevenue, total, perCharge };
    });
  }, [orders, charges, year]);

  const computed = useMemo(() => {
    return charges.map(c => ({
      ...c,
      amount: c.type === "percentage" ? revenue * (Number(c.rate) || 0) / 100 : Number(c.fixed_amount_jpy) || 0,
    }));
  }, [charges, revenue]);

  const totalCharges = monthly.reduce((s, m) => s + m.total, 0);
  const reserved = Number(savings?.reserved_jpy) || 0;
  const remaining = Math.max(totalCharges - reserved, 0);

  const now = new Date();
  const isCurrentYear = year === now.getFullYear();
  const currentMonthTotal = isCurrentYear ? (monthly[now.getMonth()]?.total || 0) : (totalCharges / 12);
  const monthsLeft = isCurrentYear ? Math.max(12 - now.getMonth(), 1) : 12;
  const perMonth = remaining / monthsLeft;

  function startAdd() {
    setEditing("new");
    setForm({ label: "", type: "percentage", rate: 0, fixed_amount_jpy: 0, notes: "", sort_order: charges.length + 1 });
  }
  function startEdit(c) {
    setEditing(c.id);
    setForm({ ...c });
  }
  async function saveForm() {
    if (!form.label.trim()) return;
    const payload = {
      label: form.label,
      type: form.type,
      rate: form.type === "percentage" ? Number(form.rate) || 0 : null,
      fixed_amount_jpy: form.type === "fixed" ? Number(form.fixed_amount_jpy) || 0 : null,
      notes: form.notes || null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing === "new") {
      const { data } = await supabase.from("business_charges").insert(payload).select().single();
      if (data) setCharges(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      await supabase.from("business_charges").update(payload).eq("id", editing);
      setCharges(prev => prev.map(c => c.id === editing ? { ...c, ...payload } : c).sort((a, b) => a.sort_order - b.sort_order));
    }
    setEditing(null);
    setForm(null);
  }
  async function deleteCharge(id) {
    if (!confirm("Supprimer cette rubrique ?")) return;
    await supabase.from("business_charges").delete().eq("id", id);
    setCharges(prev => prev.filter(c => c.id !== id));
  }

  async function saveSavings() {
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
  const lbl = { fontSize: ".68rem", fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: ".3rem", fontFamily: BODY };

  if (loading) return <p style={{ color: MUTED, padding: "2rem", textAlign: "center" }}>Chargement…</p>;

  return (
    <div style={{ fontFamily: BODY }}>

      {/* Disclaimer */}
      <div style={{ background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.35)", borderRadius: "10px", padding: "1rem 1.2rem", marginBottom: "1.5rem", fontSize: ".8rem", color: INK, lineHeight: 1.6 }}>
        ⚠️ <strong>Outil de calcul indicatif, pas un conseil fiscal.</strong> Les rubriques de départ sont sourcées (voir la note et le lien de chaque ligne, vérifiés août 2026 pour l'exercice FY2026) mais restent des repères pour un auto-entrepreneur (kojin jigyou) — l'assurance maladie et l'impôt sur le revenu dépendent de ton revenu réel, ta commune et ta situation, pas d'un seul pourcentage plat. Vérifie tes vrais montants avec un comptable (税理士) ou ta mairie/le bureau des impôts avant de t'y fier.
      </div>

      {/* Year + revenue */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <label style={lbl}>Année</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...inp, width: "auto", padding: ".5rem .8rem" }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1rem 1.3rem", flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: ".68rem", color: MUTED, marginBottom: ".2rem" }}>Chiffre d'affaires {year} (frais de service)</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 600, color: RED, fontFamily: BODY }}>{fmtYen(revenue)}</div>
        </div>
      </div>

      {/* Monthly breakdown — each month's charges are computed from that
          month's actual revenue, not a flat annual average. */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem", overflowX: "auto" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, marginBottom: "1rem" }}>Mois par mois — {year}</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
          <thead>
            <tr>
              {["Mois", "CA du mois", "Charges à provisionner", "Reste après charges"].map(h => (
                <th key={h} style={{ padding: ".5rem .7rem", textAlign: "left", fontSize: ".64rem", letterSpacing: ".06em", textTransform: "uppercase", color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.key} style={{ borderBottom: `1px solid ${BORDER}`, background: isCurrentYear && m.key === `${year}-${String(now.getMonth() + 1).padStart(2, "0")}` ? "rgba(224,48,64,.06)" : "transparent" }}
                title={m.perCharge.map(pc => `${pc.label}: ${fmtYen(pc.amount)}`).join("\n")}>
                <td style={{ padding: ".55rem .7rem", color: INK, fontWeight: 500, textTransform: "capitalize" }}>{m.label}</td>
                <td style={{ padding: ".55rem .7rem", color: MUTED }}>{fmtYen(m.revenue)}</td>
                <td style={{ padding: ".55rem .7rem", color: RED, fontWeight: 500 }}>{fmtYen(m.total)}</td>
                <td style={{ padding: ".55rem .7rem", color: m.revenue - m.total >= 0 ? MUTED : ALERT }}>{fmtYen(m.revenue - m.total)}</td>
              </tr>
            ))}
            <tr style={{ background: BG }}>
              <td style={{ padding: ".6rem .7rem", color: INK, fontWeight: 600 }}>TOTAL</td>
              <td style={{ padding: ".6rem .7rem", color: INK, fontWeight: 600 }}>{fmtYen(revenue)}</td>
              <td style={{ padding: ".6rem .7rem", color: RED, fontWeight: 600 }}>{fmtYen(totalCharges)}</td>
              <td style={{ padding: ".6rem .7rem", color: MUTED, fontWeight: 600 }}>{fmtYen(revenue - totalCharges)}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: ".68rem", color: MUTED, marginTop: ".7rem" }}>Survole une ligne pour voir le détail par rubrique de ce mois.</p>
      </div>

      {/* Charges table */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, margin: 0 }}>Règles de calcul</p>
            <p style={{ fontSize: ".72rem", color: MUTED, marginTop: ".2rem" }}>Ce sont les règles appliquées mois par mois ci-dessus — le montant ici est le total sur toute l'année {year}, pour référence.</p>
          </div>
          <button onClick={startAdd} style={{ background: RED, color: "#fff", border: "none", padding: ".45rem .85rem", borderRadius: "7px", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+ Ajouter une rubrique</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
          {computed.map(c => (
            <div key={c.id} style={{ border: `1px solid ${BORDER}`, borderRadius: "8px", padding: ".8rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontSize: ".85rem", fontWeight: 500, color: INK }}>{c.label}</div>
                  <div style={{ fontSize: ".72rem", color: MUTED, marginTop: ".2rem" }}>
                    {c.type === "percentage" ? `${c.rate}% du CA` : "Montant fixe annuel"}
                  </div>
                  {c.notes && <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem", fontStyle: "italic" }}>{c.notes}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: RED }}>{fmtYen(c.amount)}<span style={{ fontSize: ".68rem", color: MUTED, fontWeight: 400 }}> /an</span></div>
                  <div style={{ fontSize: ".78rem", color: MUTED, marginTop: ".1rem" }}>{fmtYen(c.amount / 12)} /mois</div>
                  <div style={{ display: "flex", gap: ".4rem", marginTop: ".4rem" }}>
                    <button onClick={() => startEdit(c)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: "6px", padding: ".3rem .6rem", fontSize: ".7rem", cursor: "pointer" }}>Modifier</button>
                    <button onClick={() => deleteCharge(c.id)} style={{ background: "rgba(255,80,96,.1)", border: `1px solid rgba(255,80,96,.3)`, color: ALERT, borderRadius: "6px", padding: ".3rem .6rem", fontSize: ".7rem", cursor: "pointer" }}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {computed.length === 0 && (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ color: MUTED, fontSize: ".82rem", marginBottom: "1rem" }}>Aucune rubrique.</p>
              <button onClick={seedStarters} style={{ background: "transparent", border: `1px solid ${RED}`, color: RED, borderRadius: "8px", padding: ".5rem 1rem", fontSize: ".78rem", fontWeight: 600, cursor: "pointer" }}>
                Charger les rubriques de départ (assurance, retraite, impôts…)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add form */}
      {editing && (
        <div style={{ background: SURFACE, border: `2px solid ${RED}`, borderRadius: "12px", padding: "1.3rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: ".9rem", fontWeight: 600, color: INK, marginBottom: "1rem" }}>{editing === "new" ? "Nouvelle rubrique" : "Modifier la rubrique"}</p>
          <div style={{ marginBottom: ".8rem" }}>
            <label style={lbl}>Nom</label>
            <input style={inp} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex : Mutuelle privée" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: ".8rem" }}>
            <div>
              <label style={lbl}>Type</label>
              <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Pourcentage du CA</option>
                <option value="fixed">Montant fixe annuel</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{form.type === "percentage" ? "Taux (%)" : "Montant (¥/an)"}</label>
              <input style={inp} type="number" value={form.type === "percentage" ? form.rate : form.fixed_amount_jpy}
                onChange={e => setForm(f => ({ ...f, [form.type === "percentage" ? "rate" : "fixed_amount_jpy"]: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Note (optionnel)</label>
            <input style={inp} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contexte, source, rappel…" />
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <button onClick={saveForm} style={{ background: RED, color: "#fff", border: "none", padding: ".6rem 1.1rem", borderRadius: "8px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}>Enregistrer</button>
            <button onClick={() => { setEditing(null); setForm(null); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: ".6rem 1.1rem", borderRadius: "8px", fontSize: ".8rem", cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="adm-stat-grid" style={{ "--cols": 5, marginBottom: "1.5rem" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, color: RED }}>{fmtYen(totalCharges)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Total annuel ({year})</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, color: RED }}>{fmtYen(currentMonthTotal)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>{isCurrentYear ? "Ce mois-ci (réel)" : "Moyenne mensuelle"}</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, color: VIOLET }}>{fmtYen(reserved)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Déjà mis de côté</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, color: remaining > 0 ? ALERT : "#22c55e" }}>{fmtYen(remaining)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Reste à épargner</div>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "1.1rem 1.2rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 600, color: INK }}>{fmtYen(perMonth)}</div>
          <div style={{ fontSize: ".7rem", color: MUTED, marginTop: ".3rem" }}>Par mois ({monthsLeft} mois restants)</div>
        </div>
      </div>

      {/* Savings tracker */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "1.3rem" }}>
        <p style={{ fontSize: ".9rem", fontWeight: 600, color: INK, marginBottom: ".8rem" }}>Mettre à jour le montant déjà mis de côté</p>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={lbl}>Montant réservé (¥)</label>
            <input style={inp} type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="0" />
          </div>
          <button onClick={saveSavings} style={{ background: RED, color: "#fff", border: "none", padding: ".6rem 1.1rem", borderRadius: "8px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}>Mettre à jour</button>
        </div>
        {msg && <p style={{ color: "#22c55e", fontSize: ".78rem", marginTop: ".6rem" }}>{msg}</p>}
      </div>
    </div>
  );
}
