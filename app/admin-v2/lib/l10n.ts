// Tout ce qui dépend de la langue, regroupé : traduction des textes + formats de date et de mois.
// Les montants (« ¥1,234 ») sont identiques dans les deux langues.

import { makeT, localeOf, type Lang } from "./i18n.ts";
import { formatDateFr, formatDateTimeFr, formatShortDateTimeFr, monthLabelFr, monthShortFr, statusInfo } from "./status.ts";

export function makeL(lang: Lang) {
  const t = makeT(lang);
  const locale = localeOf(lang);
  return {
    lang,
    locale,
    t,
    date: (v: string | null | undefined) => formatDateFr(v, locale),
    dateTime: (v: string | null | undefined) => formatDateTimeFr(v, locale),
    shortDateTime: (v: string | null | undefined) => formatShortDateTimeFr(v, locale),
    monthLabel: (m: string) => monthLabelFr(m, locale),
    monthShort: (m: string) => monthShortFr(m, locale),
    /** Libellé traduit d'un statut de commande. */
    statusLabel: (s: string | null | undefined) => t(statusInfo(s).label),
  };
}

export type L = ReturnType<typeof makeL>;
