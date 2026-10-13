import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang, type Lang } from "./i18n";
import { makeL } from "./l10n";

// Langue choisie par la personne connectée (cookie), lue côté serveur. Une seule lecture par requête.
export const getLang = cache(async (): Promise<Lang> => normalizeLang((await cookies()).get(LANG_COOKIE)?.value));

/** Traducteur + formats de date pour les composants serveur et les actions serveur. */
export async function getL() {
  return makeL(await getLang());
}
