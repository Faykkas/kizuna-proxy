"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseText, parseYen } from "../../lib/contentFields";
import { ADVANCE_CATEGORIES, noteWithCategory, type AdvanceCategory } from "../../lib/mayuko";

// Registre « À rembourser à Mayuko » : remboursements faits et avances supplémentaires, saisis à la main.
// Réservé aux administrateurs (la RLS de Supabase le vérifie aussi). Chaque ajout ou suppression est
// enregistré dans le journal d'audit.

export type Result = { ok: true } | { ok: false; error: string };
export type LedgerInput = { kind: string; date: string; amount: string; note: string; category?: string };

const isCategory = (c: unknown): c is AdvanceCategory => (ADVANCE_CATEGORIES as unknown[]).includes(c);

const UPDATE_HINT = "Pour changer le type d'une avance, exécutez d'abord le SQL 20261114130000_mayuko_ledger_note_update.sql dans Supabase.";
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
  const note = parseText(input.note, "La note", 280);
  if (!note.ok) return note;
  // Une avance en plus est toujours classée : livraison, taxes Zonos ou autre.
  if (input.kind === "advance" && !isCategory(input.category)) return { ok: false, error: "Choisissez le type d'avance (livraison, taxes Zonos ou autre)." };
  const finalNote = input.kind === "advance" && isCategory(input.category) ? noteWithCategory(input.category, note.value) : note.value;

  const sb = await createServerSupabase();
  const { error } = await sb.from("mayuko_ledger").insert({ kind: input.kind, entry_date: date, amount_jpy: amount.value, note: finalNote || null });
  if (error) return { ok: false, error: /mayuko_ledger/.test(error.message) && /exist|schema cache/i.test(error.message) ? TABLE_HINT : error.message };
  return { ok: true };
}

/** Change la catégorie d'une avance déjà notée (le texte libre de la note est gardé). */
export async function setAdvanceCategory(id: number, category: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Mouvement invalide." };
  if (!isCategory(category)) return { ok: false, error: "Choisissez le type d'avance (livraison, taxes Zonos ou autre)." };
  const sb = await createServerSupabase();
  const { data, error } = await sb.from("mayuko_ledger").select("kind,note").eq("id", id).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data || data.kind !== "advance") return { ok: false, error: "Mouvement invalide." };
  const { data: rows, error: upErr } = await sb
    .from("mayuko_ledger")
    .update({ note: noteWithCategory(category, data.note as string | null) })
    .eq("id", id)
    .select("id");
  if ((upErr && /permission denied/i.test(upErr.message)) || (!upErr && !rows?.length)) return { ok: false, error: UPDATE_HINT };
  return upErr ? { ok: false, error: upErr.message } : { ok: true };
}

export async function deleteLedgerEntry(id: number): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Mouvement invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("mayuko_ledger").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
