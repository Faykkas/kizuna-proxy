"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseId } from "../../lib/contentFields";

// Annuler un lien de paiement en attente (comme l'ancienne admin). Un lien déjà payé ne peut pas être
// annulé : la condition « status = pending » est appliquée dans la requête elle-même.

export type Result = { ok: true } | { ok: false; error: string };

export async function cancelPaymentLink(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { data, error } = await sb.from("payment_links").update({ status: "cancelled" }).eq("id", pid.value).eq("status", "pending").select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: "Ce lien n'est plus en attente (déjà payé ou annulé)." };
  return { ok: true };
}
