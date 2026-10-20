import Link from "next/link";
import { requireAccess } from "../lib/access";
import { createServerSupabase } from "../lib/supabase-server";
import { getL } from "../lib/lang-server";
import { computeCommissions, currentMonthJst, lastMonths } from "../lib/commissions";
import { countPendingLinks, loadOrdersForStats, loadPaidLinks } from "../lib/queries";
import { MONTHLY_GOAL_JPY, NEXT_GOAL_JPY, BASE } from "../lib/config";
import { formatJPY, percentOf } from "../lib/money";
import { isActiveStatus } from "../lib/status";
import { isCommissionPackage } from "../../lib/commissionPackage.ts";
import { DataError, PageHead, ReadOnlyTag, SoonCard, StaffNotice, StatCard, Tag } from "../components/ui";
import CommissionChart from "../components/CommissionChart";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Tableau de bord")} — ${t("Administration Kizuna")}` };
}

export default async function DashboardPage() {
  // Les lectures démarrent tout de suite, en même temps que la vérification d'accès (la RLS protège les données quoi qu'il arrive).
  const dataP = createServerSupabase().then((sb) => Promise.all([loadOrdersForStats(sb), loadPaidLinks(sb), countPendingLinks(sb)]));
  dataP.catch(() => {});
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;
  const month = currentMonthJst();

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Tableau de bord")} subtitle={L.monthLabel(month)} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let data;
  try {
    const [orders, links, pendingLinks] = await dataP;
    data = { orders, links, pendingLinks };
  } catch (e) {
    return (
      <>
        <PageHead title={t("Tableau de bord")} subtitle={L.monthLabel(month)} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { orders, links, pendingLinks } = data;
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
  // Les « commission package » sont des gains, pas des commandes : jamais comptées ici.
  const realOrders = orders.filter((o) => !isCommissionPackage(o));
  const active = realOrders.filter((o) => isActiveStatus(o.status));
  const byStatus = new Map<string, number>();
  active.forEach((o) => byStatus.set(o.status ?? "—", (byStatus.get(o.status ?? "—") ?? 0) + 1));
  const statusRows = [...byStatus.entries()].sort((a, b) => b[1] - a[1]);

  const pending = realOrders.filter((o) => o.status === "Pending").length;
  const actionRequired = realOrders.filter((o) => o.status === "Action Required").length;
  const shippingDue = realOrders.filter((o) => o.status !== "Cancelled" && (o.shipping_cost_jpy ?? 0) > 0 && !o.shipping_paid);
  const shippingDueTotal = shippingDue.reduce((s, o) => s + (o.shipping_cost_jpy ?? 0), 0);

  const goalPct = percentOf(monthTotal, MONTHLY_GOAL_JPY);
  const nextPct = percentOf(monthTotal, NEXT_GOAL_JPY);
  const remaining = Math.max(MONTHLY_GOAL_JPY - monthTotal, 0);

  return (
    <>
      <PageHead
        title={t("Tableau de bord")}
        subtitle={<span style={{ textTransform: "capitalize" }}>{L.monthLabel(month)}</span>}
        tags={
          <>
            <ReadOnlyTag />
            <Tag kind="prov">{t("Chiffres provisoires")}</Tag>
          </>
        }
      />

      <div className="av2-grid cols-4">
        <StatCard
          label={t("Commissions du mois")}
          tag={<Tag kind="prov">{t("provisoire")}</Tag>}
          value={formatJPY(monthTotal)}
          sub={
            <>
              {t("Frais de service {a} + marge PayPal {b}", { a: formatJPY(now?.serviceFees ?? 0), b: formatJPY(now?.paypalMargin ?? 0) })}
              {(now?.packageCommission ?? 0) > 0 ? (
                <>
                  <br />
                  {t("dont commissions colis {x} (déjà incluses)", { x: formatJPY(now?.packageCommission ?? 0) })}
                </>
              ) : null}
              <br />
              {t("Hors prix d'achat des articles.")}
            </>
          }
        />

        <div className="av2-card">
          <div className="av2-label">{t("Objectif mensuel")}</div>
          <div className="av2-value">{goalPct} %</div>
          <div className={`av2-progress${goalPct >= 100 ? " done" : ""}`} role="progressbar" aria-valuenow={Math.min(goalPct, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={t("Progression vers l'objectif mensuel")}>
            <span style={{ width: `${Math.min(goalPct, 100)}%` }} />
          </div>
          <div className="av2-sub">
            {goalPct >= 100
              ? t("Objectif atteint sur {y}", { y: formatJPY(MONTHLY_GOAL_JPY) })
              : t("Reste {x} sur {y}", { x: formatJPY(remaining), y: formatJPY(MONTHLY_GOAL_JPY) })}
            <br />
            {t("Étape suivante {a} : {b} %", { a: formatJPY(NEXT_GOAL_JPY), b: nextPct })}
          </div>
        </div>

        <StatCard
          label={t("Commandes actives")}
          value={active.length}
          sub={
            statusRows.length ? (
              <>
                {statusRows.slice(0, 3).map(([s, n]) => t("{n} {label}", { n, label: L.statusLabel(s).toLowerCase() })).join(" · ")}
                <br />
                {t("Hors livrées et annulées.")}
              </>
            ) : (
              t("Aucune commande active.")
            )
          }
        />

        <StatCard
          label={t("Cumul {year}", { year })}
          tag={<Tag kind="prov">{t("provisoire")}</Tag>}
          value={formatJPY(yearTotal)}
          sub={t("Commissions de l'année en cours.")}
        />
      </div>

      <div className="av2-grid cols-2" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
        <div className="av2-card">
          <h2>{t("Commissions mensuelles — 12 derniers mois")}</h2>
          <CommissionChart points={chart} goal={MONTHLY_GOAL_JPY} currentMonth={month} />
          <details style={{ marginTop: "0.6rem" }}>
            <summary style={{ cursor: "pointer", color: "var(--av2-muted)", fontSize: "0.88rem" }}>{t("Voir les chiffres")}</summary>
            <div className="av2-tablewrap" style={{ marginTop: "0.6rem" }}>
              <table className="av2-table">
                <thead>
                  <tr>
                    <th>{t("Mois")}</th>
                    <th className="r">{t("Frais de service")}</th>
                    <th className="r">{t("Marge PayPal")}</th>
                    <th className="r">{t("Total")}</th>
                    <th className="r">{t("Commandes")}</th>
                    <th className="r">{t("Commissions colis")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.months].reverse().map((m) => (
                    <tr key={m.month}>
                      <td style={{ textTransform: "capitalize" }}>{L.monthLabel(m.month)}</td>
                      <td className="r">{formatJPY(m.serviceFees)}</td>
                      <td className="r">{formatJPY(m.paypalMargin)}</td>
                      <td className="r">
                        <strong>{formatJPY(m.total)}</strong>
                      </td>
                      <td className="r">{m.orderCount}</td>
                      <td className="r">{m.packageCommission > 0 ? `${formatJPY(m.packageCommission)} (${m.packageCount})` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="av2-card">
          <h2>{t("À traiter")}</h2>
          <ul className="av2-list">
            <li>
              <Link href={`${BASE}/liens-de-paiement?statut=pending`}>{t("Liens de paiement en attente")}</Link>
              <span className="av2-num">{pendingLinks}</span>
            </li>
            <li>
              <Link href={`${BASE}/commandes?statut=Pending`}>{t("Commandes « demande reçue »")}</Link>
              <span className="av2-num">{pending}</span>
            </li>
            <li>
              <Link href={`${BASE}/commandes?statut=Action+Required`}>{t("Action requise")}</Link>
              <span className="av2-num">{actionRequired}</span>
            </li>
            <li>
              <span>
                {t("Livraison à payer")}
                <small style={{ display: "block", color: "var(--av2-muted)" }}>{t("{x} au total", { x: formatJPY(shippingDueTotal) })}</small>
              </span>
              <span className="av2-num">{shippingDue.length}</span>
            </li>
          </ul>

          <h2 style={{ margin: "1.1rem 0 0.4rem" }}>{t("Par année")}</h2>
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
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>{t("Finances — registre à venir")}</h2>
        <div className="av2-grid cols-3">
          <SoonCard title={t("Dépenses")} phase={t("Phase 1")}>
            {t("Nécessite le registre financier. Rien n'est affiché tant que les vraies dépenses ne sont pas saisies.")}
          </SoonCard>
          <SoonCard title={t("Marge nette")} phase={t("Phase 1")}>
            {t("Commissions encaissées moins dépenses et frais, par entité fiscale.")}
          </SoonCard>
          <SoonCard title={t("Trésorerie")} phase={t("Phase 1")}>
            {t("Demande les soldes d'ouverture de chaque compte (PayPal, banque), à fournir par vous.")}
          </SoonCard>
        </div>
      </div>

      <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem" }}>
        {t("Méthode : même formule que l'onglet Stats de l'ancienne admin (commandes hors « Demande reçue » et « Annulé », plus marge PayPal des liens payés dont les frais réels sont connus). Les mois suivent la date d'achat (commandes) et la date de paiement (marge PayPal, UTC). Le registre de la phase 1 distinguera commissions prévues, facturées, encaissées et remboursées.")}
        {report.anomalies.length
          ? ` ${t("{n} anomalie(s) de montant détectée(s) : {list}.", { n: report.anomalies.length, list: report.anomalies.slice(0, 3).join(" ; ") })}`
          : ""}
      </p>
    </>
  );
}
