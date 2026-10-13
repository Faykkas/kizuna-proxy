import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { listOrders, ORDERS_PAGE_SIZE } from "../../lib/queries";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { FILTER_STATUSES, formatDateFr, statusInfo } from "../../lib/status";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatusBadge } from "../../components/ui";
import { orderTitle } from "../../../lib/orderStatus";

export const metadata = { title: "Commandes — Administration Kizuna" };

type SearchParams = Promise<{ q?: string; statut?: string; page?: string }>;

function href(params: { q?: string; statut?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.statut) sp.set("statut", params.statut);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `${BASE}/commandes${qs ? `?${qs}` : ""}`;
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await requireAccess();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const statut = FILTER_STATUSES.includes(sp.statut ?? "") ? sp.statut! : "";
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
    result = await listOrders(sb, { q, status: statut || undefined, page });
  } catch (e) {
    return (
      <>
        <PageHead title="Commandes" tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { rows, total } = result;
  const pages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));

  return (
    <>
      <PageHead
        title="Commandes"
        subtitle="Commandes existantes, lues depuis la base actuelle. Aucune modification possible depuis cette page."
        tags={<ReadOnlyTag />}
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
        {q || statut ? (
          <Link className="av2-btn ghost" href={`${BASE}/commandes`}>Réinitialiser</Link>
        ) : null}
      </form>

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Articles</th>
              <th>Statut</th>
              <th>Date d'achat</th>
              <th className="r">Prix articles</th>
              <th className="r">Commission</th>
              <th className="r">Livraison</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>
                  Aucune commande ne correspond.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link className="av2-link" href={`${BASE}/commandes/${o.id}`}>
                      {o.public_ref ?? `#${o.id}`}
                    </Link>
                    <small>{o.platform ?? "—"}</small>
                  </td>
                  <td>
                    {o.client_name ?? "—"}
                    <small>{o.client_email ?? ""}</small>
                  </td>
                  <td>
                    <div className="av2-clip" title={o.items ?? ""}>{orderTitle(o.items, "—")}</div>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{formatDateFr(o.purchase_date)}</td>
                  <td className="r">{formatJPY(o.item_price_jpy)}</td>
                  <td className="r">{formatJPY(o.service_fee_jpy)}</td>
                  <td className="r">
                    {(o.shipping_cost_jpy ?? 0) > 0 ? (
                      <>
                        {formatJPY(o.shipping_cost_jpy)}
                        <small>{o.shipping_paid ? "payée" : "à payer"}</small>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
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
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, page: page - 1 })}>← Précédente</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, page: page + 1 })}>Suivante →</Link> : null}
        </div>
      </div>
    </>
  );
}
