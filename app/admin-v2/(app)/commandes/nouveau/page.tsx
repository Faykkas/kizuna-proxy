import Link from "next/link";
import { requireAccess } from "../../../lib/access";
import { BASE } from "../../../lib/config";
import { PageHead } from "../../../components/ui";
import OrderForm from "../OrderForm";

export const metadata = { title: "Nouvelle commande — Administration Kizuna" };

export default async function NewOrderPage() {
  await requireAccess({ adminOnly: true });
  return (
    <>
      <Link className="av2-back" href={`${BASE}/commandes`}>← Retour aux commandes</Link>
      <PageHead title="Nouvelle commande" subtitle="Les photos s'ajoutent une fois la commande créée." />
      <OrderForm mode="create" />
    </>
  );
}
