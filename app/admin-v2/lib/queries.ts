import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEarnedStatus } from "./commissions";
import { isCommissionPackage } from "../../lib/commissionPackage.ts";
import type { LinkLite, OrderLiteForLinks } from "./shipping";

// COUCHE DE LECTURE SEULE. Aucune fonction de ce fichier n'écrit en base :
// seulement .select(). La phase 0 conserve les données actuelles intactes.
// Les écritures financières (phase 1+) vivront ailleurs, avec des
// opérations transactionnelles et idempotentes.

type Sb = SupabaseClient;

const PAGE = 1000; // PostgREST limite les réponses ; on pagine pour tout lire.

export async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

// ── Dashboard ───────────────────────────────────────────────────────────

export type OrderForStats = {
  id: number;
  client_name: string | null;
  status: string | null;
  purchase_date: string | null;
  service_fee_jpy: number | null;
  item_price_jpy: number | null;
  shipping_cost_jpy: number | null;
  shipping_paid: boolean | null;
};

export function loadOrdersForStats(sb: Sb) {
  return fetchAll<OrderForStats>((from, to) =>
    sb
      .from("orders")
      .select("id,client_name,status,purchase_date,service_fee_jpy,item_price_jpy,shipping_cost_jpy,shipping_paid")
      .order("id")
      .range(from, to),
  );
}

export type PaidLink = { paid_at: string | null; paypal_fee_jpy: number | null; paypal_real_fee_jpy: number | null };

export function loadPaidLinks(sb: Sb) {
  return fetchAll<PaidLink>((from, to) =>
    sb
      .from("payment_links")
      .select("paid_at,paypal_fee_jpy,paypal_real_fee_jpy")
      .eq("status", "paid")
      .gt("paypal_fee_jpy", 0)
      .order("paid_at")
      .range(from, to),
  );
}

// ── Commandes ───────────────────────────────────────────────────────────

export type OrderRow = {
  id: number;
  public_ref: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  purchase_date: string | null;
  items: string | null;
  platform: string | null;
  item_price_jpy: number | null;
  service_fee_jpy: number | null;
  shipping_cost_jpy: number | null;
  shipping_paid: boolean | null;
  tracking_number: string | null;
  shipping_method: string | null;
};

export const ORDERS_PAGE_SIZE = 25;

