"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { findConflicts, validateOrderChanges, type Clean } from "../../lib/orderFields";

// Écritures sur les commandes — mêmes champs que l'ancienne admin (OrderManager), avec en plus :
//   - une liste blanche de champs et une validation côté serveur ;
//   - uniquement les champs MODIFIÉS sont écrits, et refusés si la base a changé entre-temps
//     (un paiement par lien peut se fusionner dans la commande pendant qu'on la modifie) ;
//   - jamais de suppression : une commande se « Annule » (statut), l'historique reste.
// Réservé aux administrateurs. Écrit avec le jeton de la personne connectée (RLS), jamais la clé service.
// Le changement de statut déclenche, comme avant, la chronologie et la notification côté base.

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; conflicts?: string[] };

function todayJst(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function createOrder(input: Record<string, unknown>): Promise<ActionResult<{ id: number; ref: string }>> {
  await requireAccess({ adminOnly: true });

  const withDefaults = {
    platform: "Reddit",
    communication: "Discord",
    payment_method: "PayPal / Goods & Services",
    payment_received: true,
    status: "Pending",
    purchase_date: todayJst(),
    item_price_jpy: 0,
    service_fee_jpy: 0,
    ...input,
  };
  // Un champ vide ne doit pas écraser la valeur par défaut de la date d'achat.
  if (!String(withDefaults.purchase_date ?? "").trim()) withDefaults.purchase_date = todayJst();
  const v = validateOrderChanges(withDefaults);
  if (!v.ok) return { ok: false, error: v.error };
  if (!v.clean.client_name) return { ok: false, error: "Le nom du client est obligatoire." };

  const sb = await createServerSupabase();
  const { data, error } = await sb
    .from("orders")
    .insert({ ...v.clean, updated_at: new Date().toISOString() })
    .select("id, public_ref")
    .single();
  if (error || !data) return { ok: false, error: `Création impossible : ${error?.message ?? "erreur inconnue"}` };
  return { ok: true, id: data.id as number, ref: (data.public_ref as string | null) ?? `#${data.id}` };
}

export async function updateOrder(args: {
  id: number;
  changes: Record<string, unknown>;
  before: Record<string, unknown>;
}): Promise<ActionResult<{ changed: string[] }>> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(args.id) || args.id <= 0) return { ok: false, error: "Commande invalide." };

  const v = validateOrderChanges(args.changes);
  if (!v.ok) return { ok: false, error: v.error };
  const fields = Object.keys(v.clean);
  if (fields.length === 0) return { ok: true, changed: [] };

  const sb = await createServerSupabase();
  const { data: current, error: readErr } = await sb.from("orders").select("*").eq("id", args.id).maybeSingle();
  if (readErr) return { ok: false, error: `Lecture impossible : ${readErr.message}` };
  if (!current) return { ok: false, error: "Cette commande n'existe plus." };

  // On n'écrase jamais un champ modifié par ailleurs depuis le chargement du formulaire.
  const watched = Object.fromEntries(fields.map((f) => [f, (args.before ?? {})[f] ?? null]));
  const conflicts = findConflicts(watched, current as Record<string, unknown>);
  if (conflicts.length > 0) {
    return {
      ok: false,
      conflicts,
      error: "Cette commande a été modifiée entre-temps (par exemple un paiement ajouté). Rechargez la page avant de réessayer.",
    };
  }

  const { error } = await sb
    .from("orders")
    .update({ ...v.clean, updated_at: new Date().toISOString() })
    .eq("id", args.id);
  if (error) return { ok: false, error: `Enregistrement impossible : ${error.message}` };
  return { ok: true, changed: fields };
}

/** Une action : fixer le prix de livraison, le marquer « à payer » et prévenir le client (statut dédié). */
export async function requestShippingPayment(id: number, shippingCost: number): Promise<ActionResult> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Commande invalide." };
  if (!Number.isInteger(shippingCost) || shippingCost <= 0) return { ok: false, error: "Indiquez d'abord un prix de livraison supérieur à 0." };

  const clean: Clean = { shipping_cost_jpy: shippingCost, shipping_paid: false, status: "Awaiting Shipping Payment" };
  const sb = await createServerSupabase();
  const { error } = await sb
    .from("orders")
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: `Demande impossible : ${error.message}` };
  return { ok: true };
}

export type ProfileOption = { id: string; name: string };

/** Comptes clients, pour rattacher une commande à un compte (comme l'ancienne admin). */
export async function listProfiles(): Promise<ProfileOption[]> {
  await requireAccess({ adminOnly: true });
  const sb = await createServerSupabase();
  const { data } = await sb.from("profiles").select("id, full_name").order("full_name").limit(500);
  return (data ?? []).map((p) => ({ id: p.id as string, name: ((p.full_name as string | null) || (p.id as string).slice(0, 8)) }));
}
