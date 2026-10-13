// Proxy Next.js (anciennement « middleware ») — limité à /admin-v2.
//
// Rôle : rafraîchir le jeton de session (cookie) et renvoyer les visiteurs
// non connectés vers la page de connexion. L'autorisation complète (rôle,
// compte actif, MFA) est revérifiée CÔTÉ SERVEUR dans chaque page via
// requireAccess() — ce proxy n'est qu'une première barrière.
//
// Le matcher ci-dessous garantit que le site public n'est pas concerné.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const BASE = "/admin-v2";
const SESSION_COOKIE = "kz-admin-v2";
const SESSION_MAX_AGE = 60 * 60 * 12;

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new NextResponse("Configuration manquante", { status: 500 });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookieOptions: {
      name: SESSION_COOKIE,
      path: BASE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() vérifie le jeton et le rafraîchit si besoin.
  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  const isLoginPage = path === `${BASE}/connexion` || path.startsWith(`${BASE}/connexion/`);

  if (!data?.claims && !isLoginPage) {
    const redirect = NextResponse.redirect(new URL(`${BASE}/connexion`, request.url));
    // Conserver les cookies éventuellement mis à jour (ex. session expirée nettoyée).
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  }

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin-v2/:path*"],
};
