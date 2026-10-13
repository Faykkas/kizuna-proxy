import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadOrdersForStats, loadPaidLinks, type EntityRow } from "../../lib/queries";
import { loadEntitiesSafe, loadExpenses, loadPaidLinksForJournal } from "../../lib/queriesAccounting";
import { annualExpenseTotal, buildReceipts, entityOn, missingPackageWeeks, monthlyExpenseAverage, summarizeByMonth } from "../../lib/accounting";
import { isCommissionPackage } from "../../../lib/commissionPackage";
import { computeCommissions, currentMonthJst } from "../../lib/commissions";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { Banner, DataError, PageHead, StatCard, Tag } from "../../components/ui";
import ExpensesManager from "./ExpensesManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Comptabilité")} — ${t("Administration Kizuna")}` };
}

export default async function AccountingPage({ searchParams }: { searchParams: Promise<{ annee?: string; mois?: string }> }) {
  await requireAccess({ adminOnly: true });
  const L = await getL();
  const { t } = L;
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
        <PageHead title={t("Comptabilité")} />
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
  const hasEntity = journal.some((r) => entityOn(r.dateJst, entities as EntityRow[]) !== "");

  const expenseMonthly = monthlyExpenseAverage(expenses);
  const yearGains = yearMonths.reduce((s, m) => s + (gainByMonth.get(m)?.total ?? 0), 0);
  const monthsCounted = year === nowMonth.slice(0, 4) ? Number(nowMonth.slice(5, 7)) : 12;
  const yearExpenses = expenseMonthly * monthsCounted;
  const yearReceipts = receiptMonths.filter((m) => m.month.startsWith(year));
  const sum = (f: (m: (typeof yearReceipts)[number]) => number) => yearReceipts.reduce((s, m) => s + f(m), 0);
  const unknownFees = sum((m) => m.unknownFees);

  // Premier mois avec des encaissements PayPal enregistrés : avant, il n'y avait pas de lien de paiement.
  const firstReceiptMonth = receiptMonths[0]?.month ?? null;
  const packages = orders.filter((o) => isCommissionPackage(o) && o.purchase_date && o.status !== "Cancelled").sort((a, b) => (a.purchase_date ?? "").localeCompare(b.purchase_date ?? ""));
  const missingWeeks = missingPackageWeeks(packages.map((o) => o.purchase_date as string)).filter((w) => w.startsWith(year));

  return (
    <>
      <PageHead
        title={t("Comptabilité")}
        subtitle={t("Année {year} — chiffres calculés à partir des commandes et des paiements PayPal enregistrés.", { year })}
        tags={
          <>
            <Tag kind="prov">{t("Provisoire")}</Tag>
            <Link className="av2-btn ghost" href={`${BASE}/comptabilite/export?annee=${year}`}>{t("Exporter l'année (CSV)")}</Link>
          </>
        }
      />

      <div className="av2-filters" role="navigation" aria-label={t("Choix de l'année")}>
        {years.map((y) => (
          <Link key={y} className={y === year ? "av2-btn" : "av2-btn ghost"} href={`${BASE}/comptabilite?annee=${y}`}>{y}</Link>
        ))}
      </div>

      <div className="av2-grid cols-4">
        <StatCard label={t("Gains (commissions)")} value={formatJPY(yearGains)} sub={t("Frais de service + marge PayPal, hors prix d'achat des articles.")} />
        <StatCard label={t("Dépenses estimées")} value={formatJPY(yearExpenses)} sub={t("{x} / mois × {n} mois", { x: formatJPY(expenseMonthly), n: monthsCounted })} />
        <StatCard label={t("Résultat provisoire")} value={formatJPY(yearGains - yearExpenses)} sub={t("Gains − dépenses, avant impôts et cotisations.")} />
        <StatCard label={t("Net reçu sur PayPal")} value={formatJPY(sum((m) => m.net))} sub={t("Total payé {a} − frais PayPal réels {b}", { a: formatJPY(sum((m) => m.gross)), b: formatJPY(sum((m) => m.paypalReal)) })} />
      </div>

      {unknownFees > 0 ? (
        <Banner kind="warn">
          <strong>{t("{n} encaissement(s) de {year} sans frais PayPal réels connus :", { n: unknownFees, year })}</strong>{" "}
          {t("le net et la marge de ces paiements ne sont pas comptés (rien n'est estimé).")}
        </Banner>
      ) : null}

      <div className="av2-card">
        <h2>{t("Gains et résultat par mois")}</h2>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Mois")}</th>
                <th className="r">{t("Gains")}</th>
                <th className="r">{t("Dépenses (moy.)")}</th>
                <th className="r">{t("Résultat")}</th>
                <th className="r">{t("Achats pour les clients")}</th>
              </tr>
            </thead>
            <tbody>
              {yearMonths.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>{t("Aucune donnée pour {year}.", { year })}</td></tr>
              ) : (
                yearMonths.map((m) => {
                  const g = gainByMonth.get(m);
                  return (
                    <tr key={m}>
                      <td style={{ textTransform: "capitalize" }}>
                        <Link className="av2-link" href={`${BASE}/comptabilite?annee=${year}&mois=${m}#journal`}>{L.monthLabel(m)}</Link>
                        {firstReceiptMonth && m < firstReceiptMonth ? <small><Tag kind="muted">{t("Consulter sur PayPal pour plus de détails")}</Tag></small> : null}
                      </td>
                      <td className="r av2-nowrap">
                        <strong>{formatJPY(g?.total ?? 0)}</strong>
                        {g?.packageCommission ? <small>{t("dont colis {x}", { x: formatJPY(g.packageCommission) })}</small> : null}
                      </td>
                      <td className="r av2-nowrap">{formatJPY(expenseMonthly)}</td>
                      <td className="r av2-nowrap">{formatJPY((g?.total ?? 0) - expenseMonthly)}</td>
                      <td className="r av2-nowrap">{g?.clientPurchases ? formatJPY(g.clientPurchases) : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <h2 style={{ margin: "1.2rem 0 0.6rem" }}>{t("Paiements PayPal reçus par mois")}</h2>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Mois")}</th>
                <th className="r">{t("Paiements")}</th>
                <th className="r">{t("Total payé")}</th>
                <th className="r">{t("Frais PayPal réels")}</th>
                <th className="r">{t("Net reçu")}</th>
              </tr>
            </thead>
            <tbody>
              {yearMonths.map((m) => {
                const r = receiptMonths.find((x) => x.month === m);
                return (
                  <tr key={m}>
                    <td style={{ textTransform: "capitalize" }}>{L.monthLabel(m)}</td>
                    <td className="r">{r?.count ?? "—"}</td>
                    <td className="r av2-nowrap">{r ? formatJPY(r.gross) : "—"}</td>
                    <td className="r av2-nowrap">{r ? formatJPY(r.paypalReal) : "—"}</td>
                    <td className="r av2-nowrap">{r ? formatJPY(r.net) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="av2-sub" style={{ marginTop: "0.6rem" }}>
          {t("« dont colis » : part des gains qui vient du petit supplément pris chaque semaine sur les colis — elle est déjà comprise dans « Gains », ne l'ajoutez pas. « Achats pour les clients » : prix des articles achetés pour eux (ce n'est pas un gain).")}{" "}
          {t("Gains : même formule que le tableau de bord (mois d'achat des commandes + marge PayPal). Encaissements : mois de paiement, heure de Tokyo.")}
        </p>
      </div>

      <div className="av2-card" id="journal">
        <div className="av2-head" style={{ marginBottom: "0.7rem" }}>
          <div>
            <h2>{t("Journal des encaissements")} — <span style={{ textTransform: "capitalize" }}>{L.monthLabel(journalMonth)}</span></h2>
            <p className="av2-sub">{t("Un paiement PayPal par ligne, avec la ventilation enregistrée sur le lien.")}</p>
          </div>
          <Link className="av2-btn" href={`${BASE}/comptabilite/export?mois=${journalMonth}`}>{t("Exporter ce mois (CSV)")}</Link>
        </div>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Client / libellé")}</th>
                <th>{t("Type")}</th>
                <th className="r">{t("Total payé")}</th>
                <th className="r">{t("Articles")}</th>
                <th className="r">{t("Commission")}</th>
                <th className="r">{t("Livraison")}</th>
                <th className="r">{t("Frais PayPal réels")}</th>
                <th className="r">{t("Net reçu")}</th>
                {hasEntity ? <th>{t("Entité")}</th> : null}
              </tr>
            </thead>
            <tbody>
              {journal.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>{t("Aucun encaissement ce mois-ci.")}</td></tr>
              ) : (
                journal.map((r) => (
                  <tr key={r.id}>
                    <td>{L.date(r.dateJst)}<small>{r.timeJst}</small></td>
                    <td>
                      {r.client || "—"}
                      <small>{r.label}</small>
                      {r.warning ? <small className="av2-error">{t(r.warning)}</small> : null}
                      {r.note ? <small>{t(r.note)}</small> : null}
                    </td>
                    <td>{t(r.kind)}</td>
                    <td className="r">{formatJPY(r.gross)}</td>
                    <td className="r">{r.items ? formatJPY(r.items) : "—"}</td>
                    <td className="r">{r.commission ? formatJPY(r.commission) : "—"}</td>
                    <td className="r">{r.shipping ? formatJPY(r.shipping) : "—"}</td>
                    <td className="r">{r.paypalReal == null ? <Tag kind="soon">{t("inconnus")}</Tag> : formatJPY(r.paypalReal)}</td>
                    <td className="r">{r.net == null ? "—" : formatJPY(r.net)}</td>
                    {hasEntity ? <td>{entityOn(r.dateJst, entities as EntityRow[]) || <span style={{ color: "var(--av2-muted)" }}>—</span>}</td> : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="av2-card">
        <h2>{t("Commissions colis")}</h2>
        <p className="av2-sub" style={{ marginBottom: "0.6rem" }}>
          {t("Ce que Kizuna gagne chaque semaine sur les colis. Elles comptent dans les gains, pas dans le nombre de commandes.")}
        </p>
        {packages.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucune commission colis enregistrée.")}</p>
        ) : (
          <div className="av2-tablewrap">
            <table className="av2-table">
              <thead>
                <tr>
                  <th>{t("Date")}</th>
                  <th>{t("Libellé")}</th>
                  <th className="r">{t("Gain")}</th>
                </tr>
              </thead>
              <tbody>
                {packages.filter((o) => (o.purchase_date ?? "").startsWith(year)).map((o) => (
                  <tr key={o.id}>
                    <td>{L.date(o.purchase_date)}</td>
                    <td>{o.client_name}</td>
                    <td className="r">{formatJPY(o.service_fee_jpy ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {missingWeeks.length > 0 ? (
          <p className="av2-sub" style={{ marginTop: "0.6rem" }}>
            <strong>{t("Semaines sans commission colis enregistrée :")}</strong>{" "}
            {missingWeeks.map((w) => t("semaine du {d}", { d: L.date(w) })).join(", ")}.{" "}
            {t("Rien n'a été ajouté : consultez PayPal pour plus de détails.")}
          </p>
        ) : null}
      </div>

      <ExpensesManager expenses={expenses} />

      <div className="av2-card">
        <h2>{t("Entités fiscales")}</h2>
        {entities.length > 0 ? (
          <ul className="av2-list">
            {entities.map((e) => (
              <li key={e.id}>
                <span><strong>{e.name}</strong><small style={{ display: "block", color: "var(--av2-muted)" }}>{e.notes ? t(e.notes) : ""}</small></span>
                <span style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
                  {e.active_from || e.active_to ? `${e.active_from ? L.date(e.active_from) : "…"} → ${e.active_to ? L.date(e.active_to) : t("en cours")}` : t("Dates non confirmées")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--av2-muted)" }}>{t("Les entités (Mayuko / Samuel) apparaîtront ici une fois la migration « admin_foundation » appliquée.")}</p>
        )}
        <p className="av2-sub" style={{ marginTop: "0.6rem" }}>
          {t("La colonne « Entité » du journal et de l'export reste vide tant qu'aucune date de bascule n'est confirmée : rien n'est attribué à l'aveugle, et aucun revenu historique n'est déplacé d'une entité à l'autre.")}
        </p>
      </div>

      <Banner kind="info">
        <strong>{t("Ce que ce journal ne contient pas encore :")}</strong>{" "}
        {t("les ventes d'avant septembre 2026 et les paiements faits directement sur PayPal (sans lien), les remboursements, les transferts vers la banque et les justificatifs. Pour les mois d'avant septembre, consultez PayPal (compte de Mayuko) et la banque pour le détail des paiements. Aucune déclaration fiscale n'est produite automatiquement, et les règles (avances clients, taxe de consommation, PayPal de Mayuko) restent à valider avec un comptable japonais. L'ancien calculateur de charges japonaises (Kokuho, impôts…) reste dans l'ancienne admin en attendant son remplaçant.")}
      </Banner>

      <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem" }}>
        {annualExpenseTotal(expenses) > 0 ? t("Les dépenses sont lissées sur 12 mois.") : t("Aucune dépense saisie : le résultat est égal aux gains.")}
      </p>
    </>
  );
}
