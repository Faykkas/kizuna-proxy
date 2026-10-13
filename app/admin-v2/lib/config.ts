// Réglages de l'admin-v2 (phase 0).
//
// Ces valeurs deviendront des réglages en base (phase 1). En attendant, elles
// vivent ici, à UN seul endroit, avec leur origine.

/** Objectif mensuel de commissions, en yens — communiqué par Samuel le 2026-10-13. */
export const MONTHLY_GOAL_JPY = 300_000;

/** Objectif suivant, une fois le premier atteint — communiqué le 2026-10-13. */
export const NEXT_GOAL_JPY = 500_000;

/** Nom du cookie de session. Distinct de l'ancienne admin et du site public. */
export const SESSION_COOKIE = "kz-admin-v2";

/** Chemin de base de l'admin-v2. */
export const BASE = "/admin-v2";

/** Durée maximale d'une session navigateur (secondes). */
export const SESSION_MAX_AGE = 60 * 60 * 12;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * MFA : obligatoire en production, toujours. En développement local, il peut
 * être désactivé avec ADMIN_V2_REQUIRE_MFA=false (ignoré en production).
 */
export const REQUIRE_MFA = IS_PRODUCTION || process.env.ADMIN_V2_REQUIRE_MFA !== "false";
