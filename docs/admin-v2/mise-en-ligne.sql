-- ════════════════════════════════════════════════════════════════════════
-- MISE EN LIGNE DE L'ADMIN-V2 — à coller en UNE fois dans Supabase > SQL Editor
-- (production). Fait ceci, dans l'ordre :
--   1. fondations : comptes admin, entités, journal d'audit      (nouvelles tables)
--   2. choix de la commande d'un paiement                         (2 colonnes OPTIONNELLES
--      ajoutées à payment_links ; aucun lien existant n'est modifié)
--   3. ton compte principal comme administrateur
-- Aucune donnée existante n'est modifiée ni supprimée. Rejouable sans risque.
-- Retour arrière : supabase/rollback/*.down.sql
-- Fichier généré à partir de supabase/migrations/ — ne pas le modifier à la main.
-- ════════════════════════════════════════════════════════════════════════

-- ───────── 1/3 — fondations (20261013120000_admin_foundation.sql) ─────────

-- Phase 0 — fondations de l'admin-v2
--
-- Uniquement des AJOUTS : aucune table, colonne, politique ou trigger existant
-- n'est modifié. Idempotent (rejouable sans erreur).
-- Retour arrière : supabase/rollback/20261013120000_admin_foundation.down.sql
--
-- Contenu :
--   1. fonctions d'aide aux rôles (lisent le JWT, jamais user_metadata)
--   2. admin_users      : comptes autorisés (rôle, actif/inactif)
--   3. business_entities: entités fiscales (activité Mayuko / future activité Samuel)
--   4. audit_log        : journal d'audit en ajout seul
--   5. déclencheurs d'audit sur les nouvelles tables

-- ─────────────────────────────────────────────────────────────────────
-- 1. Fonctions d'aide
-- ─────────────────────────────────────────────────────────────────────
-- Le rôle vient de app_metadata (modifiable uniquement côté serveur).
-- user_metadata est modifiable par l'utilisateur lui-même : ne JAMAIS
-- l'utiliser pour une autorisation.

create or replace function public.kz_admin_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function public.kz_is_admin()
returns boolean
language sql
stable
as $$
  select public.kz_admin_role() = 'admin'
$$;

create or replace function public.kz_is_staff_or_admin()
returns boolean
language sql
stable
as $$
  select public.kz_admin_role() in ('admin', 'staff')
$$;

-- Session ayant passé le second facteur (TOTP). Claim "aal" du JWT Supabase.
create or replace function public.kz_is_mfa_verified()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. admin_users
-- ─────────────────────────────────────────────────────────────────────
-- Le rôle FAIT FOI dans le JWT (app_metadata.role). Cette table sert à :
--   - lister les comptes dans les réglages ;
--   - pouvoir désactiver un compte immédiatement (sans attendre l'expiration
--     du JWT) : le serveur refuse l'accès si la ligne est absente, inactive,
--     ou si son rôle diffère de celui du JWT.

create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text not null,
  role         text not null check (role in ('admin', 'staff')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Droits explicites (ne pas dépendre des privilèges par défaut de Supabase).
-- anon : aucun accès. La RLS ci-dessous reste la barrière réelle.
revoke all on public.admin_users from anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (
    public.kz_is_mfa_verified()
    and public.kz_is_staff_or_admin()
    and (public.kz_is_admin() or user_id = auth.uid())
  );

drop policy if exists admin_users_write on public.admin_users;
create policy admin_users_write on public.admin_users
  for all to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

-- Interdit de désactiver / supprimer / rétrograder le dernier admin actif.
create or replace function public.kz_admin_users_keep_one_admin()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE' and old.role = 'admin' and old.is_active)
     or (tg_op = 'UPDATE' and old.role = 'admin' and old.is_active
         and (new.role <> 'admin' or not new.is_active)) then
    if not exists (
      select 1 from public.admin_users
      where role = 'admin' and is_active and user_id <> old.user_id
    ) then
      raise exception 'Impossible : il doit rester au moins un administrateur actif.';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists admin_users_keep_one_admin on public.admin_users;
create trigger admin_users_keep_one_admin
  before update or delete on public.admin_users
  for each row execute function public.kz_admin_users_keep_one_admin();

create or replace function public.kz_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admin_users_touch on public.admin_users;
create trigger admin_users_touch
  before update on public.admin_users
  for each row execute function public.kz_touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 3. business_entities
-- ─────────────────────────────────────────────────────────────────────
-- Entité fiscale qui exploite l'activité sur une période. Les dates de
-- bascule ne sont PAS inventées : elles restent NULL tant qu'elles ne sont
-- pas confirmées. Aucun revenu historique n'est transféré automatiquement.

create table if not exists public.business_entities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  notes       text,
  active_from date,
  active_to   date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (active_from is null or active_to is null or active_from <= active_to)
);

alter table public.business_entities enable row level security;

revoke all on public.business_entities from anon, authenticated;
grant select, insert, update, delete on public.business_entities to authenticated;

drop policy if exists business_entities_select on public.business_entities;
create policy business_entities_select on public.business_entities
  for select to authenticated
  using (public.kz_is_staff_or_admin() and public.kz_is_mfa_verified());

drop policy if exists business_entities_write on public.business_entities;
create policy business_entities_write on public.business_entities
  for all to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

drop trigger if exists business_entities_touch on public.business_entities;
create trigger business_entities_touch
  before update on public.business_entities
  for each row execute function public.kz_touch_updated_at();

-- Les deux entités connues, sans dates (inconnues à ce jour).
insert into public.business_entities (name, notes)
values
  ('Mayuko', 'Activité actuelle (au nom de Mayuko).'),
  ('Samuel', 'Future activité — date de transition non confirmée.')
on conflict (name) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- 4. audit_log (ajout seul)
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  actor_role  text,
  action      text not null,
  table_name  text not null,
  row_id      text,
  old_data    jsonb,
  new_data    jsonb
);

create index if not exists audit_log_occurred_at_idx on public.audit_log (occurred_at desc);
create index if not exists audit_log_table_row_idx on public.audit_log (table_name, row_id);

alter table public.audit_log enable row level security;

-- Lecture réservée aux admins avec MFA. Aucune politique d'écriture : seuls
-- les déclencheurs (security definer) peuvent insérer.
drop policy if exists audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log
  for select to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified());

revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

-- Le journal ne se modifie ni ne se supprime, y compris via la clé service.
create or replace function public.kz_audit_log_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log est en ajout seul (% interdit).', tg_op;
end;
$$;

drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update
  before update or delete on public.audit_log
  for each row execute function public.kz_audit_log_immutable();

drop trigger if exists audit_log_no_truncate on public.audit_log;
create trigger audit_log_no_truncate
  before truncate on public.audit_log
  for each statement execute function public.kz_audit_log_immutable();

-- ─────────────────────────────────────────────────────────────────────
-- 5. Déclencheur d'audit générique
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.kz_audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
begin
  insert into public.audit_log (actor_id, actor_email, actor_role, action, table_name, row_id, old_data, new_data)
  values (
    nullif(claims ->> 'sub', '')::uuid,
    claims ->> 'email',
    claims -> 'app_metadata' ->> 'role',
    tg_op,
    tg_table_name,
    coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id'), (to_jsonb(new) ->> 'user_id'), (to_jsonb(old) ->> 'user_id')),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

revoke all on function public.kz_audit_row_change() from public, anon, authenticated;

drop trigger if exists audit_admin_users on public.admin_users;
create trigger audit_admin_users
  after insert or update or delete on public.admin_users
  for each row execute function public.kz_audit_row_change();

drop trigger if exists audit_business_entities on public.business_entities;
create trigger audit_business_entities
  after insert or update or delete on public.business_entities
  for each row execute function public.kz_audit_row_change();

-- ───────── 2/3 — choix de la commande (20261013180000_payment_link_order_target.sql) ─────────

-- Choisir la commande qui reçoit un paiement, au moment de créer le lien.
--
-- Ajoute deux colonnes OPTIONNELLES à payment_links (aucune donnée existante n'est modifiée,
-- les liens actuels gardent le comportement automatique) :
--   target_order_id : commande précise à laquelle ajouter le paiement (même d'un autre mois)
--   new_order       : forcer la création d'une nouvelle commande
-- Idempotent. Retour arrière : supabase/rollback/20261013180000_payment_link_order_target.down.sql

alter table public.payment_links
  add column if not exists target_order_id bigint references public.orders (id) on delete set null;

alter table public.payment_links
  add column if not exists new_order boolean not null default false;

comment on column public.payment_links.target_order_id is
  'Commande choisie à la création du lien : le paiement y est ajouté (sinon règle automatique).';
comment on column public.payment_links.new_order is
  'true = le paiement crée toujours une nouvelle commande.';

-- ───────── 3/3 — ton compte principal ─────────
-- Remplace l'email si ton compte admin est un autre. Le rôle est lu dans app_metadata (jamais user_metadata).
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 where email = 'kizunaproxy@gmail.com';

insert into public.admin_users (user_id, email, display_name, role)
select id, email, 'Compte principal', 'admin' from auth.users where email = 'kizunaproxy@gmail.com'
on conflict (user_id) do update set role = excluded.role, is_active = true;

-- ───────── Vérification (le résultat attendu s'affiche en bas) ─────────
-- comptes_admin = 1, entites = 2, colonnes_liens = 2
select
  (select count(*) from public.admin_users where is_active) as comptes_admin,
  (select count(*) from public.business_entities)            as entites,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_links'
      and column_name in ('target_order_id', 'new_order'))    as colonnes_liens;
