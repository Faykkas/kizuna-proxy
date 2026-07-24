// @ts-nocheck
// app/components/pixel/PixelLogo.tsx
// Le kanji 絆 (kizuna — le lien qui unit) dessiné sur grille 16×16.
// Le radical 糸 (fil) à gauche, 半 (moitié) à droite : littéralement
// « le fil qui relie deux moitiés ». C'est le nom de la marque, et son sens.
"use client";

const P = ({ x, y, w = 1, h = 1, c }) => <rect x={x} y={y} width={w} height={h} fill={c} />;

export default function PixelLogo({ size = 40, showFrame = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kizuna Proxy"
      style={{ display: "block", flexShrink: 0 }}
    >
      {showFrame && (
        <>
          <P x={0} y={0} w={16} h={16} c="var(--px-accent)" />
          <P x={1} y={1} w={14} h={14} c="var(--px-bg)" />
          <P x={0} y={0} c="var(--px-bg)" />
          <P x={15} y={0} c="var(--px-bg)" />
          <P x={0} y={15} c="var(--px-bg)" />
          <P x={15} y={15} c="var(--px-bg)" />
        </>
      )}

      {/* 糸 — le radical « fil », à gauche */}
      <P x={3} y={3} w={2} h={1} c="var(--px-accent)" />
      <P x={4} y={4} w={1} h={1} c="var(--px-accent)" />
      <P x={2} y={5} w={4} h={1} c="var(--px-accent)" />
      <P x={4} y={6} w={1} h={2} c="var(--px-accent)" />
      <P x={2} y={8} w={5} h={1} c="var(--px-accent)" />
      <P x={4} y={9} w={1} h={2} c="var(--px-accent)" />
      <P x={2} y={11} w={1} h={1} c="var(--px-accent)" />
      <P x={4} y={11} w={1} h={1} c="var(--px-accent)" />
      <P x={6} y={11} w={1} h={1} c="var(--px-accent)" />

      {/* 半 — « moitié », à droite */}
      <P x={9} y={3} w={1} h={1} c="var(--px-accent2)" />
      <P x={12} y={3} w={1} h={1} c="var(--px-accent2)" />
      <P x={8} y={5} w={6} h={1} c="var(--px-accent2)" />
      <P x={10} y={4} w={1} h={4} c="var(--px-accent2)" />
      <P x={8} y={8} w={6} h={1} c="var(--px-accent2)" />
      <P x={10} y={9} w={1} h={4} c="var(--px-accent2)" />
    </svg>
  );
}

/** Logo complet avec le texte, pour la nav */
export function PixelLogoLockup({ size = 40 }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
      <PixelLogo size={size} />
      <span>
        <span className="logo-name">
          <span className="g">Kizuna</span> Proxy
        </span>
        <span className="logo-sub" style={{ display: "block" }}>
          Tokyo Proxy Service
        </span>
      </span>
    </span>
  );
}
