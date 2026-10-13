"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseId, parseImageUrl, parseText, storagePathFromPublicUrl } from "../../lib/contentFields";

// Galerie de la page d'accueil — ajouter, modifier, réordonner, supprimer (comme l'ancienne admin).

export type Result = { ok: true } | { ok: false; error: string };
export type GalleryInput = { id?: string; title: string; subtitle: string; image_url: string };

export async function saveGalleryItem(input: GalleryInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const title = parseText(input.title, "Le titre", 200, true);
  const subtitle = parseText(input.subtitle, "Le sous-titre", 300);
  const image = parseImageUrl(input.image_url, "L'image");
  if (!title.ok) return title;
  if (!subtitle.ok) return subtitle;
  if (!image.ok) return image;

  const sb = await createServerSupabase();
  const payload = { title: title.value, subtitle: subtitle.value, image_url: image.value };
  if (input.id) {
    const id = parseId(input.id);
    if (!id.ok) return id;
    const { error } = await sb.from("gallery").update(payload).eq("id", id.value);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { data: last } = await sb.from("gallery").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("gallery").insert({ ...payload, sort_order: ((last?.sort_order as number | undefined) ?? -1) + 1 });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function moveGalleryItem(id: string, dir: -1 | 1): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { data } = await sb.from("gallery").select("id, sort_order").order("sort_order").order("created_at");
  const rows = data ?? [];
  const i = rows.findIndex((r) => r.id === pid.value);
  const other = rows[i + dir];
  if (i < 0 || !other) return { ok: true };
  const same = rows[i].sort_order === other.sort_order;
  const a = same ? i : (rows[i].sort_order as number);
  const b = same ? i + dir : (other.sort_order as number);
  const r1 = await sb.from("gallery").update({ sort_order: b }).eq("id", rows[i].id);
  const r2 = await sb.from("gallery").update({ sort_order: a }).eq("id", other.id);
  const err = r1.error ?? r2.error;
  return err ? { ok: false, error: err.message } : { ok: true };
}

export async function deleteGalleryItem(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { data: item } = await sb.from("gallery").select("image_url").eq("id", pid.value).maybeSingle();
  const { error } = await sb.from("gallery").delete().eq("id", pid.value);
  if (error) return { ok: false, error: error.message };
  const path = item?.image_url ? storagePathFromPublicUrl(item.image_url as string, "gallery") : null;
  if (path) await sb.storage.from("gallery").remove([path]);
  return { ok: true };
}
