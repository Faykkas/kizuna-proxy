"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// Formulaire de filtres des listes. Navigation « douce » (sans rechargement complet de la page) et les
// menus déroulants s'appliquent dès qu'on change la valeur : plus besoin de cliquer sur « Filtrer ».
// Le filtre vit dans l'adresse (?statut=…), donc le bouton retour du navigateur fonctionne.

export default function FilterForm({ action, className, children }: { action: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function go(form: HTMLFormElement) {
    const sp = new URLSearchParams();
    for (const [k, v] of new FormData(form)) {
      if (typeof v === "string" && v.trim()) sp.set(k, v.trim());
    }
    const qs = sp.toString();
    start(() => router.push(qs ? `${action}?${qs}` : action));
  }

  return (
    <form
      method="get"
      action={action}
      className={className}
      role="search"
      aria-busy={pending}
      style={pending ? { opacity: 0.65, transition: "opacity .15s" } : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        go(e.currentTarget);
      }}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement) go(e.currentTarget);
      }}
    >
      {children}
    </form>
  );
}
