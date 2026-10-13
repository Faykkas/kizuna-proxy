import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { listCustomers } from "../../lib/queries";
import { BASE } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { formatDateFr } from "../../lib/status";
import { Banner, DataError, PageHead, ReadOnlyTag, StaffNotice, Tag } from "../../components/ui";

export const metadata = { title: "Clients — Administration Kizuna" };

const SHOWN_MAX = 300;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const access = await requireAccess();
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);

  if (access.role === "staff") {
    return (
      <>
        <PageHead title="Clients" tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  const sb = await createServerSupabase();
  let customers;
  try {
    customers = await listCustomers(sb);
  } catch (e) {
    return (
      <>
        <PageHead title="Clients" tags={<ReadOnlyTag />} />
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
        title="Clients"
        subtitle="Regroupés à partir des commandes existantes (par email, sinon par nom). Il n'existe pas encore de vraie table clients."
        tags={<ReadOnlyTag />}
      />

      <Banner kind="info">
        <strong>Statut « récurrent » provisoire :</strong> 2 commandes comptabilisées ou plus. La règle définitive sera fixée avec vous.
        Les informations de livraison ne sont pas affichées ici : elles se consultent dans le détail d'une commande.
      </Banner>

      <form method="get" action={`${BASE}/clients`} className="av2-filters" role="search">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder="Rechercher : nom ou email" aria-label="Rechercher un client" />
        <button className="av2-btn" type="submit">Rechercher</button>
        {q ? <Link className="av2-btn ghost" href={`${BASE}/clients`}>Réinitialiser</Link> : null}
      </form>

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Statut</th>
              <th className="r">Commandes</th>
              <th className="r">Commissions cumulées</th>
              <th>Dernière commande</th>
              <th>Compte</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>
                  Aucun client ne correspond.
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
                  <td>{c.earnedOrderCount >= 2 ? <Tag kind="ok">Récurrent</Tag> : <Tag kind="muted">{c.earnedOrderCount === 1 ? "1 commande" : "Nouveau"}</Tag>}</td>
                  <td className="r">{c.orderCount}</td>
                  <td className="r">{formatJPY(c.commissionsJpy)}</td>
                  <td>{formatDateFr(c.lastOrderDate)}</td>
                  <td>{c.hasAccount ? "Oui" : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="av2-pager">
        <span>
          {filtered.length} client{filtered.length > 1 ? "s" : ""}
          {filtered.length > SHOWN_MAX ? ` — ${SHOWN_MAX} premiers affichés, affinez la recherche` : ""} · triés par commissions cumulées
        </span>
      </div>
    </>
  );
}
