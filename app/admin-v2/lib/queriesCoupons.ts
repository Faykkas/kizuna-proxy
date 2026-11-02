import type { SupabaseClient } from "@supabase/supabase-js";
import type { CouponRow } from "../../lib/coupons.ts";

export type Redemption = {
  id: number;
  coupon_id: string;
  client_email: string;
  payment_link_id: string;
  discount_jpy: number;
  status: "reserved" | "used" | "released";
  payer_email: string | null;
  created_at: string;
  used_at: string | null;
};

export type CouponAdmin = CouponRow & { note: string | null; created_at: string; redemptions: Redemption[] };

const MISSING = new Set(["42P01", "PGRST205"]);

/** Coupons et leurs utilisations. `available: false` tant que le SQL 20261102120000_coupons.sql n'est pas appliqué. */
export async function loadCouponsSafe(sb: SupabaseClient): Promise<{ available: boolean; coupons: CouponAdmin[] }> {
  const { data: coupons, error } = await sb
    .from("coupons")
    .select("id,code,kind,amount_jpy,customer_email,expires_at,max_total_uses,active,note,created_at")
    .order("created_at", { ascending: false });
  if (error) {
    if (MISSING.has(error.code ?? "") || /coupons/.test(error.message)) return { available: false, coupons: [] };
    throw new Error(error.message);
  }
  const { data: reds, error: err2 } = await sb
    .from("coupon_redemptions")
    .select("id,coupon_id,client_email,payment_link_id,discount_jpy,status,payer_email,created_at,used_at")
    .order("created_at", { ascending: false });
  if (err2) throw new Error(err2.message);
  const byCoupon = new Map<string, Redemption[]>();
  for (const r of (reds ?? []) as Redemption[]) {
    const arr = byCoupon.get(r.coupon_id) ?? [];
    arr.push(r);
    byCoupon.set(r.coupon_id, arr);
  }
  return {
    available: true,
    coupons: ((coupons ?? []) as Omit<CouponAdmin, "redemptions">[]).map((c) => ({ ...c, redemptions: byCoupon.get(c.id) ?? [] })),
  };
}
