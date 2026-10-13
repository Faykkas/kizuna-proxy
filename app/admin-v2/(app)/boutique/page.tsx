import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadShopItems } from "../../lib/queries";
import { formatJPY, toYen } from "../../lib/money";
import { DataError, PageHead, ReadOnlyTag, StatCard } from "../../components/ui";
import ShopManager from "./ShopManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Boutique")} — ${t("Administration Kizuna")}` };
}

export default async function ShopPage() {
  const access = await requireAccess();
  const { t } = await getL();

  let items;
  try {
    items = await loadShopItems(await createServerSupabase());
  } catch (e) {
    return (
      <>
        <PageHead title={t("Boutique")} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const onSale = items.filter((i) => i.available);
  const value = onSale.reduce((s, i) => s + toYen(i.price_jpy).yen + toYen(i.fee_jpy).yen, 0);

  return (
    <>
      <PageHead
        title={t("Boutique")}
        subtitle={t("Articles déjà achetés, proposés sur la page /shop du site.")}
        tags={access.role === "admin" ? undefined : <ReadOnlyTag />}
      />
      <div className="av2-grid cols-3">
        <StatCard label={t("En vente")} value={onSale.length} sub={t("{x} de valeur affichée", { x: formatJPY(value) })} />
        <StatCard label={t("Vendus")} value={items.length - onSale.length} />
        <StatCard label={t("Total d'articles")} value={items.length} />
      </div>
      {access.role === "admin" ? (
        <ShopManager items={items} />
      ) : (
        <p style={{ color: "var(--av2-muted)" }}>{t("Seuls les administrateurs peuvent modifier la boutique.")}</p>
      )}
    </>
  );
}
