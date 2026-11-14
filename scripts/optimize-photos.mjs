// Versions légères des photos utilisées en fond (en-têtes de pages, couvertures des guides, bandeau de l'accueil).
// Pour chaque public/photos/<nom>.jpg : public/photos/w/<nom>-800.webp (téléphones) et <nom>-1600.webp (ordinateurs).
// À relancer après avoir ajouté une photo :  node scripts/optimize-photos.mjs
// (le test app/lib/photoVariants.test.ts vérifie qu'aucune photo n'a été oubliée).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public", "photos");
const OUT = path.join(SRC, "w");
const WIDTHS = [800, 1600];

fs.mkdirSync(OUT, { recursive: true });
let made = 0, kept = 0, before = 0, after = 0;
for (const file of fs.readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f)).sort()) {
  const src = path.join(SRC, file);
  const name = file.replace(/\.jpe?g$/i, "");
  const srcStat = fs.statSync(src);
  for (const w of WIDTHS) {
    const dest = path.join(OUT, `${name}-${w}.webp`);
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcStat.mtimeMs) { kept++; continue; }
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w <= 800 ? 60 : 68, effort: 5 }).toFile(dest);
    made++;
  }
  before += srcStat.size;
  after += fs.statSync(path.join(OUT, `${name}-800.webp`)).size;
}
console.log(`${made} fichier(s) créé(s), ${kept} déjà à jour. Photos d'origine : ${(before / 1024 / 1024).toFixed(1)} Mo → versions téléphone : ${(after / 1024 / 1024).toFixed(1)} Mo.`);
