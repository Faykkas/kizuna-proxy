import type { Metadata } from "next";
import "./admin-v2.css";

// Pas d'indexation, pas de suivi : espace privé.
export const metadata: Metadata = {
  title: "Administration — Kizuna Proxy",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminV2Layout({ children }: { children: React.ReactNode }) {
  return <div className="av2-root">{children}</div>;
}
