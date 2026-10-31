-- Registre « À rembourser à Mayuko » (admin-v2).
--
-- Mayuko avance l'argent des achats des clients ; Samuel la rembourse chaque semaine. Le total des achats vient des
-- commandes (calculé dans l'admin) ; cette table enregistre seulement les MOUVEMENTS faits à la main :
--   repayment : remboursement fait à Mayuko (diminue ce qui lui est dû)
--   advance   : avance supplémentaire de Mayuko (livraison, taxes…) (augmente ce qui lui est dû)
-- Aucune donnée existante n'est modifiée. Réservé aux administrateurs avec second facteur (comme business_entities).
-- Idempotent. Retour arrière : supabase/rollback/20261101130000_mayuko_ledger.down.sql

create table if not exists public.mayuko_ledger (
  id          bigint generated always as identity primary key,
  entry_date  date not null default ((now() at time zone 'Asia/Tokyo')::date),
  kind        text not null check (kind in ('repayment', 'advance')),
  amount_jpy  integer not null check (amount_jpy > 0 and amount_jpy <= 100000000),
  note        text check (note is null or char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);

create index if not exists mayuko_ledger_date_idx on public.mayuko_ledger (entry_date desc, id desc);

alter table public.mayuko_ledger enable row level security;

revoke all on public.mayuko_ledger from anon, authenticated;
grant select, insert, delete on public.mayuko_ledger to authenticated;

drop policy if exists mayuko_ledger_select on public.mayuko_ledger;
create policy mayuko_ledger_select on public.mayuko_ledger
  for select to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified());

drop policy if exists mayuko_ledger_insert on public.mayuko_ledger;
create policy mayuko_ledger_insert on public.mayuko_ledger
  for insert to authenticated
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

drop policy if exists mayuko_ledger_delete on public.mayuko_ledger;
create policy mayuko_ledger_delete on public.mayuko_ledger
  for delete to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified());

-- Journal d'audit (déjà en place) : chaque ajout ou suppression est enregistré avec son auteur.
drop trigger if exists audit_mayuko_ledger on public.mayuko_ledger;
create trigger audit_mayuko_ledger
  after insert or update or delete on public.mayuko_ledger
  for each row execute function public.kz_audit_row_change();

comment on table public.mayuko_ledger is
  'Remboursements faits à Mayuko (repayment) et avances supplémentaires de Mayuko (advance). Les achats des commandes sont calculés ailleurs.';
