import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { listCustomers } from "../../lib/queries";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import FilterForm from "../../components/FilterForm";
import { RememberList } from "../../components/ListMemory";
import { Banner, DataError, PageHead, ReadOnlyTag, StaffNotice, Tag } from "../../components/ui";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Clients")} — ${t("Administration Kizuna")}` };
}

const SHOWN_MAX = 300;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const customersP = createServerSupabase().then((sb) => listCustomers(sb));
  customersP.catch(() => {});
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Clients")} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let customers;
  try {
    customers = await customersP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("Clients")} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const needle = q.toLowerCase();
  const filtered = needle ? customers.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(needle)) : customers;
  const shown = filtered.slice(0, SHOWN_MAX);

  return (
    <>
      <PageHead
        title={t("Clients")}
        subtitle={t("Regroupés à partir des commandes existantes (par email, sinon par nom). Il n'existe pas encore de vraie table clients.")}
        tags={<ReadOnlyTag />}
      />

      <Banner kind="info">
        <strong>{t("Statut « récurrent » provisoire :")}</strong>{" "}
        {t("2 commandes comptabilisées ou plus. La règle définitive sera fixée avec vous. Les informations de livraison ne sont pas affichées ici : elles se consultent dans le détail d'une commande.")}
      </Banner>

      <RememberList name="clients" />
      <FilterForm key={q} action={`${BASE}/clients`} className="av2-filters">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder={t("Rechercher : nom ou email")} aria-label={t("Rechercher un client")} />
        <button className="av2-btn" type="submit">{t("Rechercher")}</button>
        {q ? <Link className="av2-btn ghost" href={`${BASE}/clients`}>{t("Réinitialiser")}</Link> : null}
      </FilterForm>

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>{t("Client")}</th>
              <th>{t("Statut")}</th>
              <th className="r">{t("Commandes")}</th>
              <th className="r">{t("Commissions cumulées")}</th>
              <th>{t("Dernière commande")}</th>
              <th>{t("Compte")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>
                  {t("Aucun client ne correspond.")}
                </td>
              </tr>
            ) : (
              shown.map((c) => (
                <tr key={c.key}>
                  <td>
                    {c.email ? (
                      <Link className="av2-link" href={`${BASE}/commandes?q=${encodeURIComponent(c.email)}`}>{c.name || c.email}</Link>
                    ) : (
                      c.name || "—"
                    )}
                    <small>{c.name ? c.email : ""}</small>
                  </td>
                  <td>{c.earnedOrderCount >= 2 ? <Tag kind="ok">{t("Récurrent")}</Tag> : <Tag kind="muted">{c.earnedOrderCount === 1 ? t("1 commande") : t("Nouveau")}</Tag>}</td>
                  <td className="r">{c.orderCount}</td>
                  <td className="r">{formatJPY(c.commissionsJpy)}</td>
                  <td>{L.date(c.lastOrderDate)}</td>
                  <td>{c.hasAccount ? t("Oui") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="av2-pager">
        <span>
          {filtered.length > 1 ? t("{n} clients", { n: filtered.length }) : t("{n} client", { n: filtered.length })}
          {filtered.length > SHOWN_MAX ? ` — ${t("{n} premiers affichés, affinez la recherche", { n: SHOWN_MAX })}` : ""} · {t("triés par commissions cumulées")}
        </span>
      </div>
    </>
  );
}
