"use server";

import { requireAccess } from "../../../lib/access";
import { createServerSupabase } from "../../../lib/supabase-server";
import { paypalFee } from "../../../lib/shipping";
import { parseHttpUrl } from "../../../lib/contentFields";
import { splitNameAndUrl } from "../../../../pay/describeItem";

// Création d'un lien de paiement — mêmes champs et mêmes règles que l'ancienne admin
// (PaymentLinksTab). Le lien est une simple ligne « pending » ; PayPal n'est appelé
// que lorsque le client ouvre /pay/<id>, par les routes existantes (non modifiées).
//
// Écrit avec le jeton de la personne connectée (jamais la clé service) : la RLS de
// Supabase décide. Réservé aux administrateurs.

export type NewLinkInput = {
  kind: "articles" | "shipping";
  label: string;
  items: { name: string; price: string; url?: string }[];
  feeAmount: string; // frais Kizuna (articles) ou montant de la livraison (shipping)
  clientName: string;
  clientEmail: string;
  /** "auto" = règle automatique, "new" = nouvelle commande, sinon l'identifiant de la commande choisie. */
  orderTarget: string;
};

export type CreateResult = { ok: true; id: string; total: number } | { ok: false; error: string };

export type ClientOrder = {
  id: number;
  ref: string;
  status: string | null;
  purchaseDate: string | null;
  itemsSummary: string;
  itemPrice: number;
  serviceFee: number;
};

/** Commandes d'un client (par email), pour choisir celle qui recevra le paiement. Réservé aux administrateurs. */
export async function listClientOrders(email: string): Promise<ClientOrder[]> {
  await requireAccess({ adminOnly: true });
  const clean = (email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return [];
  const pattern = clean.replace(/[\\%_]/g, (m) => "\\" + m);
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("orders")
    .select("id,public_ref,status,purchase_date,items,item_price_jpy,service_fee_jpy")
    .ilike("client_email", pattern)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []).map((o) => ({
    id: o.id as number,
    ref: (o.public_ref as string | null) ?? `#${o.id}`,
    status: o.status as string | null,
    purchaseDate: o.purchase_date as string | null,
    itemsSummary: ((o.items as string | null) ?? "").replace(/\s+/g, " ").slice(0, 48),
    itemPrice: Math.round((o.item_price_jpy as number | null) ?? 0),
    serviceFee: Math.round((o.service_fee_jpy as number | null) ?? 0),
  }));
}

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

  const items: { name: string; price_jpy: number; url?: string }[] = [];
  if (!isShipping) {
    for (const it of input.items ?? []) {
      const raw = (it.price ?? "").toString().trim();
      const link = parseHttpUrl(it.url, `Le lien de « ${(it.name ?? "").trim() || "l'article"} »`);
      if (!link.ok) return link;
      // Une adresse collée dans « nom » (ancienne habitude) devient le lien ; un lien sans nom donne un nom lisible.
      const { name, url } = splitNameAndUrl((it.name ?? "").trim().slice(0, 500), link.value);
      if (!name && !raw) continue; // ligne vide ignorée
      const price = toAmount(raw);
      if (price == null) return { ok: false, error: `Prix invalide pour « ${name || "article"} » : entier de yens uniquement.` };
      // Jamais d'article ignoré en silence : sans prix, le client serait sous-facturé.
      if (name && price === 0) return { ok: false, error: `Indiquez le prix de « ${name} ».` };
      if (name && price > 0) items.push({ name: name.slice(0, 127), price_jpy: price, ...(url ? { url } : {}) });
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

  // Commande de destination : validée côté serveur (existence), jamais prise telle quelle du navigateur.
  const orderFields: { target_order_id?: number; new_order?: boolean } = {};
  const sbForOrder = await createServerSupabase();
  if (input.orderTarget === "new") {
    orderFields.new_order = true;
  } else if (input.orderTarget && input.orderTarget !== "auto") {
    if (!/^\d{1,9}$/.test(input.orderTarget)) return { ok: false, error: "Commande choisie invalide." };
    const { data: target } = await sbForOrder.from("orders").select("id").eq("id", Number(input.orderTarget)).maybeSingle();
    if (!target) return { ok: false, error: "La commande choisie n'existe plus. Rechargez la liste." };
    orderFields.target_order_id = Number(input.orderTarget);
  }

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
      ...orderFields, // colonnes optionnelles : absentes tant que le choix reste « automatique »
    })
    .select("id")
    .single();

  if (error && /target_order_id|new_order/.test(error.message)) {
    return {
      ok: false,
      error: "Le choix de la commande n'est pas encore activé dans Supabase : exécutez d'abord le SQL 20261013180000_payment_link_order_target.sql, ou choisissez « Automatique ».",
    };
  }
  if (error || !data) return { ok: false, error: `Création impossible : ${error?.message ?? "erreur inconnue"}` };
  return { ok: true, id: data.id as string, total };
}
