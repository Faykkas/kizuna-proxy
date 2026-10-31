"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseText, parseYen } from "../../lib/contentFields";

// Registre « À rembourser à Mayuko » : remboursements faits et avances supplémentaires, saisis à la main.
// Réservé aux administrateurs (la RLS de Supabase le vérifie aussi). Chaque ajout ou suppression est
// enregistré dans le journal d'audit.

export type Result = { ok: true } | { ok: false; error: string };
export type LedgerInput = { kind: string; date: string; amount: string; note: string };

const TABLE_HINT = "Le registre n'est pas encore activé dans Supabase : exécutez d'abord le SQL 20261101130000_mayuko_ledger.sql.";

function validDay(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export async function addLedgerEntry(input: LedgerInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (input.kind !== "repayment" && input.kind !== "advance") return { ok: false, error: "Type de mouvement inconnu." };
  const date = (input.date ?? "").trim();
  if (!validDay(date)) return { ok: false, error: "Date invalide." };
  const amount = parseYen(input.amount, "Le montant");
  if (!amount.ok) return amount;
  if (amount.value <= 0) return { ok: false, error: "Le montant doit être supérieur à 0." };
  const note = parseText(input.note, "La note", 300);
  if (!note.ok) return note;

  const sb = await createServerSupabase();
  const { error } = await sb.from("mayuko_ledger").insert({ kind: input.kind, entry_date: date, amount_jpy: amount.value, note: note.value || null });
  if (error) return { ok: false, error: /mayuko_ledger/.test(error.message) && /exist|schema cache/i.test(error.message) ? TABLE_HINT : error.message };
  return { ok: true };
}

export async function deleteLedgerEntry(id: number): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Mouvement invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("mayuko_ledger").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
