/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { loadShopItems } from "../../lib/queries";
import { formatJPY, toYen } from "../../lib/money";
import { formatDateFr } from "../../lib/status";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatCard, Tag } from "../../components/ui";

export const metadata = { title: "Boutique — Administration Kizuna" };

export default async function ShopPage() {
  const access = await requireAccess();

  if (access.role === "staff") {
    return (
      <>
        <PageHead title="Boutique" tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let items;
  try {
    items = await loadShopItems(await createServerSupabase());
  } catch (e) {
    return (
      <>
        <PageHead title="Boutique" tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const onSale = items.filter((i) => i.available);
  const sold = items.filter((i) => !i.available);
  const total = (i: (typeof items)[number]) => toYen(i.price_jpy).yen + toYen(i.fee_jpy).yen;

  return (
    <>
      <PageHead
        title="Boutique"
        subtitle="Articles en vente et suivi des ventes. Pour ajouter, modifier ou marquer un article vendu, utilisez encore l'ancienne admin."
        tags={<ReadOnlyTag />}
      />

      <div className="av2-grid cols-3">
        <StatCard label="En vente" value={onSale.length} sub={`${formatJPY(onSale.reduce((s, i) => s + total(i), 0))} de valeur affichée`} />
        <StatCard label="Vendus" value={sold.length} />
        <div className="av2-card">
          <div className="av2-label">Modifier la boutique</div>
          <div style={{ marginTop: "0.6rem" }}>
            <Link className="av2-btn ghost" href="/admin" prefetch={false}>Ouvrir l'ancienne admin</Link>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>En vente</h2>
        {onSale.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>Aucun article en vente.</p>
        ) : (
          <div className="av2-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
            {onSale.map((i) => (
              <div className="av2-card" key={i.id}>
                {i.image_url ? (
                  <img src={i.image_url} alt={i.name ?? "Article"} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", background: "var(--av2-surface-2)", borderRadius: 8 }} />
                ) : null}
                <h3 style={{ margin: "0.6rem 0 0.3rem" }}>{i.name || "Sans nom"}</h3>
                <dl className="av2-dl" style={{ gridTemplateColumns: "1fr auto" }}>
                  <dt>Article</dt>
                  <dd>{formatJPY(toYen(i.price_jpy).yen)}</dd>
                  <dt>Frais Kizuna</dt>
                  <dd>{formatJPY(toYen(i.fee_jpy).yen)}</dd>
                  <dt><strong>Total</strong></dt>
                  <dd><strong>{formatJPY(total(i))}</strong></dd>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>Suivi des ventes</h2>
        <div className="av2-tablewrap">
          <table className="av2-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Acheteur</th>
                <th>À envoyer avant le</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {sold.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.4rem" }}>Aucune vente enregistrée.</td>
                </tr>
              ) : (
                sold.map((i) => (
                  <tr key={i.id}>
                    <td>{i.name || "Sans nom"}</td>
                    <td>{i.buyer_name || <Tag kind="soon">Acheteur non renseigné</Tag>}</td>
                    <td>{i.ship_by ? formatDateFr(i.ship_by) : "—"}</td>
                    <td className="r">{formatJPY(total(i))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
