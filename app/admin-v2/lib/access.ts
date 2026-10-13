import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { BASE, IS_PRODUCTION, REQUIRE_MFA } from "./config";
import { createServerSupabase } from "./supabase-server";

// Contrôle d'accès CÔTÉ SERVEUR. Chaque page de l'admin-v2 appelle
// requireAccess() : on ne fait jamais confiance au navigateur.
//
// Conditions pour entrer :
//   1. session valide (jeton vérifié) ;
//   2. rôle « admin » ou « staff » dans app_metadata (jamais user_metadata,
//      que l'utilisateur peut modifier lui-même) ;
//   3. second facteur validé (aal2) — obligatoire en production ;
//   4. compte présent, actif et de même rôle dans admin_users (permet de
//      couper un accès immédiatement). Si la table n'existe pas encore
//      (migration phase 0 non appliquée), l'accès n'est toléré qu'en
//      développement local, avec un bandeau d'avertissement.

export type Role = "admin" | "staff";

export type Access = {
  userId: string;
  email: string;
  role: Role;
  displayName: string;
  mfaVerified: boolean;
  /** true = la table admin_users n'existe pas (dev local uniquement). */
  rosterMissing: boolean;
};

export type DenyReason =
  | "no_role" // connecté mais ni admin ni staff
  | "not_in_roster" // absent de admin_users
  | "inactive" // compte désactivé
  | "role_mismatch"; // rôle du jeton ≠ rôle enregistré

type Outcome =
  | { kind: "ok"; access: Access }
  | { kind: "anonymous" }
  | { kind: "mfa" }
  | { kind: "denied"; reason: DenyReason };

const TABLE_MISSING = new Set(["42P01", "PGRST205"]);

type Claims = { sub?: string; email?: string; aal?: string; app_metadata?: { role?: string } };

const evaluate = cache(async (): Promise<Outcome> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as Claims | undefined;
  if (!claims?.sub) return { kind: "anonymous" };

  const role = claims.app_metadata?.role;
  if (role !== "admin" && role !== "staff") return { kind: "denied", reason: "no_role" };

  const mfaVerified = claims.aal === "aal2";
  if (REQUIRE_MFA && !mfaVerified) return { kind: "mfa" };

  let displayName = (claims.email as string | undefined) ?? "Utilisateur";
  let rosterMissing = false;

  // En développement avec MFA désactivé, la RLS (qui exige aal2) masquerait la
  // liste : on ne la consulte pas. Jamais le cas en production.
  if (REQUIRE_MFA) {
    const { data: row, error } = await supabase
      .from("admin_users")
      .select("role, is_active, display_name")
      .eq("user_id", claims.sub)
      .maybeSingle();

    if (error) {
      const missing = TABLE_MISSING.has(error.code);
      if (missing && !IS_PRODUCTION) {
        rosterMissing = true;
      } else {
        return { kind: "denied", reason: "not_in_roster" };
      }
    } else if (!row) {
      return { kind: "denied", reason: "not_in_roster" };
    } else if (!row.is_active) {
      return { kind: "denied", reason: "inactive" };
    } else if (row.role !== role) {
      return { kind: "denied", reason: "role_mismatch" };
    } else {
      displayName = row.display_name;
    }
  } else {
    rosterMissing = true;
  }

  return {
    kind: "ok",
    access: { userId: claims.sub, email: claims.email ?? "", role, displayName, mfaVerified, rosterMissing },
  };
});

/** À appeler en tête de CHAQUE page protégée. Redirige si l'accès n'est pas accordé. */
export async function requireAccess(opts: { adminOnly?: boolean } = {}): Promise<Access> {
  const outcome = await evaluate();
  if (outcome.kind === "anonymous") redirect(`${BASE}/connexion`);
  if (outcome.kind === "mfa") redirect(`${BASE}/mfa`);
  if (outcome.kind === "denied") redirect(`${BASE}/refuse?raison=${outcome.reason}`);
  if (opts.adminOnly && outcome.access.role !== "admin") redirect(`${BASE}/refuse?raison=admin_only`);
  return outcome.access;
}

/** Pour la page MFA : exige une session, sans exiger le second facteur. */
export async function requireSession(): Promise<{ email: string; role: Role | null }> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as Claims | undefined;
  if (!claims?.sub) redirect(`${BASE}/connexion`);
  const role = claims.app_metadata?.role;
  if (role !== "admin" && role !== "staff") redirect(`${BASE}/refuse?raison=no_role`);
  return { email: claims.email ?? "", role };
}
