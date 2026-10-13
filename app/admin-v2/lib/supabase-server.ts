import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { BASE, IS_PRODUCTION, SESSION_COOKIE, SESSION_MAX_AGE } from "./config";

// Clé publique uniquement (jamais la clé service). Les requêtes passent avec
// le JWT de la personne connectée : la RLS de Supabase s'applique toujours.
export function supabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Variables Supabase publiques manquantes.");
  return { url, key };
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  path: BASE,
  sameSite: "lax" as const,
  secure: IS_PRODUCTION,
  maxAge: SESSION_MAX_AGE,
};

export async function createServerSupabase() {
  const { url, key } = supabasePublicEnv();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Depuis un Server Component l'écriture est impossible : le proxy
        // (proxy.ts) s'occupe déjà de rafraîchir la session.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* ignoré volontairement */
        }
      },
    },
  });
}
