"use server";

import { Resend } from "resend";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { parseText, parseYen } from "../../lib/contentFields";
import {
  COUPON_KINDS,
  MAX_COUPON_YEN,
  couponMessage,
  endOfDayTokyo,
  generateCode,
  isValidCode,
  isValidEmail,
  normalizeCode,
  normalizeEmail,
  type CouponKind,
} from "../../../lib/coupons";

// Coupons : remise sur les frais de service de Samuel, une seule utilisation par client.
// Réservé aux administrateurs (la RLS de Supabase le vérifie aussi) ; chaque changement est dans le journal d'audit.
// Le client saisit son code sur la page de paiement : voir app/api/payment-link/route.ts.

export type Result = { ok: true } | { ok: false; error: string };
export type CouponInput = { kind: string; code: string; amount: string; email: string; expires: string; maxUses: string; note: string };

const TABLE_HINT = "Les coupons ne sont pas encore activés dans Supabase : exécutez d'abord le SQL 20261102120000_coupons.sql.";
const isMissing = (m: string) => /coupons|coupon_redemptions/.test(m) && /exist|schema cache/i.test(m);

export async function createCoupon(input: CouponInput): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!(input.kind in COUPON_KINDS)) return { ok: false, error: "Type de coupon inconnu." };
  const kind = input.kind as CouponKind;
  const spec = COUPON_KINDS[kind];

  const amount = parseYen(input.amount, "Le montant");
  if (!amount.ok) return amount;
  if (amount.value <= 0) return { ok: false, error: "Le montant doit être supérieur à 0." };
  if (amount.value > MAX_COUPON_YEN) return { ok: false, error: "Le montant est trop grand." };

  const email = normalizeEmail(input.email);
  if (spec.personal && !email) return { ok: false, error: "Ce type de coupon est nominatif : indiquez l'email du client." };
  if (email && !isValidEmail(email)) return { ok: false, error: "Adresse email invalide." };

  // Coupon nominatif sans code saisi : code aléatoire. Coupon commun : le code est choisi par vous (ex. NOEL500).
  let code = normalizeCode(input.code);
  if (!code && spec.personal) code = generateCode();
  if (!isValidCode(code)) return { ok: false, error: "Le code doit faire 4 à 32 caractères : lettres, chiffres ou tiret." };

  let expiresAt: string | null = null;
  if ((input.expires ?? "").trim() !== "") {
    expiresAt = endOfDayTokyo(input.expires.trim());
    if (!expiresAt) return { ok: false, error: "Date limite invalide." };
  }

  let maxUses: number | null = null;
  if ((input.maxUses ?? "").trim() !== "") {
    const n = parseYen(input.maxUses, "Le nombre d'utilisations");
    if (!n.ok) return n;
    if (n.value < 1) return { ok: false, error: "Le nombre d'utilisations doit être d'au moins 1." };
    maxUses = n.value;
  }

  const note = parseText(input.note, "La note", 300);
  if (!note.ok) return note;

  const sb = await createServerSupabase();
  const { error } = await sb.from("coupons").insert({
    code,
    kind,
    amount_jpy: amount.value,
    customer_email: email || null,
    expires_at: expiresAt,
    max_total_uses: maxUses,
    note: note.value || null,
  });
  if (error) {
    if (isMissing(error.message)) return { ok: false, error: TABLE_HINT };
    if (/duplicate|unique/i.test(error.message)) return { ok: false, error: "Ce code existe déjà : choisissez-en un autre." };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setCouponActive(id: string, active: boolean): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!/^[0-9a-f-]{36}$/i.test(id ?? "")) return { ok: false, error: "Coupon invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("coupons").update({ active }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteCoupon(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!/^[0-9a-f-]{36}$/i.test(id ?? "")) return { ok: false, error: "Coupon invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("coupons").delete().eq("id", id);
  if (error) {
    // La base refuse (clé étrangère) quand le coupon a déjà un historique d'utilisation : on le désactive plutôt.
    if (/foreign key|violates/i.test(error.message)) return { ok: false, error: "Ce coupon a déjà été utilisé ou réservé : désactivez-le au lieu de le supprimer." };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Libère une réservation restée en attente (lien jamais payé) : le client pourra de nouveau utiliser son coupon. */
export async function releaseRedemption(id: number): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Utilisation invalide." };
  const sb = await createServerSupabase();
  const { error } = await sb.from("coupon_redemptions").update({ status: "released" }).eq("id", id).eq("status", "reserved");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Envoie le coupon au client par e-mail (Resend). Demande COUPON_FROM_EMAIL : une adresse d'un domaine VÉRIFIÉ chez
 * Resend (l'adresse de test onboarding@resend.dev ne peut écrire qu'au propriétaire du compte). Sans cela, utiliser
 * « Ouvrir dans ma messagerie ».
 */
export async function sendCouponEmail(id: string): Promise<Result> {
  await requireAccess({ adminOnly: true });
  if (!/^[0-9a-f-]{36}$/i.test(id ?? "")) return { ok: false, error: "Coupon invalide." };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.COUPON_FROM_EMAIL;
  if (!key || !from) {
    return { ok: false, error: "L'envoi automatique n'est pas configuré (domaine d'envoi à vérifier chez Resend) : utilisez « Ouvrir dans ma messagerie »." };
  }
  const sb = await createServerSupabase();
  const { data: c } = await sb.from("coupons").select("code,kind,amount_jpy,customer_email,expires_at,active").eq("id", id).maybeSingle();
  if (!c) return { ok: false, error: "Coupon introuvable." };
  if (!c.customer_email) return { ok: false, error: "Ce coupon n'a pas d'email client : il est valable pour tous, envoyez-le vous-même." };
  if (!c.active) return { ok: false, error: "Ce coupon est désactivé." };
  const m = couponMessage(c);
  try {
    const { error } = await new Resend(key).emails.send({
      from,
      to: c.customer_email,
      replyTo: process.env.NOTIFY_EMAIL || "kizunaproxy@gmail.com",
      subject: m.subject,
      text: m.body,
    });
    if (error) {
      console.error("Resend coupon email failed:", error);
      return { ok: false, error: "L'envoi a échoué : vérifiez le domaine d'envoi chez Resend, ou utilisez « Ouvrir dans ma messagerie »." };
    }
  } catch (e) {
    console.error("Resend coupon email error:", e);
    return { ok: false, error: "L'envoi a échoué : vérifiez le domaine d'envoi chez Resend, ou utilisez « Ouvrir dans ma messagerie »." };
  }
  return { ok: true };
}
