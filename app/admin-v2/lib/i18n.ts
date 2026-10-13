// Langue de l'admin-v2 : français (par défaut) ou japonais.
//
// Principe : le TEXTE FRANÇAIS sert de clé. `t("Tableau de bord")` renvoie « ダッシュボード » en japonais et le
// texte français tel quel sinon. Une phrase non traduite reste donc lisible (en français) au lieu de casser l'écran,
// et un test vérifie que chaque texte passé à t() a bien sa traduction (voir i18n.test.ts).
//
// Les valeurs variables s'écrivent {nom} : t("{n} commandes", { n: 12 }).
//
// Sans dépendance (hors le dictionnaire), testable seul.

import { JA, JA_RULES } from "./ja.ts";

export type Lang = "fr" | "ja";
export const LANGS: Lang[] = ["fr", "ja"];
export const LANG_COOKIE = "av2-lang";

export function normalizeLang(value: unknown): Lang {
  return value === "ja" ? "ja" : "fr";
}

export type Vars = Record<string, string | number>;

function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Traduit un texte français. Hors japonais, ou si aucune traduction n'existe, renvoie le français. */
export function translate(lang: Lang, text: string, vars?: Vars): string {
  if (lang === "fr") return fill(text, vars);
  const direct = JA[text];
  if (direct !== undefined) return fill(direct, vars);

  // Phrases à trou dont le libellé est lui-même traduisible (« Le nom est obligatoire. »).
  for (const rule of JA_RULES) {
    const m = rule.re.exec(text);
    if (m) return fill(rule.ja(m.slice(1).map((part) => translate(lang, part))), vars);
  }
  // Messages d'erreur construits « <libellé> : <message> » par les validateurs.
  const sep = text.indexOf(" : ");
  if (sep > 0) {
    const left = JA[text.slice(0, sep)];
    const right = JA[text.slice(sep + 3)];
    if (left !== undefined || right !== undefined) {
      return fill(`${left ?? text.slice(0, sep)}：${right ?? text.slice(sep + 3)}`, vars);
    }
  }
  return fill(text, vars);
}

export type Translator = (text: string, vars?: Vars) => string;

export function makeT(lang: Lang): Translator {
  return (text, vars) => translate(lang, text, vars);
}

export function localeOf(lang: Lang): string {
  return lang === "ja" ? "ja-JP" : "fr-FR";
}
