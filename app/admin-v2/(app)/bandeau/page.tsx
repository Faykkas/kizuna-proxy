import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { DataError, PageHead, ReadOnlyTag } from "../../components/ui";
import AnnounceForm from "./AnnounceForm";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Bandeau d'annonce")} — ${t("Administration Kizuna")}` };
}

export default async function AnnouncePage() {
  const access = await requireAccess();
  const { t } = await getL();
  const { data, error } = await (await createServerSupabase()).from("announce").select("text_en,from_date,to_date,active").limit(1).maybeSingle();
  return (
    <>
      <PageHead title={t("Bandeau d'annonce")} subtitle={t("Message affiché en haut du site.")} tags={access.role === "admin" ? undefined : <ReadOnlyTag />} />
      {error ? (
        <DataError message={error.message} />
      ) : access.role === "admin" ? (
        <AnnounceForm initial={data ?? { text_en: "", from_date: "", to_date: "", active: false }} />
      ) : (
        <p style={{ color: "var(--av2-muted)" }}>{t("Seuls les administrateurs peuvent modifier le bandeau.")}</p>
      )}
    </>
  );
}
