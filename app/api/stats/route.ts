// GET /api/stats : chiffres publics du bandeau de preuve (commandes livrées, pays livrés). Seulement des totaux, jamais de
// donnée client. Calculés depuis la table orders (clé serveur), mis en cache 1 h (mémoire + CDN).

import { createClient } from "@supabase/supabase-js";
import { computeStats, type StatOrder } from "../../lib/siteStats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cached: { at: number; value: { delivered: number; countries: number } } | null = null;
const TTL = 60 * 60 * 1000;

export async function GET() {
  if (cached && Date.now() - cached.at < TTL) {
    return Response.json(cached.value, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return Response.json({ error: "unavailable" }, { status: 503 });
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const rows: StatOrder[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await sb.from("orders").select("status, delivery_country, client_name").order("id", { ascending: true }).range(from, from + 999);
    if (error) return Response.json({ error: "unavailable" }, { status: 503 });
    rows.push(...((data as StatOrder[]) || []));
    if (!data || data.length < 1000) break;
  }
  const value = computeStats(rows);
  cached = { at: Date.now(), value };
  return Response.json(value, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
