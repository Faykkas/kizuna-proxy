-- Retour arrière de 20261102120000_coupons.sql.
-- Supprime les coupons et leur historique d'utilisation, et les 3 colonnes de coupon des liens de paiement
-- (les montants déjà remisés dans fee_amount_jpy / amount_jpy restent tels quels ; les commandes ne sont pas touchées ;
-- le journal d'audit garde la trace).

drop trigger if exists audit_coupon_redemptions on public.coupon_redemptions;
drop trigger if exists audit_coupons on public.coupons;
drop table if exists public.coupon_redemptions;
drop table if exists public.coupons;

alter table public.payment_links
  drop column if exists fee_before_coupon_jpy,
  drop column if exists coupon_discount_jpy,
  drop column if exists coupon_code;
