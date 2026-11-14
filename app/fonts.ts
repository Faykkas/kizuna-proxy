// app/fonts.ts
//
// Self-hosted via next/font/google instead of a <link> to fonts.googleapis.com.
// next/font fetches the font files once at build time and serves them from
// our own domain — the visitor's browser never contacts Google, so no IP
// address is shared with Google before (or ever, for that matter) consent.
//
// Performance : seules les deux polices utilisées (Outfit pour les titres, Inter pour le texte) sont déclarées.
// `subsets` ne règle que le PRÉCHARGEMENT : seul le latin de base est préchargé sur chaque page ; les autres jeux de
// caractères (latin étendu, vietnamien, cyrillique…) restent déclarés et ne se téléchargent que si la page en contient.
// L'ancienne police pixel (Press Start 2P) et Cormorant Garamond ne sont plus utilisées (--font-pixel et
// --font-cormorant pointent vers Inter / Outfit, voir globals.css et v3.css).

import { Outfit, Inter } from "next/font/google";

export const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// v3 : police de lecture (texte, boutons, étiquettes).
export const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
