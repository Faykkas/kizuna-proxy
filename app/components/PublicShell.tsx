"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../lib/auth";
import { LanguageProvider } from "../lib/language";
import ContactWidget from "./ContactWidget";
import CookieConsent from "./CookieConsent";
import StickyRequestBar from "./StickyRequestBar";
import ChristmasTheme from "./ChristmasTheme";

// Tout ce qui ne sert qu'au site PUBLIC : session client, langue du site, bouton de contact, bannière cookies,
// scripts tiers (Trustpilot) et statistiques de visite. L'admin-v2 (/admin-v2) est un espace privé qui n'en a
// pas besoin : on ne le charge pas, ce qui allège chaque page de l'admin et évite de compter ses visites.
const isAdminV2 = (pathname: string | null) => pathname === "/admin-v2" || !!pathname?.startsWith("/admin-v2/");

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAdminV2(pathname)) return <>{children}</>;
  return (
    <>
      <AuthProvider>
        <LanguageProvider>
          {children}
          <ContactWidget />
          <CookieConsent />
          <StickyRequestBar />
          <ChristmasTheme />
        </LanguageProvider>
      </AuthProvider>
      <Analytics />
    </>
  );
}
