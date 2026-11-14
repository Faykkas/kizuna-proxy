"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseIgInput, type IgInput, type IgStatus } from "../../../lib/igPosts";

// Posts Instagram : création, modification, validation (visible sur /ig), publication, archivage.
// Réservé aux administrateurs (la RLS de Supabase le vérifie aussi) ; chaque changement est dans le journal d'audit.

export type Result = { ok: true } | { ok: false; error: string };

const TABLE_HINT = "Instagram n'est pas encore activé dans Supabase : exécutez d'abord le SQL 20261114120000_ig_posts.sql.";
const isMissing = (m: string) => /ig_posts/.test(m) && /exist|schema cache/i.test(m);
const validId = (id: string) => /^[0-9a-f-]{36}$/i.test(id ?? "");
const STATUSES: IgStatus[] = ["draft", "approved", "published", "archived"];

function dbError(message: string): Result {
  if (isMissing(message)) return { ok: false, error: TABLE_HINT };
  if (/duplicate|unique/i.test(message)) return { ok: false, error: "Un post existe déjà pour ce lien officiel." };
  return { ok: false, error: message };
}

export async function createIgPost(input: IgInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const parsed = parseIgInput(input);
  if (!parsed.ok) return parsed;
  const sb = await createServerSupabase();
  const { error } = await sb.from("ig_posts").insert({ ...parsed.value, status: "draft", created_by: "admin" });
  return error ? dbError(error.message) : { ok: true };
}

export async function updateIgPost(id: string, input: IgInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!validId(id)) return { ok: false, error: "Post invalide." };
  const parsed = parseIgInput(input);
  if (!parsed.ok) return parsed;
  const sb = await createServerSupabase();
  const { error } = await sb.from("ig_posts").update(parsed.value).eq("id", id);
  return error ? dbError(error.message) : { ok: true };
}

export async function setIgStatus(id: string, status: IgStatus): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!validId(id) || !STATUSES.includes(status)) return { ok: false, error: "Post invalide." };
  const sb = await createServerSupabase();
  const patch: Record<string, unknown> = { status };
  if (status === "published") patch.published_at = new Date().toISOString();
  const { error } = await sb.from("ig_posts").update(patch).eq("id", id);
  return error ? dbError(error.message) : { ok: true };
}

export async function deleteIgPost(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!validId(id)) return { ok: false, error: "Post invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("ig_posts").delete().eq("id", id);
  return error ? dbError(error.message) : { ok: true };
}
