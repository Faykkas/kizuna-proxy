"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "../lib/supabase-browser";
import { BASE } from "../lib/config";
import { useL } from "./LangProvider";

const ICONS: Record<string, ReactNode> = {
  dashboard: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />,
  orders: <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zM4 7l8 4m0 0l8-4m-8 4v10" />,
  inbox: <path d="M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5" />,
  clients: <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0" />,
  accounting: <path d="M4 19V5m0 14h16M8 15V9m4 6V6m4 9v-4" />,
  links: <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1m1 9a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />,
  shop: <path d="M4 7h16l-1 12H5L4 7zm4 0a4 4 0 018 0" />,
  content: <path d="M5 4h14v16H5V4zm3 4h8M8 12h8M8 16h5" />,
  settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 00-2-1.2L14.6 3h-4l-.4 2.6a7.6 7.6 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 000 2.4l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 002 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />,
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const ITEMS = [
  { href: BASE, label: "Tableau de bord", icon: "dashboard", exact: true },
  { href: `${BASE}/commandes`, label: "Commandes", icon: "orders" },
  { href: `${BASE}/demandes`, label: "Demandes", icon: "inbox" },
  { href: `${BASE}/clients`, label: "Clients", icon: "clients" },
  { href: `${BASE}/liens-de-paiement`, label: "Liens de paiement", icon: "links" },
  { href: `${BASE}/boutique`, label: "Boutique", icon: "shop" },
  { href: `${BASE}/comptabilite`, label: "Comptabilité", icon: "accounting" },
  { href: `${BASE}/galerie`, label: "Galerie", icon: "content" },
  { href: `${BASE}/actualites`, label: "Actualités", icon: "content" },
  { href: `${BASE}/bandeau`, label: "Bandeau d'annonce", icon: "content" },
  { href: `${BASE}/parametres`, label: "Paramètres", icon: "settings" },
];

export function NavLinks() {
  const pathname = usePathname();
  const { t } = useL();
  return (
    <nav className="av2-nav" aria-label={t("Navigation principale")}>
      {ITEMS.map((it) => {
        if (!it.href) {
          return (
            <span key={it.label} className="av2-nav-soon" aria-disabled="true">
              <Icon name={it.icon} />
              <span>{t(it.label)}</span>
              <span className="av2-tag muted">{t("À venir")}</span>
            </span>
          );
        }
        const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined}>
            <Icon name={it.icon} />
            <span>{t(it.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

type Theme = "auto" | "light" | "dark";
const themeListeners = new Set<() => void>();
let themeOverride: Theme | null = null; // repli si localStorage est indisponible

function readTheme(): Theme {
  if (themeOverride) return themeOverride;
  try {
    const saved = localStorage.getItem("av2-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* stockage indisponible : thème système */
  }
  return "auto";
}

export function ThemeToggle() {
  const { t } = useL();
  const theme = useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    readTheme,
    () => "auto" as Theme,
  );

  useEffect(() => {
    const root = document.querySelector(".av2-root");
    if (!root) return;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  function cycle() {
    const next: Theme = theme === "auto" ? "dark" : theme === "dark" ? "light" : "auto";
    themeOverride = next;
    try {
      if (next === "auto") localStorage.removeItem("av2-theme");
      else localStorage.setItem("av2-theme", next);
    } catch {
      /* ignoré : le repli mémoire suffit pour la session */
    }
    themeListeners.forEach((l) => l());
  }

  const label = theme === "auto" ? t("Thème : auto") : theme === "dark" ? t("Thème : sombre") : t("Thème : clair");
  return (
    <button type="button" onClick={cycle} title={t("Changer le thème (auto / sombre / clair)")}>
      {label}
    </button>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useL();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await createBrowserSupabase().auth.signOut();
        } finally {
          router.replace(`${BASE}/connexion`);
          router.refresh();
        }
      }}
    >
      {busy ? t("Déconnexion…") : t("Se déconnecter")}
    </button>
  );
}
