import type { SupabaseClient } from "@supabase/supabase-js";
import type { IgPost } from "../../lib/igPosts.ts";

const MISSING = new Set(["42P01", "PGRST205"]);

/** Posts Instagram, les plus récents d'abord. `available: false` tant que le SQL 20261114120000_ig_posts.sql n'est pas appliqué. */
export async function loadIgPostsSafe(sb: SupabaseClient): Promise<{ available: boolean; posts: IgPost[] }> {
  const { data, error } = await sb.from("ig_posts").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) {
    if (MISSING.has(error.code ?? "") || /ig_posts/.test(error.message)) return { available: false, posts: [] };
    throw new Error(error.message);
  }
  return { available: true, posts: (data ?? []) as IgPost[] };
}
