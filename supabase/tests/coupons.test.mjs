// Teste la migration des coupons sur un PostgreSQL en mémoire (PGlite) : application, rejeu, une seule utilisation par
// client (garantie par la base), droits RLS (admin + MFA), historique protégé, retour arrière, ré-application.
// Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const foundation = fs.readFileSync(ROOT + '/migrations/20261013120000_admin_foundation.sql', 'utf8');
const up = fs.readFileSync(ROOT + '/migrations/20261102120000_coupons.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261102120000_coupons.down.sql', 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const throws = async (sql, m) => {
  try { await db.exec(sql); ok(false, m + ' (aucune erreur levée)'); }
  catch (e) { ok(true, m + ' -> ' + e.message.split('\n')[0].slice(0, 70)); }
};

// Environnement Supabase simulé + la migration de base (fonctions kz_is_admin / kz_is_mfa_verified, journal d'audit)
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
 grant all on public.orders to authenticated;
 create table public.payment_links (id uuid primary key default gen_random_uuid(), label text, status text default 'pending', amount_jpy numeric, fee_amount_jpy numeric);
 insert into public.payment_links (label, status, amount_jpy, fee_amount_jpy) values ('Ancien lien', 'paid', 5000, 1000), ('Lien en attente', 'pending', 9600, 2000);
`);
await db.exec(foundation);
const snapshot = async () => JSON.stringify((await db.query(`select label, status, amount_jpy, fee_amount_jpy from public.payment_links order by label`)).rows);
const before = await snapshot();
const linkCols = async () => (await db.query(`select column_name from information_schema.columns where table_name='payment_links' and column_name in ('coupon_code','coupon_discount_jpy','fee_before_coupon_jpy') order by 1`)).rows.length;
const tables = async () => (await db.query(`select count(*)::int c from pg_tables where schemaname='public' and tablename in ('coupons','coupon_redemptions')`)).rows[0].c;

console.log('1. Application');
await db.exec(up);
ok((await tables()) === 2, '2 tables créées');
ok((await linkCols()) === 3, '3 colonnes optionnelles ajoutées à payment_links');
ok((await snapshot()) === before, 'les liens existants sont intacts');
ok((await db.query(`select count(*)::int c from public.payment_links where coupon_code is null and coupon_discount_jpy = 0 and fee_before_coupon_jpy is null`)).rows[0].c === 2, 'les liens existants n\'ont aucun coupon');

console.log('2. Idempotence');
await db.exec(up);
ok((await tables()) === 2 && (await linkCols()) === 3, 'rejouer la migration ne change rien');

console.log('3. Règles de données');
await db.exec(`insert into public.coupons (code, kind, amount_jpy) values ('XMAS500', 'christmas', 500)`);
await db.exec(`insert into public.coupons (code, kind, amount_jpy, customer_email) values ('KZ-ABCD2345', 'reddit_photo', 750, 'anna@example.com')`);
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('XMAS500', 'christmas', 500)`, 'code déjà pris refusé');
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('noel', 'christmas', 500)`, 'code en minuscules / trop court refusé');
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('ZERO0', 'custom', 0)`, 'montant 0 refusé');
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('BIG-1', 'custom', 100001)`, 'montant au-delà du plafond refusé');
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('AUTRE1', 'inconnu', 500)`, 'type inconnu refusé');
await throws(`insert into public.coupons (code, kind, amount_jpy, customer_email) values ('MAJ-1', 'trustpilot', 500, 'Anna@Example.com')`, 'email non normalisé (majuscules) refusé');

