-- Coupons (remise sur les FRAIS DE SERVICE de Samuel, utilisable une seule fois par client).
--
-- Types prévus : Noël (code commun, 500 ¥), avis Trustpilot (nominatif, 500 ¥), avis Reddit (nominatif, 500 ¥,
-- 750 ¥ si photos). Le client saisit son code sur la page de paiement /pay/<lien> ; le serveur recalcule alors les
-- frais de service et les frais PayPal du lien (jamais depuis le navigateur).
--
-- Ajoute 2 tables (coupons, coupon_redemptions) et 3 colonnes OPTIONNELLES à payment_links ; aucune donnée existante
-- n'est modifiée. Réservé aux administrateurs avec second facteur (comme mayuko_ledger). Le serveur de paiement écrit
-- avec la clé service (qui contourne la RLS).
-- Idempotent. Retour arrière : supabase/rollback/20261102120000_coupons.down.sql

create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique check (code ~ '^[A-Z0-9][A-Z0-9-]{3,31}$'),
  kind            text not null check (kind in ('christmas', 'trustpilot', 'reddit', 'reddit_photo', 'custom')),
  amount_jpy      integer not null check (amount_jpy > 0 and amount_jpy <= 100000),
  -- Coupon nominatif : seul ce client peut l'utiliser. Vide = valable pour tout client (une fois chacun).
  customer_email  text check (customer_email is null or (customer_email = lower(customer_email) and char_length(customer_email) <= 254)),
  expires_at      timestamptz,
  max_total_uses  integer check (max_total_uses is null or max_total_uses > 0),
  active          boolean not null default true,
  note            text check (note is null or char_length(note) <= 300),
  created_at      timestamptz not null default now(),
  created_by      uuid default auth.uid()
);

-- Une ligne par client qui réserve ou utilise un coupon.
--   reserved : le client l'a appliqué sur un lien de paiement pas encore payé
--   used     : le lien a été payé
--   released : annulé (coupon retiré, ou libéré à la main)
create table if not exists public.coupon_redemptions (
  id               bigint generated always as identity primary key,
  coupon_id        uuid not null references public.coupons (id) on delete restrict,
  client_email     text not null check (client_email = lower(client_email)),
  payment_link_id  uuid not null,
  discount_jpy     integer not null check (discount_jpy > 0),
  status           text not null default 'reserved' check (status in ('reserved', 'used', 'released')),
  payer_email      text,
  created_at       timestamptz not null default now(),
  used_at          timestamptz
);

-- Une seule utilisation (ou réservation en cours) par client et par coupon, garantie par la base elle-même.
create unique index if not exists coupon_redemptions_once_per_client
  on public.coupon_redemptions (coupon_id, client_email) where status in ('reserved', 'used');
-- Un lien de paiement ne réserve qu'un coupon à la fois.
create unique index if not exists coupon_redemptions_one_reserved_per_link
  on public.coupon_redemptions (payment_link_id) where status = 'reserved';
create index if not exists coupon_redemptions_link_idx on public.coupon_redemptions (payment_link_id);

-- Colonnes optionnelles du lien de paiement.
alter table public.payment_links
  add column if not exists coupon_code text,
  add column if not exists coupon_discount_jpy integer not null default 0 check (coupon_discount_jpy >= 0),
  add column if not exists fee_before_coupon_jpy integer check (fee_before_coupon_jpy is null or fee_before_coupon_jpy >= 0);

comment on column public.payment_links.coupon_code is 'Coupon appliqué par le client sur la page de paiement (fee_amount_jpy est déjà remisé).';
comment on column public.payment_links.coupon_discount_jpy is 'Remise en yens sur les frais de service. 0 = aucun coupon.';
comment on column public.payment_links.fee_before_coupon_jpy is 'Frais de service avant coupon (pour pouvoir retirer le coupon).';

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

revoke all on public.coupons, public.coupon_redemptions from anon, authenticated;
grant select, insert, update, delete on public.coupons to authenticated;
grant select, update on public.coupon_redemptions to authenticated;

drop policy if exists coupons_all on public.coupons;
create policy coupons_all on public.coupons
  for all to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

drop policy if exists coupon_redemptions_select on public.coupon_redemptions;
create policy coupon_redemptions_select on public.coupon_redemptions
  for select to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified());

drop policy if exists coupon_redemptions_update on public.coupon_redemptions;
create policy coupon_redemptions_update on public.coupon_redemptions
  for update to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

-- Journal d'audit (déjà en place).
drop trigger if exists audit_coupons on public.coupons;
create trigger audit_coupons
  after insert or update or delete on public.coupons
  for each row execute function public.kz_audit_row_change();

drop trigger if exists audit_coupon_redemptions on public.coupon_redemptions;
create trigger audit_coupon_redemptions
  after insert or update or delete on public.coupon_redemptions
  for each row execute function public.kz_audit_row_change();

comment on table public.coupons is 'Coupons de remise sur les frais de service (Noël, avis Trustpilot, avis Reddit…).';
comment on table public.coupon_redemptions is 'Réservations et utilisations des coupons, une par client et par coupon.';
