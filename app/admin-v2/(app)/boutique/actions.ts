"use server";

import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseId, parseImageUrl, parseText, parseYen, parseDateOrEmpty, storagePathFromPublicUrl } from "../../lib/contentFields";

// Boutique — mêmes fonctions que l'ancienne admin : ajouter/modifier un article, le marquer vendu ou
// le remettre en vente, le déplacer, noter l'acheteur et la date d'envoi, supprimer.
// Réservé aux administrateurs ; écrit avec le jeton de la personne connectée (RLS).

export type Result = { ok: true } | { ok: false; error: string };

export type ShopInput = { id?: string; name: string; image_url: string; price_jpy: string; fee_jpy: string };

export async function saveShopItem(input: ShopInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const name = parseText(input.name, "Le nom", 200, true);
  const image = parseImageUrl(input.image_url, "La photo");
  const price = parseYen(input.price_jpy, "Le prix");
  const fee = parseYen(input.fee_jpy, "Les frais Kizuna");
  for (const r of [name, image, price, fee]) if (!r.ok) return r;
  if (!name.ok || !image.ok || !price.ok || !fee.ok) return { ok: false, error: "Données invalides." };
  if (price.value <= 0) return { ok: false, error: "Le prix doit être supérieur à 0." };

  const sb = await createServerSupabase();
  const payload = { name: name.value, image_url: image.value, price_jpy: price.value, fee_jpy: fee.value };

  if (input.id) {
    const id = parseId(input.id);
    if (!id.ok) return id;
    const { error } = await sb.from("shop_items").update(payload).eq("id", id.value);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { data: last } = await sb.from("shop_items").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("shop_items").insert({ ...payload, available: true, sort_order: ((last?.sort_order as number | undefined) ?? -1) + 1 });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function setShopAvailable(id: string, available: boolean): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { error } = await sb.from("shop_items").update({ available: !!available }).eq("id", pid.value);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Échange la position de l'article avec son voisin (dir = -1 vers le haut, 1 vers le bas). */
export async function moveShopItem(id: string, dir: -1 | 1): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { data } = await sb.from("shop_items").select("id, sort_order").order("sort_order").order("created_at");
  const rows = data ?? [];
  const i = rows.findIndex((r) => r.id === pid.value);
  const other = rows[i + dir];
  if (i < 0 || !other) return { ok: true };
  // Si deux articles ont la même position, on les renumérote d'abord pour que l'échange ait un effet.
  const a = rows[i].sort_order === other.sort_order ? i : (rows[i].sort_order as number);
  const b = rows[i].sort_order === other.sort_order ? i + dir : (other.sort_order as number);
  const r1 = await sb.from("shop_items").update({ sort_order: b }).eq("id", rows[i].id);
  const r2 = await sb.from("shop_items").update({ sort_order: a }).eq("id", other.id);
  const err = r1.error ?? r2.error;
  return err ? { ok: false, error: err.message } : { ok: true };
}

export async function saveSale(id: string, buyer: string, shipBy: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  const name = parseText(buyer, "L'acheteur", 200);
  const date = parseDateOrEmpty(shipBy, "La date d'envoi");
  if (!pid.ok) return pid;
  if (!name.ok) return name;
  if (!date.ok) return date;
  const sb = await createServerSupabase();
  const { error } = await sb.from("shop_items").update({ buyer_name: name.value || null, ship_by: date.value }).eq("id", pid.value);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteShopItem(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  const pid = parseId(id);
  if (!pid.ok) return pid;
  const sb = await createServerSupabase();
  const { data: item } = await sb.from("shop_items").select("image_url").eq("id", pid.value).maybeSingle();
  const { error } = await sb.from("shop_items").delete().eq("id", pid.value);
  if (error) return { ok: false, error: error.message };
  const path = item?.image_url ? storagePathFromPublicUrl(item.image_url as string, "gallery") : null;
  if (path) await sb.storage.from("gallery").remove([path]); // la photo ne sert plus
  return { ok: true };
}
