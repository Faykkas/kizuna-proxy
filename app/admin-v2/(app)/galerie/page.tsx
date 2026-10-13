import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { DataError, PageHead, ReadOnlyTag } from "../../components/ui";
import GalleryManager, { type GalleryRow } from "./GalleryManager";

export const metadata = { title: "Galerie — Administration Kizuna" };

export default async function GalleryPage() {
  const access = await requireAccess();
  const { data, error } = await (await createServerSupabase()).from("gallery").select("id,title,subtitle,image_url,sort_order").order("sort_order").order("created_at");
  return (
    <>
      <PageHead title="Galerie" subtitle="Photos du carrousel de la page d'accueil." tags={access.role === "admin" ? undefined : <ReadOnlyTag />} />
      {error ? <DataError message={error.message} /> : access.role === "admin" ? <GalleryManager items={(data ?? []) as GalleryRow[]} /> : <p style={{ color: "var(--av2-muted)" }}>Seuls les administrateurs peuvent modifier la galerie.</p>}
    </>
  );
}
