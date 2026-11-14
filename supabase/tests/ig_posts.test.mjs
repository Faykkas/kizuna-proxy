// Teste la migration des posts Instagram sur un PostgreSQL en mémoire (PGlite) : application, rejeu, contraintes,
// lecture publique limitée aux posts validés/publiés, droits admin + MFA, journal d'audit, retour arrière.
// Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundation = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const up = fs.readFileSync(ROOT + '/migrations/20261114120000_ig_posts.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261114120000_ig_posts.down.sql', 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const throws = async (sql, m) => {
  try { await db.exec(sql); ok(false, m + ' (aucune erreur levée)'); }
  catch (e) { ok(true, m + ' -> ' + e.message.split('\n')[0].slice(0, 70)); }
};

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
const exists = async () => (await db.query(`select count(*)::int c from pg_tables where schemaname='public' and tablename='ig_posts'`)).rows[0].c;

console.log('1. Application et rejeu');
await db.exec(up);
ok((await exists()) === 1, 'table ig_posts créée');
await db.exec(up);
ok((await exists()) === 1, 'rejouer la migration ne change rien');

console.log('2. Contraintes');
await db.exec(`insert into public.ig_posts (title, official_url, status, created_by) values
  ('Pokémon Center pop-up', 'https://www.pokemoncenter-online.com/a', 'draft', 'auto'),
  ('Sanrio Christmas goods', 'https://www.sanrio.co.jp/b', 'approved', 'admin'),
  ('Comiket 107', 'https://www.comiket.co.jp/c', 'published', 'admin'),
  ('Old event', 'https://example.jp/d', 'archived', 'admin')`);
await throws(`insert into public.ig_posts (title, official_url) values ('Doublon', 'https://www.pokemoncenter-online.com/a')`, 'un même lien officiel est refusé en double');
await throws(`insert into public.ig_posts (title, official_url) values ('Lien non sécurisé', 'http://example.jp/x')`, 'lien officiel en http refusé');
await throws(`insert into public.ig_posts (title, official_url, status) values ('Statut inconnu', 'https://example.jp/y', 'live')`, 'statut inconnu refusé');
await throws(`insert into public.ig_posts (title, official_url, highlights) values ('Trop de points', 'https://example.jp/z', array['a','b','c','d','e','f'])`, 'plus de 5 points refusé');
await throws(`insert into public.ig_posts (title, official_url) values ('ab', 'https://example.jp/w')`, 'titre trop court refusé');

console.log('3. Lecture publique');
await db.exec('set role anon');
let r = await db.query(`select title from public.ig_posts order by title`);
ok(r.rows.length === 2 && r.rows.every((x) => ['Sanrio Christmas goods', 'Comiket 107'].includes(x.title)), 'le public ne voit que les posts validés ou publiés');
await throws(`insert into public.ig_posts (title, official_url) values ('Pirate', 'https://example.jp/p')`, 'le public ne peut rien écrire');
await db.exec('reset role');

console.log('4. Droits admin');
const uAdmin = '11111111-1111-1111-1111-111111111111', uStaff = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users(id,email) values ('${uAdmin}','a@x'),('${uStaff}','s@x')`);
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin}','a@x','Admin A','admin'),('${uStaff}','s@x','Staff S','staff')`);
const as = async (sub, role, aal, sql) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub, email: 'x@x', aal, app_metadata: { role } })}',false);`);
  try { return await db.query(sql); } finally { await db.exec('reset role'); }
};
r = await as(uAdmin, 'admin', 'aal2', 'select count(*)::int c from public.ig_posts'); ok(r.rows[0].c === 4, 'admin+MFA voit aussi les brouillons et archives');
r = await as(uAdmin, 'admin', 'aal1', 'select count(*)::int c from public.ig_posts'); ok(r.rows[0].c === 2, 'admin SANS MFA ne voit que les posts publics');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.ig_posts'); ok(r.rows[0].c === 2, 'staff ne voit que les posts publics');
r = await as(uAdmin, 'admin', 'aal2', `update public.ig_posts set status='approved' where status='draft' returning updated_at > created_at as touched`); ok(r.rows.length === 1, 'admin+MFA valide un brouillon');
await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub: uStaff, aal: 'aal2', app_metadata: { role: 'staff' } })}',false)`);
await throws(`insert into public.ig_posts (title, official_url) values ('Staff post', 'https://example.jp/s')`, 'staff ne peut pas créer de post');
await db.exec('reset role');
r = await as(uAdmin, 'admin', 'aal2', `select count(*)::int c from public.audit_log where table_name='ig_posts'`); ok(r.rows[0].c >= 1, 'les changements sont dans le journal d\'audit');

console.log('5. Retour arrière et ré-application');
await db.exec(down);
ok((await exists()) === 0, 'table supprimée');
await db.exec(down); ok(true, 'retour arrière rejouable');
await db.exec(up);
ok((await exists()) === 1, 'migration réapplicable');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
