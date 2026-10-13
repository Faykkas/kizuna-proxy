// Teste la migration de la phase 0 sur un PostgreSQL en mémoire (PGlite) : application,
// rejeu, droits RLS (dont MFA), journal en ajout seul, retour arrière, ré-application.
// Lancer : npm run test:sql
// Les fonctions auth.jwt()/auth.uid() de Supabase sont simulées ; ce test ne remplace pas
// un essai sur le projet de staging, il évite d y découvrir des erreurs de base.
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const up = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261013120000_admin_foundation.down.sql', 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const throws = async (sql, m) => {
  try { await db.exec(sql); ok(false, m + ' (aucune erreur levée)'); }
  catch (e) { ok(true, m + ' -> ' + e.message.split('\n')[0].slice(0, 70)); }
};

// Environnement Supabase simulé
await db.exec(`
 create role anon nologin; create role authenticated nologin; create role service_role nologin;
 create schema auth;
 create table auth.users (id uuid primary key default gen_random_uuid(), email text);
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),'')::jsonb,'{}'::jsonb) $$;
 create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
 grant usage on schema public, auth to anon, authenticated;
 create table public.orders (id bigint primary key, client_name text, updated_at timestamptz default now());
 create function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
 create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
 insert into public.orders values (1,'Test');
 grant all on public.orders to authenticated;
`);
const snap = async () =>
  JSON.stringify((await db.query(`select table_name, column_name, data_type from information_schema.columns where table_name='orders' order by 1,2`)).rows) +
  JSON.stringify((await db.query(`select tgname from pg_trigger where tgrelid='public.orders'::regclass and not tgisinternal`)).rows) +
  JSON.stringify((await db.query(`select * from public.orders`)).rows.map(r => [r.id, r.client_name]));
const before = await snap();
const objs = async () => (await db.query(
  `select (select count(*) from pg_tables where schemaname='public' and tablename in ('admin_users','business_entities','audit_log'))::int t,
          (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'kz\\_%')::int f`)).rows[0];

console.log('1. Application de la migration');
await db.exec(up);
let o = await objs(); ok(o.t === 3 && o.f === 8, `3 tables + 8 fonctions creees (${o.t}/${o.f})`);
ok((await db.query('select count(*)::int c from public.business_entities')).rows[0].c === 2, '2 entites (Mayuko, Samuel)');
ok((await db.query('select count(*)::int c from public.business_entities where active_from is not null or active_to is not null')).rows[0].c === 0, 'aucune date de bascule inventee');

console.log('2. Idempotence (rejouer la migration)');
await db.exec(up);
ok((await db.query('select count(*)::int c from public.business_entities')).rows[0].c === 2, 'toujours 2 entites apres rejeu');

console.log('3. Comportement des droits (RLS)');
const uAdmin = '11111111-1111-1111-1111-111111111111', uStaff = '22222222-2222-2222-2222-222222222222', uAdmin2 = '33333333-3333-3333-3333-333333333333';
await db.exec(`insert into auth.users(id,email) values ('${uAdmin}','a@x'),('${uStaff}','s@x'),('${uAdmin2}','b@x')`);
const as = async (sub, role, aal, sql) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub, email: 'x@x', aal, app_metadata: { role } })}',false);`);
  try { return await db.query(sql); } finally { await db.exec('reset role'); }
};
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin}','a@x','Admin A','admin'),('${uStaff}','s@x','Staff S','staff')`);
let r = await as(uAdmin, 'admin', 'aal2', 'select count(*)::int c from public.admin_users'); ok(r.rows[0].c === 2, 'admin+MFA voit les 2 comptes');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.admin_users'); ok(r.rows[0].c === 1, 'staff+MFA ne voit que son propre compte');
r = await as(uAdmin, 'admin', 'aal1', 'select count(*)::int c from public.admin_users'); ok(r.rows[0].c === 0, 'admin SANS MFA ne voit rien');
r = await as(uAdmin, 'admin', 'aal1', 'select count(*)::int c from public.business_entities'); ok(r.rows[0].c === 0, 'admin SANS MFA ne voit pas les entites');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.business_entities'); ok(r.rows[0].c === 2, 'staff+MFA lit les entites');
r = await as(uStaff, 'staff', 'aal2', `update public.business_entities set notes='x' returning 1`); ok(r.rows.length === 0, 'staff ne peut pas modifier les entites');
r = await as(uAdmin, 'admin', 'aal2', `update public.business_entities set notes='MAJ' where name='Samuel' returning 1`); ok(r.rows.length === 1, 'admin+MFA modifie une entite');
r = await as(uAdmin, 'admin', 'aal2', 'select count(*)::int c from public.audit_log'); ok(r.rows[0].c >= 1, 'la modification est dans le journal d audit (' + r.rows[0].c + ')');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.audit_log'); ok(r.rows[0].c === 0, 'staff ne lit pas le journal d audit');
r = await as(uAdmin, 'user', 'aal2', 'select count(*)::int c from public.admin_users'); ok(r.rows[0].c === 0, 'role "user" refuse');
await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub: uStaff, aal: 'aal2', user_metadata: { role: 'admin' } })}',false)`);
r = await db.query('select count(*)::int c from public.admin_users'); ok(r.rows[0].c === 0, 'user_metadata.role=admin est IGNORE');
await db.exec('reset role');
await db.exec('set role anon'); await throws('select * from public.audit_log', 'anon ne peut pas lire audit_log'); await db.exec('reset role');
await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub: uAdmin, aal: 'aal2', app_metadata: { role: 'admin' } })}',false)`);
await throws(`insert into public.audit_log(action,table_name) values ('X','y')`, 'admin ne peut pas ecrire dans audit_log');
await db.exec('reset role');
await throws(`update public.audit_log set action='Z'`, 'audit_log : UPDATE interdit (meme superuser)');
await throws(`delete from public.audit_log`, 'audit_log : DELETE interdit');
await throws(`truncate public.audit_log`, 'audit_log : TRUNCATE interdit');

console.log('4. Garde-fou dernier administrateur');
await throws(`update public.admin_users set is_active=false where user_id='${uAdmin}'`, 'desactiver le seul admin est refuse');
await throws(`delete from public.admin_users where user_id='${uAdmin}'`, 'supprimer le seul admin est refuse');
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin2}','b@x','Admin B','admin')`);
await db.exec(`update public.admin_users set is_active=false where user_id='${uAdmin}'`); ok(true, 'avec un 2e admin actif, la desactivation passe');
await db.exec(`update public.admin_users set is_active=true where user_id='${uAdmin}'`);

console.log('5. Retour arriere');
await db.exec(down);
o = await objs(); ok(o.t === 0 && o.f === 0, `tout supprime (${o.t} tables / ${o.f} fonctions restantes)`);
ok((await snap()) === before, 'table orders, son trigger et ses donnees strictement identiques');
ok((await db.query(`select count(*)::int c from pg_proc where proname='touch_updated_at'`)).rows[0].c === 1, 'la fonction touch_updated_at existante est intacte');
await db.exec(down); ok(true, 'retour arriere rejouable sans erreur');

console.log('6. Re-application apres retour arriere');
await db.exec(up); o = await objs(); ok(o.t === 3 && o.f === 8, 'migration reapplicable proprement');
console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
