import Link from "next/link";
import { requireAccess } from "../lib/access";
import { createServerSupabase } from "../lib/supabase-server";
import { computeCommissions, currentMonthJst, lastMonths } from "../lib/commissions";
import { countNewRequests, loadOrdersForStats, loadPaidLinks } from "../lib/queries";
import { MONTHLY_GOAL_JPY, NEXT_GOAL_JPY, BASE } from "../lib/config";
import { formatJPY, percentOf } from "../lib/money";
import { isActiveStatus, monthLabelFr, statusInfo } from "../lib/status";
import { DataError, PageHead, ReadOnlyTag, SoonCard, StaffNotice, StatCard, Tag } from "../components/ui";
import CommissionChart from "../components/CommissionChart";

export const metadata = { title: "Tableau de bord — Administration Kizuna" };

export default async function DashboardPage() {
  const access = await requireAccess();
  const month = currentMonthJst();

  if (access.role === "staff") {
    return (
      <>
        <PageHead title="Tableau de bord" subtitle={monthLabelFr(month)} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  const sb = await createServerSupabase();
  let data;
  try {
    const [orders, links, newRequests] = await Promise.all([loadOrdersForStats(sb), loadPaidLinks(sb), countNewRequests(sb)]);
    data = { orders, links, newRequests };
  } catch (e) {
    return (
      <>
        <PageHead title="Tableau de bord" subtitle={monthLabelFr(month)} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { orders, links, newRequests } = data;
  const report = computeCommissions(orders, links);
  const byMonth = new Map(report.months.map((m) => [m.month, m]));
  const now = byMonth.get(month);
  const monthTotal = now?.total ?? 0;
  const year = month.slice(0, 4);
  const yearTotal = report.months.filter((m) => m.month.startsWith(year)).reduce((s, m) => s + m.total, 0);

  const chart = lastMonths(month, 12).map((m) => ({ month: m, total: byMonth.get(m)?.total ?? 0 }));
  const years = [...new Set(report.months.map((m) => m.month.slice(0, 4)))];
  const perYear = years.map((y) => ({
    year: y,
    total: report.months.filter((m) => m.month.startsWith(y)).reduce((s, m) => s + m.total, 0),
  }));

  // Commandes actives = ni livrées ni annulées, avec le détail par statut.
  const active = orders.filter((o) => isActiveStatus(o.status));
  const byStatus = new Map<string, number>();
  active.forEach((o) => byStatus.set(o.status ?? "—", (byStatus.get(o.status ?? "—") ?? 0) + 1));
  const statusRows = [...byStatus.entries()].sort((a, b) => b[1] - a[1]);

  const pending = orders.filter((o) => o.status === "Pending").length;
  const actionRequired = orders.filter((o) => o.status === "Action Required").length;
  const shippingDue = orders.filter((o) => o.status !== "Cancelled" && (o.shipping_cost_jpy ?? 0) > 0 && !o.shipping_paid);
  const shippingDueTotal = shippingDue.reduce((s, o) => s + (o.shipping_cost_jpy ?? 0), 0);

  const goalPct = percentOf(monthTotal, MONTHLY_GOAL_JPY);
  const nextPct = percentOf(monthTotal, NEXT_GOAL_JPY);
  const remaining = Math.max(MONTHLY_GOAL_JPY - monthTotal, 0);

  return (
    <>
      <PageHead
        title="Tableau de bord"
        subtitle={<span style={{ textTransform: "capitalize" }}>{monthLabelFr(month)}</span>}
        tags={
          <>
            <ReadOnlyTag />
            <Tag kind="prov">Chiffres provisoires</Tag>
          </>
        }
      />

      <div className="av2-grid cols-4">
        <StatCard
          label="Commissions du mois"
          tag={<Tag kind="prov">provisoire</Tag>}
          value={formatJPY(monthTotal)}
          sub={
            <>
              Frais de service {formatJPY(now?.serviceFees ?? 0)} + marge PayPal {formatJPY(now?.paypalMargin ?? 0)}
              <br />
              Hors prix d'achat des articles.
            </>
          }
        />

        <div className="av2-card">
          <div className="av2-label">Objectif mensuel</div>
          <div className="av2-value">{goalPct} %</div>
          <div className={`av2-progress${goalPct >= 100 ? " done" : ""}`} role="progressbar" aria-valuenow={Math.min(goalPct, 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progression vers l'objectif mensuel">
            <span style={{ width: `${Math.min(goalPct, 100)}%` }} />
          </div>
          <div className="av2-sub">
            {goalPct >= 100 ? "Objectif atteint" : `Reste ${formatJPY(remaining)}`} sur {formatJPY(MONTHLY_GOAL_JPY)}
            <br />
            Étape suivante {formatJPY(NEXT_GOAL_JPY)} : {nextPct} %
          </div>
        </div>

        <StatCard
          label="Commandes actives"
          value={active.length}
          sub={
            statusRows.length ? (
              <>
                {statusRows.slice(0, 3).map(([s, n]) => `${n} ${statusInfo(s).label.toLowerCase()}`).join(" · ")}
                <br />
                Hors livrées et annulées.
              </>
            ) : (
              "Aucune commande active."
            )
          }
        />

        <StatCard
          label={`Cumul ${year}`}
          tag={<Tag kind="prov">provisoire</Tag>}
          value={formatJPY(yearTotal)}
          sub="Commissions de l'année en cours."
        />
      </div>

      <div className="av2-grid cols-2" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
        <div className="av2-card">
          <h2>Commissions mensuelles — 12 derniers mois</h2>
          <CommissionChart points={chart} goal={MONTHLY_GOAL_JPY} currentMonth={month} />
          <details style={{ marginTop: "0.6rem" }}>
            <summary style={{ cursor: "pointer", color: "var(--av2-muted)", fontSize: "0.88rem" }}>Voir les chiffres</summary>
            <div className="av2-tablewrap" style={{ marginTop: "0.6rem" }}>
              <table className="av2-table">
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th className="r">Frais de service</th>
                    <th className="r">Marge PayPal</th>
                    <th className="r">Total</th>
                    <th className="r">Commandes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.months].reverse().map((m) => (
                    <tr key={m.month}>
                      <td style={{ textTransform: "capitalize" }}>{monthLabelFr(m.month)}</td>
                      <td className="r">{formatJPY(m.serviceFees)}</td>
                      <td className="r">{formatJPY(m.paypalMargin)}</td>
                      <td className="r">
                        <strong>{formatJPY(m.total)}</strong>
                      </td>
                      <td className="r">{m.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="av2-card">
          <h2>À traiter</h2>
          <ul className="av2-list">
            <li>
              <span>Nouvelles demandes</span>
              <span className="av2-num">
                {newRequests} <Link href="/admin" prefetch={false} style={{ color: "var(--av2-info)", fontWeight: 500 }}>ancienne admin →</Link>
              </span>
            </li>
            <li>
              <Link href={`${BASE}/commandes?statut=Pending`}>Commandes « demande reçue »</Link>
              <span className="av2-num">{pending}</span>
            </li>
            <li>
              <Link href={`${BASE}/commandes?statut=Action+Required`}>Action requise</Link>
              <span className="av2-num">{actionRequired}</span>
            </li>
            <li>
              <span>
                Livraison à payer
                <small style={{ display: "block", color: "var(--av2-muted)" }}>{formatJPY(shippingDueTotal)} au total</small>
              </span>
              <span className="av2-num">{shippingDue.length}</span>
            </li>
          </ul>

          <h2 style={{ margin: "1.1rem 0 0.4rem" }}>Par année</h2>
          <ul className="av2-list">
            {perYear.map((y) => (
              <li key={y.year}>
                <span>{y.year}</span>
                <span className="av2-num">{formatJPY(y.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>Finances — registre à venir</h2>
        <div className="av2-grid cols-3">
          <SoonCard title="Dépenses" phase="Phase 1">
            Nécessite le registre financier. Rien n'est affiché tant que les vraies dépenses ne sont pas saisies.
          </SoonCard>
          <SoonCard title="Marge nette" phase="Phase 1">
            Commissions encaissées moins dépenses et frais, par entité fiscale.
          </SoonCard>
          <SoonCard title="Trésorerie" phase="Phase 1">
            Demande les soldes d'ouverture de chaque compte (PayPal, banque), à fournir par vous.
          </SoonCard>
        </div>
      </div>

      <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem" }}>
        Méthode : même formule que l'onglet Stats de l'ancienne admin (commandes hors « Demande reçue » et « Annulé », plus marge
        PayPal des liens payés dont les frais réels sont connus). Les mois suivent la date d'achat (commandes) et la date de paiement
        (marge PayPal, UTC). Le registre de la phase 1 distinguera commissions prévues, facturées, encaissées et remboursées.
        {report.anomalies.length ? ` ${report.anomalies.length} anomalie(s) de montant détectée(s) : ${report.anomalies.slice(0, 3).join(" ; ")}.` : ""}
      </p>
    </>
  );
}
