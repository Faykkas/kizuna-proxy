"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { makeL, type L } from "../lib/l10n";
import type { Lang } from "../lib/i18n";

const LangContext = createContext<L>(makeL("fr"));

// La langue vient du cookie, lu côté serveur par le layout : le même texte s'affiche côté serveur et dans le
// navigateur (pas de « clignotement » français → japonais).
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => makeL(lang), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** Traducteur et formats de date pour les composants « client ». */
export function useL(): L {
  return useContext(LangContext);
}
