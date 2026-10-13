import type { Metadata } from "next";
import "./admin-v2.css";
import { getLang } from "./lib/lang-server";
import { LangProvider } from "./components/LangProvider";

// Pas d'indexation, pas de suivi : espace privé.
export const metadata: Metadata = {
  title: "Administration — Kizuna Proxy",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function AdminV2Layout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <div className="av2-root" lang={lang}>
      <LangProvider lang={lang}>{children}</LangProvider>
    </div>
  );
}
