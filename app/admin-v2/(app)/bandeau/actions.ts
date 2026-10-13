"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseText } from "../../lib/contentFields";

// Bandeau d'annonce affiché en haut du site (une seule ligne en base), comme l'ancienne admin.

export type Result = { ok: true } | { ok: false; error: string };
export type AnnounceInput = { text_en: string; from_date: string; to_date: string; active: boolean };

export async function saveAnnounce(input: AnnounceInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const text = parseText(input.text_en, "Le message", 400);
  const from = parseText(input.from_date, "La date de début", 60);
  const to = parseText(input.to_date, "La date de fin", 60);
  if (!text.ok) return text;
  if (!from.ok) return from;
  if (!to.ok) return to;
  if (input.active && !text.value) return { ok: false, error: "Écrivez un message avant d'afficher le bandeau." };

  const sb = await createServerSupabase();
  const payload = { text_en: text.value, from_date: from.value, to_date: to.value, active: !!input.active, updated_at: new Date().toISOString() };
  const { data: row } = await sb.from("announce").select("id").limit(1).maybeSingle();
  const { error } = row ? await sb.from("announce").update(payload).eq("id", row.id) : await sb.from("announce").insert(payload);
  return error ? { ok: false, error: error.message } : { ok: true };
}
