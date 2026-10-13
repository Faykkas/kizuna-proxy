import { SignOutButton } from "../../components/Shell";
import { getL } from "../../lib/lang-server";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Accès refusé")} — ${t("Administration Kizuna")}` };
}

const MESSAGES: Record<string, string> = {
  no_role: "Ce compte n'a pas de rôle d'administration (admin ou staff).",
  not_in_roster: "Ce compte n'est pas (ou plus) autorisé dans la liste des comptes de l'administration.",
  inactive: "Ce compte a été désactivé.",
  role_mismatch: "Le rôle de ce compte ne correspond pas à la liste des comptes. Reconnectez-vous ; si le problème persiste, contactez un administrateur.",
  admin_only: "Cette page est réservée aux administrateurs.",
};

export default async function DeniedPage({ searchParams }: { searchParams: Promise<{ raison?: string }> }) {
  const { raison } = await searchParams;
  const { t } = await getL();
  const message = t(MESSAGES[raison ?? ""] ?? "Accès refusé.");
  return (
    <div className="av2-auth">
      <div className="av2-card av2-auth-card">
        <h1>{t("Accès refusé")}</h1>
        <p role="alert">{message}</p>
        <SignOutButton className="av2-btn ghost" />
      </div>
    </div>
  );
}