// Les caractères spéciaux de la syntaxe de filtre PostgREST sont retirés de la
// recherche libre pour qu'elle ne puisse pas altérer le filtre.
function safeSearch(raw: string): string {
  return raw.replace(/[,()%*\\"'`;:<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

// « Commission package » : gains hebdomadaires sur les colis, enregistrés comme des lignes de commande
// mais qui ne sont pas des commandes de clients (voir app/lib/commissionPackage.ts).
const PACKAGE_NAME_PATTERN = "com%ion pack%";

export type OrderKind = "orders" | "packages" | "all";

export async function listOrders(sb: Sb, opts: { q?: string; status?: string; kind?: OrderKind; page: number }) {
  const from = (opts.page - 1) * ORDERS_PAGE_SIZE;
  let query = sb
    .from("orders")
    .select(
      "id,public_ref,client_name,client_email,status,purchase_date,items,platform,item_price_jpy,service_fee_jpy,shipping_cost_jpy,shipping_paid,tracking_number,shipping_method",
      { count: "exact" },
    )
    .order("purchase_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(from, from + ORDERS_PAGE_SIZE - 1);

  if (opts.status) query = query.eq("status", opts.status);
  const kind = opts.kind ?? "orders";
  if (kind === "orders") query = query.not("client_name", "ilike", PACKAGE_NAME_PATTERN);
  if (kind === "packages") query = query.ilike("client_name", PACKAGE_NAME_PATTERN);

  const q = safeSearch(opts.q ?? "");
  if (q) {
    const like = `%${q}%`;
    const parts = [`client_name.ilike.${like}`, `client_email.ilike.${like}`, `public_ref.ilike.${like}`, `items.ilike.${like}`];
    if (/^\d{1,9}$/.test(q)) parts.push(`id.eq.${q}`);
    query = query.or(parts.join(","));
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as OrderRow[], total: count ?? 0 };
}

export type OrderFull = OrderRow & {
  client_phone: string | null;
  customer_id: string | null;
  delivery_country: string | null;
  shipping_address: string | null;
  communication: string | null;
  payment_received: boolean | null;
  payment_method: string | null;
  event_name: string | null;
  event_date: string | null;
  event_status: string | null;
  event_result: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getOrder(sb: Sb, id: number) {
  const [{ data, error }, { data: events, error: e2 }] = await Promise.all([
    sb.from("orders").select("*").eq("id", id).maybeSingle(),
    sb.from("order_events").select("id,status,note,created_at").eq("order_id", id).order("created_at", { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  if (!data) return null;
  if (e2) throw new Error(e2.message);
  return { order: data as OrderFull, events: (events ?? []) as { id: string; status: string; note: string | null; created_at: string }[] };
}

// ── Clients ─────────────────────────────────────────────────────────────

export type CustomerRow = {
  key: string;
  name: string;
  email: string;
  hasAccount: boolean;
  orderCount: number;
  earnedOrderCount: number;
  commissionsJpy: number;
  lastOrderDate: string | null;
};

// Les commandes ne pointent pas vers une table de clients : une personne est
// identifiée par son email (ou son nom à défaut) — même règle que l'ancienne
// admin. « Multi » est un nom générique utilisé pour plusieurs personnes.
const GENERIC_NAMES = new Set(["multi"]);

function customerKey(o: { id: number; client_email: string | null; client_name: string | null }) {
  const email = (o.client_email || "").trim().toLowerCase();
  if (email) return `e:${email}`;
  const name = (o.client_name || "").trim().toLowerCase();
  if (!name || GENERIC_NAMES.has(name)) return `o:${o.id}`;
  return `n:${name}`;
}

export async function listCustomers(sb: Sb): Promise<CustomerRow[]> {
  const orders = await fetchAll<{
    id: number;
    client_name: string | null;
    client_email: string | null;
    customer_id: string | null;
    status: string | null;
    purchase_date: string | null;
    service_fee_jpy: number | null;
  }>((from, to) =>
    sb
      .from("orders")
      .select("id,client_name,client_email,customer_id,status,purchase_date,service_fee_jpy")
      .order("id")
      .range(from, to),
  );

  const map = new Map<string, CustomerRow>();
  for (const o of orders) {
    if (isCommissionPackage(o)) continue; // une commission colis n'est pas un client
    const key = customerKey(o);
    let c = map.get(key);
    if (!c) {
      c = { key, name: "", email: "", hasAccount: false, orderCount: 0, earnedOrderCount: 0, commissionsJpy: 0, lastOrderDate: null };
      map.set(key, c);
    }
    c.orderCount += 1;
    if (o.client_name && !c.name) c.name = o.client_name;
    if (o.client_email && !c.email) c.email = o.client_email;
    if (o.customer_id) c.hasAccount = true;
    if (o.purchase_date && (!c.lastOrderDate || o.purchase_date > c.lastOrderDate)) c.lastOrderDate = o.purchase_date;
    if (isEarnedStatus(o.status)) {
      c.earnedOrderCount += 1;
      c.commissionsJpy += o.service_fee_jpy ?? 0;
    }
  }
  return [...map.values()].sort((a, b) => b.commissionsJpy - a.commissionsJpy);
}

// ── Réglages ────────────────────────────────────────────────────────────

export type RosterRow = { user_id: string; email: string; display_name: string; role: string; is_active: boolean };
export type EntityRow = { id: string; name: string; notes: string | null; active_from: string | null; active_to: string | null };

const TABLE_MISSING = new Set(["42P01", "PGRST205"]);

export async function loadRoster(sb: Sb): Promise<{ available: boolean; rows: RosterRow[] }> {
  const { data, error } = await sb.from("admin_users").select("user_id,email,display_name,role,is_active").order("created_at");
  if (error) {
    if (TABLE_MISSING.has(error.code)) return { available: false, rows: [] };
    throw new Error(error.message);
  }
  return { available: true, rows: (data ?? []) as RosterRow[] };
}

export async function loadEntities(sb: Sb): Promise<{ available: boolean; rows: EntityRow[] }> {
  const { data, error } = await sb.from("business_entities").select("id,name,notes,active_from,active_to").order("name");
  if (error) {
    if (TABLE_MISSING.has(error.code)) return { available: false, rows: [] };
    throw new Error(error.message);
  }
  return { available: true, rows: (data ?? []) as EntityRow[] };
}

// ── Liens de paiement ───────────────────────────────────────────────────
// Le « jeton » d'un lien de paiement (/pay/<jeton>) est l'identifiant de la
// ligne et sert de seul identifiant d'accès pour le client : on ne l'affiche
// donc jamais ici.

export type PaymentLinkRow = {
  id: string;
  label: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  created_at: string | null;
  paid_at: string | null;
  amount_jpy: number | null;
  item_amount_jpy: number | null;
  fee_amount_jpy: number | null;
  paypal_fee_jpy: number | null;
  paypal_real_fee_jpy: number | null;
  is_shipping: boolean | null;
};

export function loadPaymentLinks(sb: Sb) {
  return fetchAll<PaymentLinkRow>((from, to) =>
    sb
      .from("payment_links")
      .select("id,label,client_name,client_email,status,created_at,paid_at,amount_jpy,item_amount_jpy,fee_amount_jpy,paypal_fee_jpy,paypal_real_fee_jpy,is_shipping")
      .order("created_at", { ascending: false })
      .range(from, to),
  );
}

export async function countPendingLinks(sb: Sb): Promise<number> {
  const { count, error } = await sb.from("payment_links").select("id", { count: "exact", head: true }).eq("status", "pending");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ── Boutique ────────────────────────────────────────────────────────────

export type ShopItemRow = {
  id: string;
  name: string | null;
  image_url: string | null;
  price_jpy: number | null;
  fee_jpy: number | null;
  available: boolean | null;
  sort_order: number | null;
  buyer_name: string | null;
  ship_by: string | null;
  created_at: string | null;
};

export async function loadShopItems(sb: Sb): Promise<ShopItemRow[]> {
  const { data, error } = await sb
    .from("shop_items")
    .select("id,name,image_url,price_jpy,fee_jpy,available,sort_order,buyer_name,ship_by,created_at")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ShopItemRow[];
}

// ── Paiements d'un client (pour retrouver la livraison payée par commande) ──

export async function loadClientPayments(sb: Sb, email: string): Promise<{ links: LinkLite[]; orders: OrderLiteForLinks[] }> {
  // Échappe % _ \ pour que l'email soit comparé tel quel (insensible à la casse).
  const pattern = email.trim().replace(/[\\%_]/g, (m) => "\\" + m);
  const [links, orders] = await Promise.all([
    sb
      .from("payment_links")
      .select("id,label,client_email,paid_at,amount_jpy,item_amount_jpy,fee_amount_jpy,paypal_fee_jpy,is_shipping,items_breakdown")
      .eq("status", "paid")
      .ilike("client_email", pattern)
      .order("paid_at"),
    sb.from("orders").select("id,client_email,created_at,purchase_date").ilike("client_email", pattern),
  ]);
  if (links.error) throw new Error(links.error.message);
  if (orders.error) throw new Error(orders.error.message);
  return { links: (links.data ?? []) as LinkLite[], orders: (orders.data ?? []) as OrderLiteForLinks[] };
}

/** Résumé des « commission package » (nombre et total des gains), pour le lien de la page Commandes. */
export async function summarizePackages(sb: Sb): Promise<{ count: number; totalJpy: number }> {
  const { data, error } = await sb.from("orders").select("client_name,service_fee_jpy").ilike("client_name", PACKAGE_NAME_PATTERN);
  if (error) throw new Error(error.message);
  const rows = (data ?? []).filter((o) => isCommissionPackage(o));
  return { count: rows.length, totalJpy: rows.reduce((s, o) => s + (o.service_fee_jpy ?? 0), 0) };
}
