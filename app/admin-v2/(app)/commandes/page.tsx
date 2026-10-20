import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { listOrders, ORDERS_PAGE_SIZE, summarizePackages, type OrderKind } from "../../lib/queries";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { FILTER_STATUSES } from "../../lib/status";
import FilterForm from "../../components/FilterForm";
import { RememberList } from "../../components/ListMemory";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatusBadge } from "../../components/ui";
import { orderTitle } from "../../../lib/orderStatus";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Commandes")} — ${t("Administration Kizuna")}` };
}

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
  // Les filtres viennent de l'adresse (aucune attente réseau) : on lance la lecture tout de suite,
  // en même temps que la vérification d'accès (la RLS protège les données quoi qu'il arrive).
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const statut = FILTER_STATUSES.includes(sp.statut ?? "") ? sp.statut! : "";
  const type: OrderKind = sp.type === "colis" ? "packages" : sp.type === "tout" ? "all" : "orders";
  const page = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));
  const dataP = createServerSupabase().then((sb) =>
    Promise.all([
      listOrders(sb, { q, status: statut || undefined, kind: type, page }),
      summarizePackages(sb).catch(() => ({ count: 0, totalJpy: 0 })),
    ]),
  );
  dataP.catch(() => {});

  const access = await requireAccess();
  const L = await getL();
  const { t } = L;

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Commandes")} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let result;
  let packages = { count: 0, totalJpy: 0 };
  try {
    [result, packages] = await dataP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("Commandes")} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const { rows, total } = result;
  const pages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));

  return (
    <>
      <PageHead
        title={t("Commandes")}
        subtitle={t("Toutes les commandes. Cliquez sur une commande pour la consulter ou la modifier.")}
        tags={access.role === "admin" ? <Link className="av2-btn" href={`${BASE}/commandes/nouveau`}>{t("+ Nouvelle commande")}</Link> : <ReadOnlyTag />}
      />

      <RememberList name="commandes" />
      <FilterForm key={`${q}|${statut}|${sp.type ?? ""}`} action={`${BASE}/commandes`} className="av2-filters">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder={t("Rechercher : client, email, référence, article…")} aria-label={t("Rechercher une commande")} />
        <select className="av2-select" name="statut" defaultValue={statut} aria-label={t("Filtrer par statut")}>
          <option value="">{t("Tous les statuts")}</option>
          {FILTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {L.statusLabel(s)}
            </option>
          ))}
        </select>
        <button className="av2-btn" type="submit">{t("Filtrer")}</button>
        <select className="av2-select" name="type" defaultValue={sp.type ?? ""} aria-label={t("Type de lignes")}>
          <option value="">{t("Commandes de clients")}</option>
          <option value="colis">{t("Commissions colis seulement")}</option>
          <option value="tout">{t("Tout (commandes + commissions colis)")}</option>
        </select>
        {q || statut || sp.type ? (
          <Link className="av2-btn ghost" href={`${BASE}/commandes`}>{t("Réinitialiser")}</Link>
        ) : null}
      </FilterForm>

      {packages.count > 0 ? (
        <p style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
          {t("{n} « commission package » ({x}) sont gardées et comptées dans vos gains, mais ne sont pas des commandes.", { n: packages.count, x: formatJPY(packages.totalJpy) })}{" "}
          {type !== "packages" ? <Link href={`${BASE}/commandes?type=colis`} style={{ color: "var(--av2-info)" }}>{t("Les voir")}</Link> : null}
        </p>
      ) : null}

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>{t("Commande")}</th>
              <th>{t("Client")}</th>
              <th>{t("Articles")}</th>
              <th>{t("Statut")}</th>
              <th className="r">{t("Montants")}</th>
              {access.role === "admin" ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>
                  {t("Aucune commande ne correspond.")}
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td className="av2-nowrap">
                    <Link className="av2-link" href={`${BASE}/commandes/${o.id}`}>
                      {o.public_ref ?? `#${o.id}`}
                    </Link>
                    <small>{L.date(o.purchase_date)} · {o.platform ?? "—"}</small>
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
                    <div className="av2-money"><span>{t("Articles")}</span> {formatJPY(o.item_price_jpy)}</div>
                    <div className="av2-money"><span>{t("Commission")}</span> {formatJPY(o.service_fee_jpy)}</div>
                    {(o.shipping_cost_jpy ?? 0) > 0 ? (
                      <div className="av2-money"><span>{o.shipping_paid ? t("Livraison payée") : t("Livraison à payer")}</span> {formatJPY(o.shipping_cost_jpy)}</div>
                    ) : null}
                  </td>
                  {access.role === "admin" ? (
                    <td className="av2-nowrap">
                      <Link className="av2-btn ghost sm" href={`${BASE}/commandes/${o.id}/modifier`}>{t("Modifier")}</Link>
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
          {total > 1 ? t("{n} commandes", { n: total }) : t("{n} commande", { n: total })} · {t("page {p} / {pages}", { p: Math.min(page, pages), pages })}
        </span>
        <div>
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, type: sp.type, page: page - 1 })}>{t("← Précédente")}</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, type: sp.type, page: page + 1 })}>{t("Suivante →")}</Link> : null}
        </div>
      </div>
    </>
  );
}
