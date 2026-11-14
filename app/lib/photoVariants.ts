// Versions légères (WebP) des photos de public/photos, créées par scripts/optimize-photos.mjs :
//   /photos/<nom>.jpg → /photos/w/<nom>-800.webp (téléphones) et /photos/w/<nom>-1600.webp (ordinateurs).
// Utilisé pour les photos en fond (CSS), que l'optimiseur d'images de Next ne traite pas.

import type { CSSProperties } from "react";

export type PhotoWidth = 800 | 1600;

/** Chemin de la version légère d'une photo locale ; tout autre chemin est rendu tel quel. */
export function photoVariant(src: string, width: PhotoWidth): string {
  const m = /^\/photos\/([^/]+)\.jpe?g$/i.exec(src);
  return m ? `/photos/w/${m[1]}-${width}.webp` : src;
}

/**
 * Variables CSS pour une photo en fond : --<nom> (ordinateur) et --<nom>-sm (téléphone).
 * Le CSS choisit --<nom>-sm sous 768 px de large.
 */
export function photoBgVars(src: string, name: string): CSSProperties {
  return {
    [`--${name}` as string]: `url(${photoVariant(src, 1600)})`,
    [`--${name}-sm` as string]: `url(${photoVariant(src, 800)})`,
  } as CSSProperties;
}
