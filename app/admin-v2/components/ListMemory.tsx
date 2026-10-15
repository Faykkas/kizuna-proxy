"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveBack } from "../lib/backTarget";

// Mémorise la dernière adresse d'une liste filtrée (ex. /commandes?statut=Shipped&page=2) pour que le
// lien « ← Retour » d'une fiche ramène exactement là où l'on était, et pas sur la liste non filtrée.
// Stockage : sessionStorage (propre à l'onglet, vidé à la fermeture). Sans stockage, on retombe sur l'adresse par défaut.

const key = (name: string) => `av2-list:${name}`;

function read(name: string): string | null {
  try {
    return sessionStorage.getItem(key(name));
  } catch {
    return null;
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/** À placer dans une page de liste : enregistre son adresse (filtres et page compris). */
export function RememberList({ name }: { name: string }) {
  const pathname = usePathname();
  const qs = useSearchParams().toString();
  useEffect(() => {
    try {
      sessionStorage.setItem(key(name), pathname + (qs ? `?${qs}` : ""));
    } catch {
      /* stockage indisponible : le retour mènera à la liste par défaut */
    }
  }, [name, pathname, qs]);
  return null;
}

/** Lien de retour vers la liste mémorisée ; `fallback` est la liste par défaut (aussi utilisée avant l'hydratation). */
export function BackLink({ name, fallback, className, children }: { name: string; fallback: string; className?: string; children: ReactNode }) {
  const saved = useSyncExternalStore(subscribe, () => read(name), () => null);
  const href = resolveBack(saved, fallback);
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
