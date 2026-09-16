import type { Metadata } from "next";
import GrilleTarifaireClient from "./GrilleTarifaireClient";

export const metadata: Metadata = {
  title: "Grille tarifaire — Kizuna Proxy",
  description: "Grille tarifaire détaillée Kizuna Proxy.",
  robots: { index: false, follow: false, nocache: true },
};

export default function GrilleTarifairePage() {
  return <GrilleTarifaireClient />;
}
