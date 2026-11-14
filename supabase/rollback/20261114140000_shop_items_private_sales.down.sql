-- Retour arrière de 20261114140000_shop_items_private_sales.sql.
-- Remet une lecture publique de toute la table (y compris les articles vendus et le nom de l'acheteur : la fuite revient)
-- et l'écriture pour les administrateurs. À n'utiliser qu'en cas de problème.

drop policy if exists shop_items_read on public.shop_items;
drop policy if exists shop_items_admin_insert on public.shop_items;
drop policy if exists shop_items_admin_update on public.shop_items;
drop policy if exists shop_items_admin_delete on public.shop_items;
drop policy if exists shop_items_public_read_all on public.shop_items;
drop policy if exists shop_items_admin_write on public.shop_items;

create policy shop_items_public_read_all on public.shop_items for select to anon, authenticated using (true);
create policy shop_items_admin_write on public.shop_items for all to authenticated using (public.kz_is_admin()) with check (public.kz_is_admin());
