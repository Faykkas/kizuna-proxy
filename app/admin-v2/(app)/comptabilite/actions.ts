"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseText, parseYen } from "../../lib/contentFields";
import { EXPENSE_CATEGORIES } from "../../lib/accounting";

// Dépenses professionnelles (table business_expenses, la même que l'ancien onglet « Charges »).
// Réservé aux administrateurs.

export type Result = { ok: true } | { ok: false; error: string };
export type ExpenseInput = { id?: number; label: string; category: string; amount_jpy: string; frequency: string; notes: string };

export async function saveExpense(input: ExpenseInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const label = parseText(input.label, "Le libellé", 200, true);
  const notes = parseText(input.notes, "La note", 1000);
  const amount = parseYen(input.amount_jpy, "Le montant");
  if (!label.ok) return label;
  if (!notes.ok) return notes;
  if (!amount.ok) return amount;
  if (amount.value <= 0) return { ok: false, error: "Le montant doit être supérieur à 0." };
  if (!EXPENSE_CATEGORIES.includes(input.category)) return { ok: false, error: "Catégorie inconnue." };
  if (input.frequency !== "monthly" && input.frequency !== "yearly") return { ok: false, error: "Fréquence inconnue." };

  const sb = await createServerSupabase();
  const payload = { label: label.value, category: input.category, amount_jpy: amount.value, frequency: input.frequency, notes: notes.value || null };
  if (input.id != null) {
    if (!Number.isInteger(input.id) || input.id <= 0) return { ok: false, error: "Dépense invalide." };
    const { error } = await sb.from("business_expenses").update(payload).eq("id", input.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { data: last } = await sb.from("business_expenses").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("business_expenses").insert({ ...payload, sort_order: ((last?.sort_order as number | undefined) ?? 0) + 1 });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteExpense(id: number): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Dépense invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("business_expenses").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
