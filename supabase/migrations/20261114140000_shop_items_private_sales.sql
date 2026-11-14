-- Boutique : les articles VENDUS (available = false) ne sont plus lisibles par le public.
--
-- Problème corrigé : la table shop_items était lisible en entier avec la clé publique du site, y compris
-- buyer_name (nom du client qui a acheté l'article) et ship_by. N'importe qui pouvait les lire via l'API.
--
-- Après cette migration :
--   - visiteurs et clients connectés : lecture des articles EN VENTE uniquement (ce qu'affiche /shop) ;
--   - administrateurs (rôle admin) : lecture et écriture de tout, comme avant (ancien /admin et admin-v2).
-- Les anciennes règles de la table sont remplacées (elles sont listées dans les NOTICE à l'exécution).
-- Aucune donnée n'est modifiée. Idempotent.
-- Retour arrière : supabase/rollback/20261114140000_shop_items_private_sales.down.sql

alter table public.shop_items enable row level security;

do $$
declare p record;
begin
  for p in select policyname, cmd, roles::text as roles from pg_policies where schemaname = 'public' and tablename = 'shop_items' loop
    raise notice 'règle remplacée : % (% pour %)', p.policyname, p.cmd, p.roles;
    execute format('drop policy %I on public.shop_items', p.policyname);
  end loop;
end $$;

grant select on public.shop_items to anon, authenticated;
grant insert, update, delete on public.shop_items to authenticated;

create policy shop_items_read on public.shop_items
  for select to anon, authenticated
  using (available or public.kz_is_admin());

create policy shop_items_admin_insert on public.shop_items
  for insert to authenticated
  with check (public.kz_is_admin());

create policy shop_items_admin_update on public.shop_items
  for update to authenticated
  using (public.kz_is_admin())
  with check (public.kz_is_admin());

create policy shop_items_admin_delete on public.shop_items
  for delete to authenticated
  using (public.kz_is_admin());
