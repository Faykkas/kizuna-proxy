// app/fonts.ts
//
// Self-hosted via next/font/google instead of a <link> to fonts.googleapis.com.
// next/font fetches the font files once at build time and serves them from
// our own domain — the visitor's browser never contacts Google, so no IP
// address is shared with Google before (or ever, for that matter) consent.

import { Outfit, Cormorant_Garamond } from "next/font/google";

export const outfit = Outfit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
