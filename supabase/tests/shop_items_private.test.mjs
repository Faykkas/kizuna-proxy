// Teste la migration « articles vendus privés » de la boutique sur un PostgreSQL en mémoire (PGlite).
// Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundation = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const up = fs.readFileSync(ROOT + '/migrations/20261114140000_shop_items_private_sales.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261114140000_shop_items_private_sales.down.sql', 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };

await db.exec(`
 create role anon nologin; create role authenticated nologin; create role service_role nologin;
 create schema auth;
 create table auth.users (id uuid primary key default gen_random_uuid(), email text);
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),'')::jsonb,'{}'::jsonb) $$;
 create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
 grant usage on schema public, auth to anon, authenticated;
 create table public.orders (id bigint primary key, client_name text, updated_at timestamptz default now());
 grant all on public.orders to authenticated;
`);
await db.exec(foundation);
// État actuel simulé : table lisible par tous, écriture par tout utilisateur connecté (règles créées à la main dans Supabase).
await db.exec(`
 create table public.shop_items (id uuid primary key default gen_random_uuid(), image_url text not null, price_jpy integer not null,
   available boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(),
   name text, fee_jpy integer not null default 6000, buyer_name text, ship_by date);
 alter table public.shop_items enable row level security;
 create policy "Public read" on public.shop_items for select using (true);
 create policy "Auth write" on public.shop_items for all to authenticated using (true) with check (true);
 grant all on public.shop_items to anon, authenticated;
 insert into public.shop_items (image_url, price_jpy, name, available, buyer_name, ship_by) values
   ('a.jpg', 2900, 'En vente', true, null, null), ('b.jpg', 4290, 'Vendu', false, 'Client Secret', '2027-01-01');
`);

const as = async (claims, sql) => {
  await db.exec(`set role ${claims ? 'authenticated' : 'anon'}; select set_config('request.jwt.claims','${JSON.stringify(claims ?? {})}',false);`);
  try { return { rows: (await db.query(sql)).rows }; } catch (e) { return { error: e.message }; } finally { await db.exec('reset role'); }
};
const ADMIN = { sub: '11111111-1111-1111-1111-111111111111', aal: 'aal1', app_metadata: { role: 'admin' } };
const CLIENT = { sub: '33333333-3333-3333-3333-333333333333', aal: 'aal1', app_metadata: {} };

console.log('1. Avant : la fuite existe');
let r = await as(null, `select buyer_name from public.shop_items where buyer_name is not null`);
ok(r.rows?.length === 1, "le public lit le nom de l'acheteur (fuite reproduite)");

console.log('2. Après la migration');
await db.exec(up); await db.exec(up); ok(true, 'migration rejouable');
r = await as(null, `select name from public.shop_items`);
ok(r.rows?.length === 1 && r.rows[0].name === 'En vente', 'le public ne voit que les articles en vente');
r = await as(null, `select buyer_name from public.shop_items where buyer_name is not null`);
ok(r.rows?.length === 0, "le nom de l'acheteur n'est plus lisible par le public");
r = await as(CLIENT, `select name from public.shop_items`);
ok(r.rows?.length === 1, 'un client connecté ne voit que les articles en vente');
r = await as(CLIENT, `update public.shop_items set price_jpy = 1 returning id`);
ok((r.rows?.length ?? 0) === 0, 'un client connecté ne peut plus modifier la boutique');
r = await as(null, `insert into public.shop_items (image_url, price_jpy) values ('x.jpg', 1) returning id`);
ok(!!r.error, 'le public ne peut rien ajouter');
r = await as(ADMIN, `select buyer_name from public.shop_items where buyer_name is not null`);
ok(r.rows?.length === 1, "l'admin voit toujours les ventes et le nom de l'acheteur");
r = await as(ADMIN, `update public.shop_items set buyer_name = 'Autre' where available = false returning id`);
ok(r.rows?.length === 1, "l'admin modifie toujours une vente");
r = await as(ADMIN, `insert into public.shop_items (image_url, price_jpy) values ('n.jpg', 1000) returning id`);
ok(r.rows?.length === 1, "l'admin ajoute toujours un article");
r = await db.query(`select count(*)::int c from pg_policies where tablename='shop_items' and policyname in ('Public read','Auth write')`);
ok(r.rows[0].c === 0, 'les anciennes règles trop ouvertes sont supprimées');

console.log('3. Retour arrière');
await db.exec(down); await db.exec(down);
r = await as(null, `select count(*)::int c from public.shop_items`);
ok(r.rows?.[0]?.c === 3, 'retour arrière (rejouable) : lecture publique rétablie');
await db.exec(up); ok(true, 'migration réapplicable après retour arrière');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
