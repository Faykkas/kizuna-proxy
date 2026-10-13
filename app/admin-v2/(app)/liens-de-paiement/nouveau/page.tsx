import Link from "next/link";
import { requireAccess } from "../../../lib/access";
import { getL } from "../../../lib/lang-server";
import { BASE } from "../../../lib/config";
import { Banner, PageHead } from "../../../components/ui";
import NewLinkForm from "./NewLinkForm";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Nouveau lien de paiement")} — ${t("Administration Kizuna")}` };
}

export default async function NewPaymentLinkPage() {
  await requireAccess({ adminOnly: true });
  const { t } = await getL();
  return (
    <>
      <Link className="av2-back" href={`${BASE}/liens-de-paiement`}>{t("← Retour aux liens de paiement")}</Link>
      <PageHead title={t("Nouveau lien de paiement")} subtitle={t("Même fonctionnement que l'ancienne admin : le lien est créé « en attente » et le client le règle par PayPal.")} />
      <Banner kind="warn">
        <strong>{t("Cette page crée un vrai lien")}</strong>{" "}
        {t("dans la base actuelle, payable par un client. Les paiements PayPal ne sont pas modifiés : seul le formulaire de création est repris.")}
      </Banner>
      <NewLinkForm />
    </>
  );
}
