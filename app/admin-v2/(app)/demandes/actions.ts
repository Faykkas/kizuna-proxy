"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { REQUEST_STATUSES } from "../../lib/requestStatuses";

// Changer le statut d'une demande. Les statuts sont ceux de l'ancienne admin (new / read / converted / declined),
// pour que les deux admins restent compatibles. Seul le statut change : jamais le contenu de la demande.

export type Result = { ok: true } | { ok: false; error: string };

export async function setRequestStatus(id: number, status: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Demande invalide." };
  if (!(REQUEST_STATUSES as readonly string[]).includes(status)) return { ok: false, error: `Statut inconnu : ${String(status).slice(0, 30)}` };
  const sb = await createServerSupabase();
  const { data, error } = await sb.from("requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: "Demande introuvable." };
  return { ok: true };
}
