import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll, type EntityRow } from "./queries";
import type { Expense, ReceiptLink } from "./accounting";

// Lectures pour la comptabilité (lecture seule : uniquement .select()).

export function loadPaidLinksForJournal(sb: SupabaseClient) {
  return fetchAll<ReceiptLink>((from, to) =>
    sb
      .from("payment_links")
      .select("id,label,client_name,paid_at,amount_jpy,item_amount_jpy,fee_amount_jpy,paypal_fee_jpy,paypal_real_fee_jpy,is_shipping,paypal_order_id")
      .eq("status", "paid")
      .order("paid_at")
      .range(from, to),
  );
}

export async function loadExpenses(sb: SupabaseClient): Promise<Expense[]> {
  const { data, error } = await sb.from("business_expenses").select("id,label,category,amount_jpy,frequency,notes").order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Expense[];
}

/** Entités fiscales, ou liste vide si la migration de la phase 0 n'est pas encore appliquée. */
export async function loadEntitiesSafe(sb: SupabaseClient): Promise<EntityRow[]> {
  const { data, error } = await sb.from("business_entities").select("id,name,notes,active_from,active_to").order("name");
  if (error) return [];
  return (data ?? []) as EntityRow[];
}
