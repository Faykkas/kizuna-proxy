// app/fonts.ts
//
// Self-hosted via next/font/google instead of a <link> to fonts.googleapis.com.
// next/font fetches the font files once at build time and serves them from
// our own domain — the visitor's browser never contacts Google, so no IP
// address is shared with Google before (or ever, for that matter) consent.

import { Press_Start_2P, Outfit, Inter, Cormorant_Garamond } from "next/font/google";

export const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

// v3 : police de lecture (texte, boutons, étiquettes). latin-ext + vietnamese pour es/pt/de/nl/vi.
export const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
