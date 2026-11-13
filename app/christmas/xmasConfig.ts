// Réglages de l'offensive de Noël : UN SEUL endroit à modifier.
//   XMAS_DEADLINE   : fin des commandes de Noël (le compte à rebours, le lien du menu et la bande de l'accueil disparaissent ensuite)
//   XMAS_CODE       : code commun affiché dans le quiz (doit exister dans Admin → Coupons)
//   XMAS_CODE_UNTIL : fin de validité du code, À GARDER IDENTIQUE à l'expiration saisie dans l'admin.
//                     Passé cette date, le code n'est plus montré (le quiz continue de fonctionner sans).

export const XMAS_DEADLINE = "2026-12-05T14:59:59Z"; // 5 décembre 2026, 23:59:59 heure de Tokyo
export const XMAS_CODE = "XMAS500";
export const XMAS_CODE_UNTIL = "2026-11-15T14:59:59Z"; // expiration actuelle du coupon dans la base (15 nov., 23:59 Tokyo)

export const XMAS_DEADLINE_MS = Date.parse(XMAS_DEADLINE);
export const XMAS_CODE_UNTIL_MS = Date.parse(XMAS_CODE_UNTIL);

/** Jours, heures, minutes, secondes restants (jamais négatifs). */
export function timeLeft(now: number, target: number = XMAS_DEADLINE_MS) {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return { done: ms <= 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

// ── Quiz ─────────────────────────────────────────────────────────────────────
// 6 univers × 3 idées. `tier` = gamme de budget habituelle de l'article (0 : < ¥5 000 … 3 : ¥40 000 et plus) : sert seulement
// à classer les idées (la plus proche du budget choisi en premier) ; aucun prix n'est affiché.
// `img` : vraie photo de commande ; sinon `icon` (icône pixel).
export type XmasIdea = { tier: number; img?: string; icon?: string };

export const XMAS_IDEAS: XmasIdea[][] = [
  // Anime & manga
  [{ tier: 1, icon: "gacha" }, { tier: 3, icon: "figure" }, { tier: 0, img: "/home/tapestry-hapisere.jpg" }],
  // Pokémon & cartes
  [{ tier: 0, icon: "store" }, { tier: 1, icon: "bag" }, { tier: 2, img: "/yugioh_order.jpg" }],
  // Mode & sacs
  [{ tier: 1, img: "/Jojo_order.jpg" }, { tier: 0, img: "/Harrypotter_order.jpg" }, { tier: 3, img: "/home/coach-trio.jpg" }],
  // Douceurs
  [{ tier: 0, icon: "box" }, { tier: 1, img: "/butter_butler.jpg" }, { tier: 1, icon: "bag" }],
  // Kawaii & Sanrio
  [{ tier: 0, icon: "gacha" }, { tier: 1, icon: "store" }, { tier: 2, icon: "apparel" }],
  // Japon traditionnel
  [{ tier: 0, img: "/daruma_order.jpg" }, { tier: 1, icon: "box" }, { tier: 2, img: "/Ancora_order.jpg" }],
];

/** Les 3 idées de l'univers, la plus proche du budget d'abord (à égalité : l'ordre du catalogue). */
export function rankIdeas(universe: number, budget: number): number[] {
  const list = XMAS_IDEAS[universe] || [];
  return list
    .map((idea, i) => ({ i, gap: Math.abs(idea.tier - budget) }))
    .sort((a, b) => a.gap - b.gap || a.i - b.i)
    .map((x) => x.i);
}
