import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "../../../../lib/access";
import { createServerSupabase } from "../../../../lib/supabase-server";
import { getL } from "../../../../lib/lang-server";
import { getOrder } from "../../../../lib/queries";
import { BASE } from "../../../../lib/config";
import { DataError, PageHead, StatusBadge } from "../../../../components/ui";
import OrderForm from "../../OrderForm";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Modifier la commande")} — ${t("Administration Kizuna")}` };
}

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAccess({ adminOnly: true });
  const { t } = await getL();
  const { id: rawId } = await params;
  if (!/^\d{1,9}$/.test(rawId)) notFound();
  const id = Number(rawId);

  let found;
  try {
    found = await getOrder(await createServerSupabase(), id);
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }
  if (!found) notFound();
  const o = found.order;

  return (
    <>
      <Link className="av2-back" href={`${BASE}/commandes/${id}`}>{t("← Retour à la commande")}</Link>
      <PageHead title={t("Modifier {ref}", { ref: o.public_ref ?? `#${o.id}` })} subtitle={<StatusBadge status={o.status} />} />
      {/* key : un nouveau chargement (après enregistrement) repart d'un état propre */}
      <OrderForm key={`${o.id}-${o.updated_at ?? ""}-${o.item_price_jpy}-${o.shipping_cost_jpy}-${o.status}`} mode="edit" order={o as unknown as Record<string, string | number | boolean | null>} />
    </>
  );
}
