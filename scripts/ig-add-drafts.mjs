// Ajoute des BROUILLONS de posts Instagram (admin → Instagram) depuis un fichier JSON.
// Utilisé par la recherche automatique hebdomadaire. Ne publie jamais rien : statut « draft », créé par « auto ».
//
//   node scripts/ig-add-drafts.mjs chemin/vers/brouillons.json [--dry-run]
//
// Le fichier est une liste d'objets :
//   { "kind": "popup", "title": "...", "subtitle": "...", "dates": "...", "place": "...",
//     "highlights": ["...", "..."], "officialUrl": "https://...", "sourceName": "..." }
//
// Chaque lien officiel est ouvert pour vérifier qu'il répond. Un lien déjà présent dans la table est ignoré.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseIgInput } from "../app/lib/igPosts.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = { ...process.env };
  const file = path.join(ROOT, ".env.local");
  if (fs.existsSync(file)) {
    for (const l of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

async function linkAnswers(url) {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "KizunaProxyLinkCheck/1.0 (+https://kizunaproxy.com)", Accept: "text/html,*/*" },
    });
    return { ok: r.status < 400, status: r.status };
  } catch (e) {
    return { ok: false, status: String(e?.cause?.code || e?.name || "error") };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("Usage : node scripts/ig-add-drafts.mjs brouillons.json [--dry-run]");
    process.exit(2);
  }
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(list)) throw new Error("Le fichier doit contenir une liste (tableau JSON).");

  const env = loadEnv();
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!base || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquant (.env.local).");
  const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const rows = [];
  for (const item of list.slice(0, 8)) {
    const parsed = parseIgInput({
      ...item,
      highlights: Array.isArray(item.highlights) ? item.highlights.join("\n") : item.highlights,
      caption: "",
    });
    const label = String(item.title ?? "(sans titre)").slice(0, 60);
    if (!parsed.ok) {
      console.log(`✗ ${label} : ${parsed.error}`);
      continue;
    }
    const check = await linkAnswers(parsed.value.official_url);
    if (!check.ok) {
      console.log(`✗ ${label} : le lien officiel ne répond pas (${check.status}) → ${parsed.value.official_url}`);
      continue;
    }
    rows.push({ ...parsed.value, status: "draft", created_by: "auto" });
    console.log(`✓ ${label} (${check.status})`);
  }

  if (!rows.length) {
    console.log("Aucun brouillon valable à ajouter.");
    return;
  }

  // Liens déjà connus (même archivés) : on ne recrée pas le même post.
  const urls = rows.map((r) => r.official_url);
  const q = `official_url=in.(${urls.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")})`;
  const known = await fetch(`${base}/rest/v1/ig_posts?select=official_url&${q}`, { headers: H });
  if (!known.ok) {
    const body = await known.text();
    if (body.includes("PGRST205")) throw new Error("La table ig_posts n'existe pas encore : exécutez supabase/migrations/20261114120000_ig_posts.sql dans Supabase.");
    throw new Error(`Lecture de ig_posts impossible (${known.status}) : ${body}`);
  }
  const seen = new Set((await known.json()).map((r) => r.official_url));
  const fresh = rows.filter((r) => !seen.has(r.official_url));
  for (const r of rows) if (seen.has(r.official_url)) console.log(`• déjà présent, ignoré : ${r.title}`);

  if (!fresh.length) {
    console.log("Rien de nouveau : tous les liens sont déjà dans la liste.");
    return;
  }
  if (dry) {
    console.log(`(essai) ${fresh.length} brouillon(s) seraient ajoutés.`);
    return;
  }

  const res = await fetch(`${base}/rest/v1/ig_posts?on_conflict=official_url`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify(fresh),
  });
  if (!res.ok) throw new Error(`Ajout impossible (${res.status}) : ${await res.text()}`);
  const added = await res.json();
  console.log(`${added.length} brouillon(s) ajouté(s) dans l'admin → Instagram.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
