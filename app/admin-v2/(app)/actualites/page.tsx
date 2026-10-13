import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { DataError, PageHead, ReadOnlyTag } from "../../components/ui";
import NewsManager, { type NewsRow } from "./NewsManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Actualités")} — ${t("Administration Kizuna")}` };
}

export default async function NewsPage() {
  const access = await requireAccess();
  const { t } = await getL();
  const { data, error } = await (await createServerSupabase()).from("news").select("id,title,content,category,published_at").order("published_at", { ascending: false });
  return (
    <>
      <PageHead title={t("Actualités")} subtitle={t("Annonces affichées sur la page d'accueil et sur /news.")} tags={access.role === "admin" ? undefined : <ReadOnlyTag />} />
      {error ? <DataError message={error.message} /> : access.role === "admin" ? <NewsManager items={(data ?? []) as NewsRow[]} /> : <p style={{ color: "var(--av2-muted)" }}>{t("Seuls les administrateurs peuvent publier.")}</p>}
    </>
  );
}
