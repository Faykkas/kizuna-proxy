// Montants en yens : TOUJOURS des entiers (le yen n'a pas de décimales).
// Aucune arithmétique en flottants : les valeurs non entières sont signalées,
// jamais silencieusement arrondies.

// Format « ¥1,234 » : le même en français et en japonais (c'est aussi celui du site public et de l'ancienne admin).
export function formatJPY(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n < 0 ? "-" : ""}¥${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Convertit une valeur de la base en entier de yens (null → 0). */
export function toYen(value: unknown): { yen: number; exact: boolean } {
  if (value == null || value === "") return { yen: 0, exact: true };
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return { yen: 0, exact: false };
  const yen = Math.round(n);
  return { yen, exact: yen === n };
}

/** Pourcentage entier (arrondi inférieur), sans flottant intermédiaire fragile. */
export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.floor((part * 100) / whole);
}
