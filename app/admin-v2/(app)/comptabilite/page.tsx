import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { loadOrdersForStats, loadPaidLinks, type EntityRow } from "../../lib/queries";
import { loadEntitiesSafe, loadExpenses, loadPaidLinksForJournal } from "../../lib/queriesAccounting";
import { annualExpenseTotal, buildReceipts, entityOn, monthlyExpenseAverage, summarizeByMonth } from "../../lib/accounting";
import { computeCommissions, currentMonthJst } from "../../lib/commissions";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { formatDateFr, monthLabelFr } from "../../lib/status";
import { Banner, DataError, PageHead, StatCard, Tag } from "../../components/ui";
import ExpensesManager from "./ExpensesManager";

export const metadata = { title: "Comptabilité — Administration Kizuna" };

export default async function AccountingPage({ searchParams }: { searchParams: Promise<{ annee?: string; mois?: string }> }) {
  await requireAccess({ adminOnly: true });
  const sp = await searchParams;
  const nowMonth = currentMonthJst();
  const year = /^\d{4}$/.test(sp.annee ?? "") ? sp.annee! : nowMonth.slice(0, 4);

  const sb = await createServerSupabase();
  let data;
  try {
    const [orders, paidForMargin, links, expenses, entities] = await Promise.all([
      loadOrdersForStats(sb),
      loadPaidLinks(sb),
      loadPaidLinksForJournal(sb),
      loadExpenses(sb),
      loadEntitiesSafe(sb),
    ]);
    data = { orders, paidForMargin, links, expenses, entities };
  } catch (e) {
    return (
      <>
        <PageHead title="Comptabilité" />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { orders, paidForMargin, links, expenses, entities } = data;
  const receipts = buildReceipts(links);
  const receiptMonths = summarizeByMonth(receipts);
  const commissions = computeCommissions(orders, paidForMargin);
  const gainByMonth = new Map(commissions.months.map((m) => [m.month, m]));

  const years = [...new Set([...commissions.months.map((m) => m.month.slice(0, 4)), ...receiptMonths.map((m) => m.month.slice(0, 4)), nowMonth.slice(0, 4)])].sort();
  const yearMonths = (() => {
    const all = new Set([...commissions.months.map((m) => m.month), ...receiptMonths.map((m) => m.month)]);
    return [...all].filter((m) => m.startsWith(year)).sort();
  })();

  // Mois du journal affiché : celui demandé, sinon le plus récent de l'année avec des encaissements.
  const journalMonth = /^\d{4}-\d{2}$/.test(sp.mois ?? "") ? sp.mois! : [...receiptMonths.map((m) => m.month)].filter((m) => m.startsWith(year)).pop() ?? `${year}-01`;
  const journal = receipts.filter((r) => r.month === journalMonth);

  const expenseMonthly = monthlyExpenseAverage(expenses);
  const yearGains = yearMonths.reduce((s, m) => s + (gainByMonth.get(m)?.total ?? 0), 0);
  const monthsCounted = year === nowMonth.slice(0, 4) ? Number(nowMonth.slice(5, 7)) : 12;
  const yearExpenses = expenseMonthly * monthsCounted;
  const yearReceipts = receiptMonths.filter((m) => m.month.startsWith(year));
  const sum = (f: (m: (typeof yearReceipts)[number]) => number) => yearReceipts.reduce((s, m) => s + f(m), 0);
  const unknownFees = sum((m) => m.unknownFees);

  return (
    <>
      <PageHead
        title="Comptabilité"
        subtitle={`Année ${year} — chiffres calculés à partir des commandes et des paiements PayPal enregistrés.`}
        tags={
          <>
            <Tag kind="prov">Provisoire</Tag>
            <Link className="av2-btn ghost" href={`${BASE}/comptabilite/export?annee=${year}`}>Exporter l'année (CSV)</Link>
          </>
        }
      />

      <div className="av2-filters" role="navigation" aria-label="Choix de l'année">
        {years.map((y) => (
          <Link key={y} className={y === year ? "av2-btn" : "av2-btn ghost"} href={`${BASE}/comptabilite?annee=${y}`}>{y}</Link>
        ))}
      </div>

      <div className="av2-grid cols-4">
        <StatCard label="Gains (commissions)" value={formatJPY(yearGains)} sub="Frais de service + marge PayPal, hors prix d'achat des articles." />
        <StatCard label="Dépenses estimées" value={formatJPY(yearExpenses)} sub={`${formatJPY(expenseMonthly)} / mois × ${monthsCounted} mois`} />
        <StatCard label="Résultat provisoire" value={formatJPY(yearGains - yearExpenses)} sub="Gains − dépenses, avant impôts et cotisations." />
        <StatCard label="Net reçu sur PayPal" value={formatJPY(sum((m) => m.net))} sub={`Total payé ${formatJPY(sum((m) => m.gross))} − frais PayPal réels ${formatJPY(sum((m) => m.paypalReal))}`} />
      </div>

      {unknownFees > 0 ? (
        <Banner kind="warn">
          <strong>{unknownFees} encaissement{unknownFees > 1 ? "s" : ""} de {year} sans frais PayPal réels connus :</strong> le net et la marge de ces paiements ne sont pas comptés (rien n'est estimé).
        </Banner>
      ) : null}

      <div className="av2-card">
        <h2>Synthèse par mois</h2>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>Mois</th>
                <th className="r">Gains</th>
                <th className="r">dont colis</th>
                <th className="r">Dépenses (moy.)</th>
                <th className="r">Résultat</th>
                <th className="r">Encaissements</th>
                <th className="r">Total payé</th>
                <th className="r">Frais PayPal réels</th>
                <th className="r">Net reçu</th>
              </tr>
            </thead>
            <tbody>
              {yearMonths.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>Aucune donnée pour {year}.</td></tr>
              ) : (
                yearMonths.map((m) => {
                  const g = gainByMonth.get(m);
                  const r = receiptMonths.find((x) => x.month === m);
                  return (
                    <tr key={m}>
                      <td style={{ textTransform: "capitalize" }}><Link className="av2-link" href={`${BASE}/comptabilite?annee=${year}&mois=${m}#journal`}>{monthLabelFr(m)}</Link></td>
                      <td className="r"><strong>{formatJPY(g?.total ?? 0)}</strong></td>
                      <td className="r">{g?.packageCommission ? formatJPY(g.packageCommission) : "—"}</td>
                      <td className="r">{formatJPY(expenseMonthly)}</td>
                      <td className="r">{formatJPY((g?.total ?? 0) - expenseMonthly)}</td>
                      <td className="r">{r?.count ?? "—"}</td>
                      <td className="r">{r ? formatJPY(r.gross) : "—"}</td>
                      <td className="r">{r ? formatJPY(r.paypalReal) : "—"}</td>
                      <td className="r">{r ? formatJPY(r.net) : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="av2-sub" style={{ marginTop: "0.6rem" }}>
          Gains : même formule que le tableau de bord (mois d'achat des commandes + marge PayPal). Encaissements : mois de paiement, heure de Tokyo.
        </p>
      </div>

      <div className="av2-card" id="journal">
        <div className="av2-head" style={{ marginBottom: "0.7rem" }}>
          <div>
            <h2>Journal des encaissements — <span style={{ textTransform: "capitalize" }}>{monthLabelFr(journalMonth)}</span></h2>
            <p className="av2-sub">Un paiement PayPal par ligne, avec la ventilation enregistrée sur le lien.</p>
          </div>
          <Link className="av2-btn" href={`${BASE}/comptabilite/export?mois=${journalMonth}`}>Exporter ce mois (CSV)</Link>
        </div>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client / libellé</th>
                <th>Type</th>
                <th className="r">Total payé</th>
                <th className="r">Articles</th>
                <th className="r">Commission</th>
                <th className="r">Livraison</th>
                <th className="r">Frais PayPal réels</th>
                <th className="r">Net reçu</th>
                <th>Entité</th>
              </tr>
            </thead>
            <tbody>
              {journal.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>Aucun encaissement ce mois-ci.</td></tr>
              ) : (
                journal.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateFr(r.dateJst)}<small>{r.timeJst}</small></td>
                    <td>
                      {r.client || "—"}
                      <small>{r.label}</small>
                      {r.warning ? <small className="av2-error">{r.warning}</small> : null}
                      {r.note ? <small>{r.note}</small> : null}
                    </td>
                    <td>{r.kind}</td>
                    <td className="r">{formatJPY(r.gross)}</td>
                    <td className="r">{r.items ? formatJPY(r.items) : "—"}</td>
                    <td className="r">{r.commission ? formatJPY(r.commission) : "—"}</td>
                    <td className="r">{r.shipping ? formatJPY(r.shipping) : "—"}</td>
                    <td className="r">{r.paypalReal == null ? <Tag kind="soon">inconnus</Tag> : formatJPY(r.paypalReal)}</td>
                    <td className="r">{r.net == null ? "—" : formatJPY(r.net)}</td>
                    <td>{entityOn(r.dateJst, entities as EntityRow[]) || <span style={{ color: "var(--av2-muted)" }}>—</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpensesManager expenses={expenses} />

      <div className="av2-card">
        <h2>Entités fiscales</h2>
        {entities.length > 0 ? (
          <ul className="av2-list">
            {entities.map((e) => (
              <li key={e.id}>
                <span><strong>{e.name}</strong><small style={{ display: "block", color: "var(--av2-muted)" }}>{e.notes}</small></span>
                <span style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
                  {e.active_from || e.active_to ? `${e.active_from ? formatDateFr(e.active_from) : "…"} → ${e.active_to ? formatDateFr(e.active_to) : "en cours"}` : "Dates non confirmées"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--av2-muted)" }}>Les entités (Mayuko / Samuel) apparaîtront ici une fois la migration « admin_foundation » appliquée.</p>
        )}
        <p className="av2-sub" style={{ marginTop: "0.6rem" }}>
          La colonne « Entité » du journal et de l'export reste vide tant qu'aucune date de bascule n'est confirmée : rien n'est attribué à l'aveugle, et aucun revenu historique n'est déplacé d'une entité à l'autre.
        </p>
      </div>

      <Banner kind="info">
        <strong>Ce que ce journal ne contient pas encore :</strong> les ventes d'avant septembre 2026 et les paiements faits directement sur PayPal (sans lien), les remboursements, les transferts vers la banque et les justificatifs. Ils arriveront avec la saisie manuelle du registre financier. Aucune déclaration fiscale n'est produite automatiquement, et les règles (avances clients, taxe de consommation, PayPal de Mayuko) restent à valider avec un comptable japonais. L'ancien calculateur de charges japonaises (Kokuho, impôts…) reste dans l'ancienne admin en attendant son remplaçant.
      </Banner>

      <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem" }}>
        {annualExpenseTotal(expenses) > 0 ? "Les dépenses sont lissées sur 12 mois." : "Aucune dépense saisie : le résultat est égal aux gains."}
      </p>
    </>
  );
}
