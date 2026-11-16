-- Achats ponctuels de Kizuna (admin-v2 → Comptabilité) : cartons, scotch, boxes achetées comme stock, matériel…
--
-- Contrairement aux dépenses récurrentes (business_expenses, lissées en moyenne mensuelle), chaque achat est daté
-- et vient en déduction du résultat de SON mois (Comptabilité et tableau de bord).
-- Réservé aux administrateurs avec second facteur. Chaque ajout ou suppression va dans le journal d'audit.
-- Aucune donnée existante n'est modifiée. Idempotent.
-- Retour arrière : supabase/rollback/20261117120000_expense_purchases.down.sql

create table if not exists public.expense_purchases (
  id          bigint generated always as identity primary key,
  spent_on    date not null default ((now() at time zone 'Asia/Tokyo')::date),
  label       text not null check (char_length(label) between 1 and 200),
  category    text not null default 'Autre' check (char_length(category) between 1 and 60),
  amount_jpy  integer not null check (amount_jpy > 0 and amount_jpy <= 100000000),
  notes       text check (notes is null or char_length(notes) <= 300),
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);

create index if not exists expense_purchases_date_idx on public.expense_purchases (spent_on desc, id desc);

alter table public.expense_purchases enable row level security;
revoke all on public.expense_purchases from anon, authenticated;
grant select, insert, update, delete on public.expense_purchases to authenticated;

drop policy if exists expense_purchases_admin_all on public.expense_purchases;
create policy expense_purchases_admin_all on public.expense_purchases
  for all to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

drop trigger if exists audit_expense_purchases on public.expense_purchases;
create trigger audit_expense_purchases
  after insert or update or delete on public.expense_purchases
  for each row execute function public.kz_audit_row_change();

comment on table public.expense_purchases is 'Achats ponctuels datés (cartons, stock, matériel…), déduits du résultat de leur mois. Les dépenses récurrentes sont dans business_expenses.';
