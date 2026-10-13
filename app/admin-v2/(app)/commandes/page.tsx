import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { listOrders, ORDERS_PAGE_SIZE, summarizePackages, type OrderKind } from "../../lib/queries";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { FILTER_STATUSES, formatDateFr, statusInfo } from "../../lib/status";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatusBadge } from "../../components/ui";
import { orderTitle } from "../../../lib/orderStatus";

export const metadata = { title: "Commandes — Administration Kizuna" };

type SearchParams = Promise<{ q?: string; statut?: string; type?: string; page?: string }>;

function href(params: { q?: string; statut?: string; type?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.statut) sp.set("statut", params.statut);
  if (params.type) sp.set("type", params.type);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `${BASE}/commandes${qs ? `?${qs}` : ""}`;
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await requireAccess();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const statut = FILTER_STATUSES.includes(sp.statut ?? "") ? sp.statut! : "";
  const type: OrderKind = sp.type === "colis" ? "packages" : sp.type === "tout" ? "all" : "orders";
  const page = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));

  if (access.role === "staff") {
    return (
      <>
        <PageHead title="Commandes" tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  const sb = await createServerSupabase();
  let result;
  try {
    result = await listOrders(sb, { q, status: statut || undefined, kind: type, page });
  } catch (e) {
    return (
      <>
        <PageHead title="Commandes" tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { rows, total } = result;
  const packages = await summarizePackages(sb).catch(() => ({ count: 0, totalJpy: 0 }));
  const pages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));

  return (
    <>
      <PageHead
        title="Commandes"
        subtitle="Toutes les commandes. Cliquez sur une commande pour la consulter ou la modifier."
        tags={access.role === "admin" ? <Link className="av2-btn" href={`${BASE}/commandes/nouveau`}>+ Nouvelle commande</Link> : <ReadOnlyTag />}
      />

      <form method="get" action={`${BASE}/commandes`} className="av2-filters" role="search">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder="Rechercher : client, email, référence, article…" aria-label="Rechercher une commande" />
        <select className="av2-select" name="statut" defaultValue={statut} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {FILTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusInfo(s).label}
            </option>
          ))}
        </select>
        <button className="av2-btn" type="submit">Filtrer</button>
        <select className="av2-select" name="type" defaultValue={sp.type ?? ""} aria-label="Type de lignes">
          <option value="">Commandes de clients</option>
          <option value="colis">Commissions colis seulement</option>
          <option value="tout">Tout (commandes + commissions colis)</option>
        </select>
        {q || statut || sp.type ? (
          <Link className="av2-btn ghost" href={`${BASE}/commandes`}>Réinitialiser</Link>
        ) : null}
      </form>

      {packages.count > 0 ? (
        <p style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
          {packages.count} « commission package » ({formatJPY(packages.totalJpy)}) sont gardées et comptées dans vos gains, mais ne sont pas des commandes.{" "}
          {type !== "packages" ? <Link href={`${BASE}/commandes?type=colis`} style={{ color: "var(--av2-info)" }}>Les voir</Link> : null}
        </p>
      ) : null}

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Articles</th>
              <th>Statut</th>
              <th className="r">Montants</th>
              {access.role === "admin" ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>
                  Aucune commande ne correspond.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td className="av2-nowrap">
                    <Link className="av2-link" href={`${BASE}/commandes/${o.id}`}>
                      {o.public_ref ?? `#${o.id}`}
                    </Link>
                    <small>{formatDateFr(o.purchase_date)} · {o.platform ?? "—"}</small>
                  </td>
                  <td style={{ maxWidth: 190, overflowWrap: "anywhere" }}>
                    {o.client_name ?? "—"}
                    <small>{o.client_email ?? ""}</small>
                  </td>
                  <td>
                    <div className="av2-clip" style={{ maxWidth: 150 }} title={o.items ?? ""}>{orderTitle(o.items, "—")}</div>
                  </td>
                  <td className="av2-nowrap"><StatusBadge status={o.status} /></td>
                  <td className="r">
                    <div className="av2-money"><span>Articles</span> {formatJPY(o.item_price_jpy)}</div>
                    <div className="av2-money"><span>Commission</span> {formatJPY(o.service_fee_jpy)}</div>
                    {(o.shipping_cost_jpy ?? 0) > 0 ? (
                      <div className="av2-money"><span>Livraison {o.shipping_paid ? "payée" : "à payer"}</span> {formatJPY(o.shipping_cost_jpy)}</div>
                    ) : null}
                  </td>
                  {access.role === "admin" ? (
                    <td className="av2-nowrap">
                      <Link className="av2-btn ghost sm" href={`${BASE}/commandes/${o.id}/modifier`}>Modifier</Link>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="av2-pager">
        <span>
          {total} commande{total > 1 ? "s" : ""} · page {Math.min(page, pages)} / {pages}
        </span>
        <div>
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, type: sp.type, page: page - 1 })}>← Précédente</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, type: sp.type, page: page + 1 })}>Suivante →</Link> : null}
        </div>
      </div>
    </>
  );
}
