"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseCategory, parseId, parseText } from "../../lib/contentFields";

// Actualités de la page d'accueil. À la différence de l'ancienne admin, modifier un article ne change
// plus sa date de publication (sinon un simple correctif remontait l'article en tête).

export type Result = { ok: true } | { ok: false; error: string };
export type NewsInput = { id?: string; title: string; content: string; category: string };

export async function saveNews(input: NewsInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const title = parseText(input.title, "Le titre", 200, true);
  const content = parseText(input.content, "Le contenu", 8000, true);
  const category = parseCategory(input.category);
  if (!title.ok) return title;
  if (!content.ok) return content;
  if (!category.ok) return category;

  const sb = await createServerSupabase();
  const payload = { title: title.value, content: content.value, category: category.value };
  if (input.id) {
    const id = parseId(input.id);
    if (!id.ok) return id;
    const { error } = await sb.from("news").update(payload).eq("id", id.value);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { error } = await sb.from("news").insert({ ...payload, published_at: new Date().toISOString() });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteNews(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { error } = await sb.from("news").delete().eq("id", pid.value);
  return error ? { ok: false, error: error.message } : { ok: true };
}
