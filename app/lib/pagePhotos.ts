// Photo d'en-tête de chaque page (licence Unsplash, voir docs/photo-credits.md). UN SEUL endroit à modifier.
// Utilisé avec la classe .page-head-photo : <header className="page-head page-head-photo" style={photoHead("pricing")}>

import type { CSSProperties } from "react";

export const PAGE_PHOTOS = {
  shop: "/photos/anime-figures-shelf.jpg",
  services: "/photos/anime-figures-wall.jpg",
  pricing: "/photos/lantern-alley.jpg",
  grille: "/photos/lantern-alley.jpg",
  shipping: "/photos/parcels-pile.jpg",
  howItWorks: "/photos/shibuya-neon.jpg",
  reviews: "/photos/plush-wall.jpg",
  coupons: "/photos/washi-tape.jpg",
  reservation: "/photos/tea-ceremony.jpg",
  inStore: "/photos/neon-street.jpg",
  popUp: "/photos/shinjuku-neon.jpg",
  cardProxy: "/photos/pokemon-cards.jpg",
  why: "/photos/tokyo-tower-dusk.jpg",
  rules: "/photos/ceramics.jpg",
  events: "/photos/matsuri-night.jpg",
  faq: "/photos/tokyo-tower-dusk.jpg",
} as const;

export type PagePhotoKey = keyof typeof PAGE_PHOTOS;

/** Style à poser sur l'en-tête : la photo passe par la variable CSS --ph. */
export function photoHead(key: PagePhotoKey): CSSProperties {
  return { ["--ph" as string]: `url(${PAGE_PHOTOS[key]})` } as CSSProperties;
}
