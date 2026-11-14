// Réglages de l'offensive de Noël : UN SEUL endroit à modifier.
//   XMAS_DEADLINE   : fin des commandes de Noël (le compte à rebours, le lien du menu et la bande de l'accueil disparaissent ensuite)
//   XMAS_CODE       : code commun affiché dans le quiz (doit exister dans Admin → Coupons)
//   XMAS_CODE_UNTIL : fin de validité du code, À GARDER IDENTIQUE à l'expiration saisie dans l'admin.
//                     Passé cette date, le code n'est plus montré (le quiz continue de fonctionner sans).

export const XMAS_DEADLINE = "2026-12-05T14:59:59Z"; // 5 décembre 2026, 23:59:59 heure de Tokyo
export const XMAS_CODE = "XMAS500";
export const XMAS_CODE_UNTIL = "2026-12-05T14:59:59Z"; // expiration du coupon dans la base (5 déc., 23:59 Tokyo)

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
// `icon` : visuel pixel art (aucune photo de client). `img` : photo libre de droits (public/photos/, licence Unsplash),
// prioritaire si présente ; l'icône reste en secours.
export type XmasIdea = { tier: number; img?: string; icon?: string };

export const XMAS_IDEAS: XmasIdea[][] = [
  // Anime & manga : Ichiban Kuji, figurine limitée, tapisseries & acryliques
  [{ tier: 1, icon: "gacha", img: "/photos/gachapon-row.jpg" }, { tier: 3, icon: "figure", img: "/photos/one-piece-figures.jpg" }, { tier: 0, icon: "event", img: "/photos/anime-figures-shelf.jpg" }],
  // Pokémon & cartes : peluche, exclusivités Pokémon Center, display de boosters
  [{ tier: 0, icon: "gacha", img: "/photos/plush-wall.jpg" }, { tier: 1, icon: "store", img: "/photos/pokemon-cards-pokeball.jpg" }, { tier: 2, icon: "cards", img: "/photos/pokemon-cards.jpg" }],
  // Mode & sacs : streetwear anime, collabs Japon, sac Coach
  [{ tier: 1, icon: "apparel" }, { tier: 0, icon: "sneaker", img: "/photos/sneakers-box.jpg" }, { tier: 3, icon: "bag", img: "/photos/coach-tag.jpg" }],
  // Douceurs : coffret snacks, chocolats, Starbucks Japon
  [{ tier: 0, icon: "box", img: "/photos/sweets-shop.jpg" }, { tier: 1, icon: "bag" }, { tier: 1, icon: "store" }],
  // Kawaii & Sanrio : peluche de Noël, exclusivités, mode & accessoires
  [{ tier: 0, icon: "gacha", img: "/photos/plush-wall.jpg" }, { tier: 1, icon: "store", img: "/photos/washi-tape.jpg" }, { tier: 2, icon: "apparel", img: "/photos/leather-bag.jpg" }],
  // Japon traditionnel : Daruma, matcha & thé, stylo plume & encre
  [{ tier: 0, icon: "figure", img: "/photos/lantern-alley.jpg" }, { tier: 1, icon: "box", img: "/photos/tea-ceremony.jpg" }, { tier: 2, icon: "book" }],
];

/** Les 3 idées de l'univers, la plus proche du budget d'abord (à égalité : l'ordre du catalogue). */
export function rankIdeas(universe: number, budget: number): number[] {
  const list = XMAS_IDEAS[universe] || [];
  return list
    .map((idea, i) => ({ i, gap: Math.abs(idea.tier - budget) }))
    .sort((a, b) => a.gap - b.gap || a.i - b.i)
    .map((x) => x.i);
}
