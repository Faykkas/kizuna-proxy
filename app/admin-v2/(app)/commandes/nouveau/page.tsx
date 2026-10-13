import Link from "next/link";
import { requireAccess } from "../../../lib/access";
import { getL } from "../../../lib/lang-server";
import { BASE } from "../../../lib/config";
import { PageHead } from "../../../components/ui";
import OrderForm from "../OrderForm";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Nouvelle commande")} — ${t("Administration Kizuna")}` };
}

export default async function NewOrderPage() {
  await requireAccess({ adminOnly: true });
  const { t } = await getL();
  return (
    <>
      <Link className="av2-back" href={`${BASE}/commandes`}>{t("← Retour aux commandes")}</Link>
      <PageHead title={t("Nouvelle commande")} subtitle={t("Les photos s'ajoutent une fois la commande créée.")} />
      <OrderForm mode="create" />
    </>
  );
}
