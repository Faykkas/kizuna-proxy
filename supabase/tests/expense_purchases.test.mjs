// Teste la migration des achats ponctuels (Comptabilité) sur un PostgreSQL en mémoire (PGlite).
// Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundation = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const up = fs.readFileSync(ROOT + '/migrations/20261117120000_expense_purchases.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261117120000_expense_purchases.down.sql', 'utf8');
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
const exists = async () => (await db.query(`select count(*)::int c from pg_tables where schemaname='public' and tablename='expense_purchases'`)).rows[0].c;
const uAdmin = '11111111-1111-1111-1111-111111111111', uStaff = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users(id,email) values ('${uAdmin}','a@x'),('${uStaff}','s@x')`);
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin}','a@x','Admin A','admin'),('${uStaff}','s@x','Staff S','staff')`);
const as = async (claims, sql) => {
  await db.exec(`set role ${claims ? 'authenticated' : 'anon'}; select set_config('request.jwt.claims','${JSON.stringify(claims ?? {})}',false);`);
  try { return { rows: (await db.query(sql)).rows }; } catch (e) { return { error: e.message }; } finally { await db.exec('reset role'); }
};
const ADMIN2 = { sub: uAdmin, aal: 'aal2', app_metadata: { role: 'admin' } };
const ADMIN1 = { sub: uAdmin, aal: 'aal1', app_metadata: { role: 'admin' } };
const STAFF = { sub: uStaff, aal: 'aal2', app_metadata: { role: 'staff' } };

console.log('1. Application et rejeu');
await db.exec(up); ok((await exists()) === 1, 'table créée');
await db.exec(up); ok((await exists()) === 1, 'migration rejouable');

console.log('2. Droits');
let r = await as(ADMIN2, `insert into public.expense_purchases (spent_on, label, category, amount_jpy) values ('2026-11-12', 'Cartons x20', 'Emballage / Cartons', 3200), ('2026-10-30', 'Booster boxes', 'Stock', 28000) returning id, created_by`);
ok(r.rows?.length === 2 && r.rows[0].created_by === uAdmin, 'admin + 2FA ajoute des achats (auteur enregistré)');
r = await as(ADMIN2, `select coalesce(sum(amount_jpy),0)::int s from public.expense_purchases where spent_on >= '2026-11-01' and spent_on < '2026-12-01'`);
ok(r.rows?.[0]?.s === 3200, 'total du mois de novembre');
r = await as(ADMIN1, `select count(*)::int c from public.expense_purchases`);
ok(r.rows?.[0]?.c === 0, 'admin SANS 2FA ne voit rien');
r = await as(STAFF, `select count(*)::int c from public.expense_purchases`);
ok(r.rows?.[0]?.c === 0, 'staff ne voit rien');
r = await as(null, `select count(*)::int c from public.expense_purchases`);
ok(!!r.error, 'le public ne peut pas lire la table');
r = await as(STAFF, `insert into public.expense_purchases (label, amount_jpy) values ('x', 1) returning id`);
ok(!!r.error, 'staff ne peut rien ajouter');

console.log('3. Contraintes');
r = await as(ADMIN2, `insert into public.expense_purchases (label, amount_jpy) values ('Gratuit', 0) returning id`);
ok(!!r.error, 'montant à 0 refusé');
r = await as(ADMIN2, `insert into public.expense_purchases (label, amount_jpy) values ('', 100) returning id`);
ok(!!r.error, 'libellé vide refusé');
r = await as(ADMIN2, `select count(*)::int c from public.audit_log where table_name='expense_purchases'`);
ok(r.rows?.[0]?.c >= 2, "les ajouts sont dans le journal d'audit");

console.log('4. Retour arrière');
await db.exec(down); ok((await exists()) === 0, 'table supprimée');
await db.exec(down); ok(true, 'retour arrière rejouable');
await db.exec(up); ok((await exists()) === 1, 'migration réapplicable');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