console.log('4. Une seule utilisation par client');
const noel = (await db.query(`select id from public.coupons where code='XMAS500'`)).rows[0].id;
const [l1, l2] = (await db.query(`select id from public.payment_links order by label`)).rows.map((r) => r.id);
await db.exec(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'anna@example.com', '${l1}', 500)`);
await throws(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'anna@example.com', '${l2}', 500)`, 'même client, même coupon, 2e réservation refusée');
await db.exec(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'bob@example.com', '${l2}', 500)`);
ok(true, 'un autre client peut utiliser le même coupon commun');
await throws(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy, status) values ('${noel}', 'carl@example.com', '${l2}', 500, 'reserved')`, 'un lien ne réserve qu\'un coupon à la fois');
await db.exec(`update public.coupon_redemptions set status='used', used_at=now() where client_email='anna@example.com'`);
await throws(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'anna@example.com', gen_random_uuid(), 500)`, 'coupon déjà utilisé : nouvelle réservation refusée');
await db.exec(`update public.coupon_redemptions set status='released' where client_email='bob@example.com'`);
await db.exec(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'bob@example.com', '${l2}', 500)`);
ok(true, 'après libération, le client peut réutiliser son coupon');
await throws(`update public.coupon_redemptions set status='annulé' where client_email='bob@example.com'`, 'statut inconnu refusé');
await throws(`insert into public.coupon_redemptions (coupon_id, client_email, payment_link_id, discount_jpy) values ('${noel}', 'Dan@Example.com', gen_random_uuid(), 500)`, 'email client non normalisé refusé');
await throws(`delete from public.coupons where id='${noel}'`, 'un coupon avec historique ne peut pas être supprimé');
const kz = (await db.query(`select id from public.coupons where code='KZ-ABCD2345'`)).rows[0].id;
await db.exec(`delete from public.coupons where id='${kz}'`);
ok(true, 'un coupon jamais utilisé peut être supprimé');
await db.exec(`insert into public.coupons (code, kind, amount_jpy, customer_email) values ('KZ-ABCD2345', 'reddit_photo', 750, 'anna@example.com')`);

console.log('5. Droits (RLS)');
const uAdmin = '11111111-1111-1111-1111-111111111111', uStaff = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users(id,email) values ('${uAdmin}','a@x'),('${uStaff}','s@x')`);
await db.exec(`insert into public.admin_users(user_id,email,display_name,role) values ('${uAdmin}','a@x','Admin A','admin'),('${uStaff}','s@x','Staff S','staff')`);
const as = async (sub, role, aal, sql) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub, email: 'x@x', aal, app_metadata: { role } })}',false);`);
  try { return await db.query(sql); } finally { await db.exec('reset role'); }
};
let r = await as(uAdmin, 'admin', 'aal2', 'select count(*)::int c from public.coupons'); ok(r.rows[0].c === 2, 'admin+MFA voit les coupons');
r = await as(uAdmin, 'admin', 'aal1', 'select count(*)::int c from public.coupons'); ok(r.rows[0].c === 0, 'admin SANS MFA ne voit rien');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.coupons'); ok(r.rows[0].c === 0, 'staff ne voit pas les coupons');
r = await as(uStaff, 'staff', 'aal2', 'select count(*)::int c from public.coupon_redemptions'); ok(r.rows[0].c === 0, 'staff ne voit pas les utilisations');
r = await as(uAdmin, 'admin', 'aal2', 'select count(*)::int c from public.coupon_redemptions'); ok(r.rows[0].c >= 1, 'admin+MFA voit les utilisations');
r = await as(uAdmin, 'admin', 'aal2', `insert into public.coupons (code, kind, amount_jpy) values ('ADMIN-1', 'custom', 500) returning 1`); ok(r.rows.length === 1, 'admin+MFA crée un coupon');
r = await as(uAdmin, 'admin', 'aal2', `update public.coupon_redemptions set status='released' where status='reserved' returning 1`); ok(r.rows.length >= 1, 'admin+MFA libère une réservation');
await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({ sub: uStaff, aal: 'aal2', app_metadata: { role: 'staff' } })}',false)`);
await throws(`insert into public.coupons (code, kind, amount_jpy) values ('STAFF-1', 'custom', 500)`, 'staff ne peut pas créer de coupon');
await db.exec('reset role');
await db.exec('set role anon'); await throws('select * from public.coupons', 'anon ne peut pas lire les coupons'); await db.exec('reset role');
r = await as(uAdmin, 'admin', 'aal2', `select count(*)::int c from public.audit_log where table_name='coupons'`); ok(r.rows[0].c >= 1, 'la création est dans le journal d\'audit');

console.log('6. Retour arrière');
await db.exec(`delete from public.coupon_redemptions`);
await db.exec(down);
ok((await tables()) === 0, 'tables supprimées');
ok((await linkCols()) === 0, 'colonnes supprimées');
ok((await snapshot()) === before, 'données d\'origine strictement identiques');
await db.exec(down); ok(true, 'retour arrière rejouable');

console.log('7. Ré-application');
await db.exec(up);
ok((await tables()) === 2 && (await linkCols()) === 3, 'migration réapplicable');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
