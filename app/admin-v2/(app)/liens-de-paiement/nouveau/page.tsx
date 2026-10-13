import Link from "next/link";
import { requireAccess } from "../../../lib/access";
import { BASE } from "../../../lib/config";
import { Banner, PageHead } from "../../../components/ui";
import NewLinkForm from "./NewLinkForm";

export const metadata = { title: "Nouveau lien de paiement — Administration Kizuna" };

export default async function NewPaymentLinkPage() {
  await requireAccess({ adminOnly: true });
  return (
    <>
      <Link className="av2-back" href={`${BASE}/liens-de-paiement`}>← Retour aux liens de paiement</Link>
      <PageHead title="Nouveau lien de paiement" subtitle="Même fonctionnement que l'ancienne admin : le lien est créé « en attente » et le client le règle par PayPal." />
      <Banner kind="warn">
        <strong>Cette page crée un vrai lien</strong> dans la base actuelle, payable par un client. Les paiements PayPal ne sont pas
        modifiés : seul le formulaire de création est repris.
      </Banner>
      <NewLinkForm />
    </>
  );
}
