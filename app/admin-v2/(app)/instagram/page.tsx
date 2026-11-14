import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadIgPostsSafe } from "../../lib/queriesIg";
import { Banner, DataError, PageHead, StaffNotice, StatCard } from "../../components/ui";
import IgManager from "./IgManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Instagram")} — ${t("Administration Kizuna")}` };
}

export default async function InstagramPage() {
  const dataP = createServerSupabase().then((sb) => loadIgPostsSafe(sb));
  dataP.catch(() => {});
  const access = await requireAccess();
  const { t } = await getL();

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Instagram")} />
        <StaffNotice />
      </>
    );
  }

  let data;
  try {
    data = await dataP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("Instagram")} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const count = (s: string) => data.posts.filter((p) => p.status === s).length;

  return (
    <>
      <PageHead title={t("Instagram")} subtitle={t("Posts sur les événements et sorties au Japon : visuel Kizuna généré, lien officiel, légende prête à copier.")} />

      {!data.available ? (
        <Banner kind="warn">{t("Instagram n'est pas encore activé dans Supabase : exécutez d'abord le SQL 20261114120000_ig_posts.sql.")}</Banner>
      ) : null}

      <div className="av2-grid cols-3">
        <StatCard label={t("Brouillons à relire")} value={String(count("draft"))} sub={t("Dont ceux préparés par la recherche automatique.")} />
        <StatCard label={t("Validés (visibles sur /ig)")} value={String(count("approved"))} />
        <StatCard label={t("Publiés sur Instagram")} value={String(count("published"))} />
      </div>

      <Banner kind="info">
        <strong>{t("La règle :")}</strong>{" "}
        {t("jamais de photo de produit trouvée sur internet (droits d'auteur, même avec une mention). Le visuel est généré à partir du texte, et le lien officiel est toujours donné : il apparaît sur kizunaproxy.com/ig, le lien à mettre dans votre bio Instagram.")}
      </Banner>

      {data.available ? <IgManager posts={data.posts} /> : null}
    </>
  );
}
