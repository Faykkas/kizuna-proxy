"use client";
import { createBrowserClient } from "@supabase/ssr";
import { BASE, SESSION_COOKIE, SESSION_MAX_AGE } from "./config";

// Utilisé UNIQUEMENT pour la connexion et le MFA (formulaires). Les données
// sont lues côté serveur. Clé publique seulement.
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
  return createBrowserClient(url, key, {
    cookieOptions: {
      name: SESSION_COOKIE,
      path: BASE,
      sameSite: "lax",
      secure: typeof location !== "undefined" && location.protocol === "https:",
      maxAge: SESSION_MAX_AGE,
    },
  });
}
