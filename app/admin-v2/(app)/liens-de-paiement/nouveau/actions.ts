"use server";

import { requireAccess } from "../../../lib/access";
import { createServerSupabase } from "../../../lib/supabase-server";
import { paypalFee } from "../../../lib/shipping";

// Création d'un lien de paiement — mêmes champs et mêmes règles que l'ancienne admin
// (PaymentLinksTab). Le lien est une simple ligne « pending » ; PayPal n'est appelé
// que lorsque le client ouvre /pay/<id>, par les routes existantes (non modifiées).
//
// Écrit avec le jeton de la personne connectée (jamais la clé service) : la RLS de
// Supabase décide. Réservé aux administrateurs.

export type NewLinkInput = {
  kind: "articles" | "shipping";
  label: string;
  items: { name: string; price: string }[];
  feeAmount: string; // frais Kizuna (articles) ou montant de la livraison (shipping)
  clientName: string;
  clientEmail: string;
};

export type CreateResult = { ok: true; id: string; total: number } | { ok: false; error: string };

const MAX_YEN = 10_000_000;

function toAmount(v: string): number | null {
  const s = (v ?? "").toString().trim();
  if (s === "") return 0;
  if (!/^\d+$/.test(s)) return null; // entiers seulement
  const n = Number(s);
  return n <= MAX_YEN ? n : null;
}

export async function createPaymentLink(input: NewLinkInput): Promise<CreateResult> {
  await requireAccess({ adminOnly: true });

  const isShipping = input.kind === "shipping";
  const label = (input.label ?? "").trim().slice(0, 200);
  if (!label) return { ok: false, error: "Indiquez un libellé (ce que le client verra)." };

  const feeAmount = toAmount(input.feeAmount);
  if (feeAmount == null) return { ok: false, error: "Le montant des frais / de la livraison doit être un nombre entier de yens." };

  const items: { name: string; price_jpy: number }[] = [];
  if (!isShipping) {
    for (const it of input.items ?? []) {
      const name = (it.name ?? "").trim().slice(0, 127);
      const raw = (it.price ?? "").toString().trim();
      if (!name && !raw) continue; // ligne vide ignorée
      const price = toAmount(raw);
      if (price == null) return { ok: false, error: `Prix invalide pour « ${name || "article"} » : entier de yens uniquement.` };
      if (name && price > 0) items.push({ name, price_jpy: price });
    }
  }
  const itemAmount = items.reduce((s, it) => s + it.price_jpy, 0);

  if (isShipping ? feeAmount <= 0 : itemAmount <= 0 && feeAmount <= 0) {
    return {
      ok: false,
      error: isShipping ? "Indiquez le montant de la livraison." : "Indiquez au moins un article, ou des frais Kizuna.",
    };
  }

  const email = (input.clientEmail ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Adresse email invalide." };

  const paypal = paypalFee(itemAmount, feeAmount);
  const total = itemAmount + feeAmount + paypal;

  const sb = await createServerSupabase();
  const { data, error } = await sb
    .from("payment_links")
    .insert({
      label,
      is_shipping: isShipping,
      items_breakdown: items.length > 0 ? items : null,
      item_amount_jpy: itemAmount,
      fee_amount_jpy: feeAmount,
      paypal_fee_jpy: paypal,
      amount_jpy: total,
      client_name: (input.clientName ?? "").trim().slice(0, 120) || null,
      client_email: email || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: `Création impossible : ${error?.message ?? "erreur inconnue"}` };
  return { ok: true, id: data.id as string, total };
}
