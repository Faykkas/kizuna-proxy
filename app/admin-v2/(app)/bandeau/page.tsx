import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { DataError, PageHead, ReadOnlyTag } from "../../components/ui";
import AnnounceForm from "./AnnounceForm";

export const metadata = { title: "Bandeau d'annonce — Administration Kizuna" };

export default async function AnnouncePage() {
  const access = await requireAccess();
  const { data, error } = await (await createServerSupabase()).from("announce").select("text_en,from_date,to_date,active").limit(1).maybeSingle();
  return (
    <>
      <PageHead title="Bandeau d'annonce" subtitle="Message affiché en haut du site." tags={access.role === "admin" ? undefined : <ReadOnlyTag />} />
      {error ? (
        <DataError message={error.message} />
      ) : access.role === "admin" ? (
        <AnnounceForm initial={data ?? { text_en: "", from_date: "", to_date: "", active: false }} />
      ) : (
        <p style={{ color: "var(--av2-muted)" }}>Seuls les administrateurs peuvent modifier le bandeau.</p>
      )}
    </>
  );
}
