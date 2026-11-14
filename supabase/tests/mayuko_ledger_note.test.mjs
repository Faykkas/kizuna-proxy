// Teste la migration « modifier la note d'un mouvement Mayuko » sur un PostgreSQL en mémoire (PGlite) :
// seuls les admins avec second facteur peuvent changer la note, jamais le montant ; retour arrière.
// Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundation = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const ledger = fs.readFileSync(ROOT + '/migrations/20261101130000_mayuko_ledger.sql', 'utf8');
const up = fs.readFileSync(ROOT + '/migrations/20261114130000_mayuko_ledger_note_update.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261114130000_mayuko_ledger_note_update.down.sql', 'utf8');
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
await db.exec(ledger);
await db.exec(`insert into public.mayuko_ledger (kind, amount_jpy, note) values ('advance', 7233, null), ('repayment', 500000, null)`);

const uAdmin = '11111111-1111-1111-1111-111111111111', uStaff = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users(id,email) values ('${uAdmin}','a@x'),('${uStaff}','s@x')`);
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin}','a@x','Admin A','admin'),('${uStaff}','s@x','Staff S','staff')`);
const as = async (sub, role, aal, sql) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub, email: 'x@x', aal, app_metadata: { role } })}',false);`);
  try { return { rows: (await db.query(sql)).rows }; } catch (e) { return { error: e.message }; } finally { await db.exec('reset role'); }
};
const note = async () => (await db.query(`select note from public.mayuko_ledger where kind='advance'`)).rows[0].note;

console.log('1. Avant la migration');
let r = await as(uAdmin, 'admin', 'aal2', `update public.mayuko_ledger set note='Livraison' where kind='advance' returning id`);
ok(!!r.error, 'impossible de modifier une note sans la migration');

console.log('2. Après la migration');
await db.exec(up); await db.exec(up); ok(true, 'migration rejouable');
r = await as(uAdmin, 'admin', 'aal2', `update public.mayuko_ledger set note='Taxes Zonos' where kind='advance' returning id`);
ok(r.rows?.length === 1 && (await note()) === 'Taxes Zonos', 'admin+MFA classe une avance');
r = await as(uAdmin, 'admin', 'aal2', `update public.mayuko_ledger set amount_jpy=1 where kind='advance' returning id`);
ok(!!r.error, 'le montant reste impossible à modifier');
r = await as(uAdmin, 'admin', 'aal1', `update public.mayuko_ledger set note='Autre' where kind='advance' returning id`);
ok((r.rows?.length ?? 0) === 0 && (await note()) === 'Taxes Zonos', 'admin SANS second facteur ne modifie rien');
r = await as(uStaff, 'staff', 'aal2', `update public.mayuko_ledger set note='Autre' where kind='advance' returning id`);
ok((r.rows?.length ?? 0) === 0 && (await note()) === 'Taxes Zonos', 'staff ne modifie rien');
r = await as(uAdmin, 'admin', 'aal2', `select count(*)::int c from public.audit_log where table_name='mayuko_ledger' and action ilike 'update%'`);
ok(r.rows?.[0]?.c >= 1, 'le changement est dans le journal d\'audit');

console.log('3. Retour arrière');
await db.exec(down); await db.exec(down);
r = await as(uAdmin, 'admin', 'aal2', `update public.mayuko_ledger set note='Autre' where kind='advance' returning id`);
ok(!!r.error && (await note()) === 'Taxes Zonos', 'retour arrière : plus de modification, note gardée');
await db.exec(up); ok(true, 'migration réapplicable');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
