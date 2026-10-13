import test from "node:test";
import assert from "node:assert/strict";
import { translate } from "./i18n.ts";

test("le français reste tel quel, avec les variables remplies", () => {
  assert.equal(translate("fr", "{n} clients", { n: 3 }), "3 clients");
});

test("le japonais traduit une clé connue et remplit les variables", () => {
  assert.equal(translate("ja", "Tableau de bord"), "ダッシュボード");
  assert.equal(translate("ja", "{n} clients", { n: 3 }), "顧客 3人");
});

test("une clé inconnue retombe sur le français", () => {
  assert.equal(translate("ja", "Texte jamais traduit"), "Texte jamais traduit");
});

test("les règles à trou composent une phrase japonaise", () => {
  assert.equal(translate("ja", "Indiquez le prix de « Sac »."), "「Sac」の価格を入力してください。");
});

test("chaque texte passé à t(\"…\") a sa traduction japonaise", async () => {
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.ts$/.test(e.name) && !/^ja/.test(e.name)) files.push(p);
    }
  };
  walk(root);
  const { JA } = await import("./ja.ts");
  const missing: string[] = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) {
      const key = JSON.parse(`"${m[1]}"`) as string;
      if (!(key in JA)) missing.push(key);
    }
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("messages de validation composés", () => {
  assert.equal(translate("ja", "Le titre est obligatoire."), "タイトルは必須です。");
  assert.equal(translate("ja", "Le titre : 50 caractères maximum."), "タイトル：最大50文字までです。");
  assert.equal(translate("ja", "Le prix : montant trop grand."), "価格：金額が大きすぎます。");
});
