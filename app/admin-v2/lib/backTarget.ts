// Adresse du lien « ← Retour » d'une fiche : la dernière liste filtrée visitée, mais seulement si elle
// appartient bien à la même liste (jamais une adresse arbitraire venue du stockage).
export function resolveBack(saved: string | null, fallback: string): string {
  if (saved && (saved === fallback || saved.startsWith(`${fallback}?`))) return saved;
  return fallback;
}
