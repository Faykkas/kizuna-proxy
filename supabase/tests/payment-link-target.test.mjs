// Teste la migration « choix de la commande » : ajout, rejeu, données existantes intactes,
// clé étrangère, retour arrière, ré-application. Lancer : npm run test:sql
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const up = fs.readFileSync(ROOT + '/migrations/20261013180000_payment_link_order_target.sql', 'utf8');
const down = fs.readFileSync(ROOT + '/rollback/20261013180000_payment_link_order_target.down.sql', 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const cols = async () => (await db.query(`select column_name, is_nullable, column_default from information_schema.columns where table_name='payment_links' and column_name in ('target_order_id','new_order') order by 1`)).rows;

await db.exec(`
 create table public.orders (id bigint primary key, client_name text);
 create table public.payment_links (id uuid primary key default gen_random_uuid(), label text, status text default 'pending', amount_jpy numeric);
 insert into public.orders values (1, 'A'), (2, 'B');
 insert into public.payment_links (label, status, amount_jpy) values ('Ancien lien', 'paid', 5000), ('Lien en attente', 'pending', 9600);
`);
const snapshot = async () => JSON.stringify((await db.query(`select label, status, amount_jpy from public.payment_links order by label`)).rows);
const before = await snapshot();

console.log('1. Application');
await db.exec(up);
let c = await cols();
ok(c.length === 2, 'deux colonnes ajoutées');
ok(c.find(x => x.column_name === 'target_order_id')?.is_nullable === 'YES', 'target_order_id est optionnelle');
ok(c.find(x => x.column_name === 'new_order')?.column_default === 'false', 'new_order vaut false par défaut');
ok((await snapshot()) === before, 'les liens existants sont intacts');
ok((await db.query(`select count(*)::int c from public.payment_links where target_order_id is null and new_order = false`)).rows[0].c === 2, 'les liens existants gardent le comportement automatique');

console.log('2. Idempotence');
await db.exec(up);
ok((await cols()).length === 2, 'rejouer la migration ne change rien');

console.log('3. Comportement');
await db.exec(`insert into public.payment_links (label, target_order_id) values ('Vers commande 2', 2)`);
try { await db.exec(`insert into public.payment_links (label, target_order_id) values ('Commande inexistante', 999)`); ok(false, 'commande inexistante refusée'); }
catch { ok(true, 'une commande inexistante est refusée (clé étrangère)'); }
await db.exec(`delete from public.orders where id = 2`);
ok((await db.query(`select target_order_id from public.payment_links where label='Vers commande 2'`)).rows[0].target_order_id === null, 'commande supprimée : le lien retombe sur le mode automatique');

console.log('4. Retour arrière');
await db.exec(`delete from public.payment_links where label = 'Vers commande 2'`);
await db.exec(down);
ok((await cols()).length === 0, 'colonnes supprimées');
ok((await snapshot()) === before, 'données d\'origine strictement identiques');
await db.exec(down); ok(true, 'retour arrière rejouable');

console.log('5. Ré-application');
await db.exec(up);
ok((await cols()).length === 2, 'migration réapplicable');

console.log(`\n${pass} reussis, ${fail} echoues`);
process.exit(fail ? 1 : 0);
