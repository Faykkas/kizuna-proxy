import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadOrdersForStats } from "../../lib/queries";
import { loadEntitiesSafe, loadMayukoLedgerSafe } from "../../lib/queriesAccounting";
import { FALLBACK_START, balance, groupByWeek, notYetBoughtTotal, repayableOrders } from "../../lib/mayuko";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { Banner, DataError, PageHead, StaffNotice, StatCard } from "../../components/ui";
import LedgerManager from "./LedgerManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("À rembourser à Mayuko")} — ${t("Administration Kizuna")}` };
}

export default async function MayukoPage() {
  const dataP = createServerSupabase().then((sb) => Promise.all([loadOrdersForStats(sb), loadEntitiesSafe(sb), loadMayukoLedgerSafe(sb)]));
  dataP.catch(() => {});
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("À rembourser à Mayuko")} />
        <StaffNotice />
      </>
    );
  }

  let data;
  try {
    data = await dataP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("À rembourser à Mayuko")} />
        <DataError message={(e as Error).message} />
      </>
    );
  }
  const [orders, entities, ledger] = data;

  // Début du décompte = date de reprise par Samuel (entité fiscale), sinon le 1er novembre 2026.
  const since = entities.find((e) => e.name === "Samuel")?.active_from ?? FALLBACK_START;
  const purchases = repayableOrders(orders, since);
  const weeks = groupByWeek(purchases);
  const purchasesTotal = purchases.reduce((s, o) => s + Math.round(o.item_price_jpy ?? 0), 0);
  const bal = balance(purchasesTotal, ledger.rows);
  const waiting = notYetBoughtTotal(orders, since);

  return (
    <>
      <PageHead title={t("À rembourser à Mayuko")} subtitle={t("Ce que vous devez à Mayuko pour les achats qu'elle a avancés depuis la reprise.")} />

      {!ledger.available ? (
        <Banner kind="warn">
          {t("Le registre n'est pas encore activé dans Supabase : exécutez d'abord le SQL 20261101130000_mayuko_ledger.sql. En attendant, seuls les achats sont calculés.")}
        </Banner>
      ) : null}

      <div className="av2-grid cols-4">
        <StatCard
          label={t("Reste à rembourser")}
          value={formatJPY(bal.due)}
          sub={t("Achats {a} + avances {b} − remboursements {c}", { a: formatJPY(bal.purchases), b: formatJPY(bal.advances), c: formatJPY(bal.repayments) })}
        />
        <StatCard label={t("Achats depuis le {d}", { d: L.date(since) })} value={formatJPY(bal.purchases)} sub={t("{n} commandes déjà achetées, prix des articles seulement.", { n: purchases.length })} />
        <StatCard label={t("Déjà remboursé")} value={formatJPY(bal.repayments)} sub={bal.advances > 0 ? t("Avances en plus : {x}", { x: formatJPY(bal.advances) }) : undefined} />
        <StatCard
          label={t("Pas encore acheté")}
          value={formatJPY(waiting.total)}
          sub={t("{n} commandes en cours d'achat ou en attente : pas comptées tant qu'elles ne sont pas « Acheté ».", { n: waiting.count })}
        />
      </div>

      <Banner kind="info">
        <strong>{t("La règle :")}</strong>{" "}
        {t("on compte le prix des articles des commandes déjà achetées (statut « Acheté » ou plus loin), à partir du {d}. Les frais de service sont votre gain : ils ne sont jamais comptés ici. Les lignes « commission package » et les commandes annulées sont ignorées. Une livraison ou des taxes avancées par Mayuko s'ajoutent à la main comme « avance en plus ».", { d: L.date(since) })}
      </Banner>

      <LedgerManager entries={ledger.rows} due={Math.max(bal.due, 0)} />

      <div className="av2-card">
        <h2>{t("Achats par semaine (lundi → dimanche)")}</h2>
        {weeks.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucun achat compté depuis cette date.")}</p>
        ) : (
          weeks.map((w) => (
            <details key={w.start} style={{ borderTop: "1px solid var(--av2-border)", padding: "0.6rem 0" }}>
              <summary style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span>
                  <strong>{t("{a} → {b}", { a: L.date(w.start), b: L.date(w.end) })}</strong>{" "}
                  <small style={{ color: "var(--av2-muted)" }}>{t("{n} commandes", { n: w.orders.length })}</small>
                </span>
                <span className="av2-num"><strong>{formatJPY(w.total)}</strong></span>
              </summary>
              <div className="av2-tablewrap" style={{ marginTop: "0.5rem" }}>
                <table className="av2-table">
                  <thead>
                    <tr>
                      <th>{t("Date d'achat")}</th>
                      <th>{t("Client")}</th>
                      <th>{t("Statut")}</th>
                      <th className="r">{t("Articles")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.orders.map((o) => (
                      <tr key={o.id}>
                        <td className="av2-nowrap">{L.date(o.purchase_date)}</td>
                        <td>
                          <Link className="av2-link" href={`${BASE}/commandes/${o.id}`}>{o.client_name ?? "—"}</Link>
                        </td>
                        <td>{L.statusLabel(o.status)}</td>
                        <td className="r">{formatJPY(Math.round(o.item_price_jpy ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))
        )}
      </div>
    </>
  );
}
