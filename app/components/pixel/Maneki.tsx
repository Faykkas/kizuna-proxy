// @ts-nocheck
// app/components/pixel/Maneki.tsx
// Mascotte Kizuna : maneki-neko en pixel art.
// Le chat porte-bonheur des commerces japonais — la patte levée appelle la
// clientèle, ce qui est exactement le métier : quelqu'un à Tokyo qui fait
// venir les choses jusqu'à toi.
//
// Chaque page a son objet : des pièces sur les tarifs, un colis sur la
// livraison, une carte sur les services, un cœur sur les avis.
"use client";

const P = ({ x, y, w = 1, h = 1, c }) => <rect x={x} y={y} width={w} height={h} fill={c} />;

/* ── OBJETS TENUS PAR LE CHAT ────────────────────────────────────────────── */

const PROPS = {
  /** Colis kraft avec ruban rouge — livraison, suivi de commande */
  parcel: (
    <>
      <P x={13} y={10} w={6} h={5} c="var(--px-kraft)" />
      <P x={13} y={10} w={6} c="var(--px-kraft-l)" />
      <P x={15} y={10} w={2} h={5} c="var(--px-red)" />
      <P x={13} y={12} w={6} c="var(--px-red)" />
    </>
  ),

  /** Pièces empilées — page tarifs */
  coins: (
    <>
      <P x={14} y={13} w={5} h={2} c="var(--px-kraft)" />
      <P x={14} y={13} w={5} c="var(--px-kraft-l)" />
      <P x={15} y={11} w={4} h={2} c="var(--px-kraft)" />
      <P x={15} y={11} w={4} c="var(--px-kraft-l)" />
      <P x={16} y={9} w={3} h={2} c="var(--px-kraft)" />
      <P x={16} y={9} w={3} c="var(--px-kraft-l)" />
      <P x={17} y={10} c="var(--px-bg)" />
    </>
  ),

  /** Carte à collectionner — page services */
  card: (
    <>
      <P x={14} y={8} w={5} h={7} c="var(--px-accent2)" />
      <P x={15} y={9} w={3} h={5} c="var(--px-bg)" />
      <P x={15} y={9} w={3} h={2} c="var(--px-accent)" />
      <P x={16} y={12} c="var(--px-muted)" />
      <P x={15} y={13} w={3} c="var(--px-muted)" />
    </>
  ),

  /** Loupe — recherche */
  glass: (
    <>
      <P x={14} y={8} w={4} c="var(--px-accent)" />
      <P x={13} y={9} h={3} c="var(--px-accent)" />
      <P x={18} y={9} h={3} c="var(--px-accent)" />
      <P x={14} y={12} w={4} c="var(--px-accent)" />
      <P x={14} y={9} w={4} h={3} c="var(--px-accent2)" />
      <P x={18} y={13} c="var(--px-accent)" />
      <P x={19} y={14} c="var(--px-accent)" />
    </>
  ),

  /** Cœur — page avis clients */
  heart: (
    <>
      <P x={14} y={9} w={2} c="var(--px-red)" />
      <P x={17} y={9} w={2} c="var(--px-red)" />
      <P x={13} y={10} w={7} c="var(--px-red)" />
      <P x={14} y={11} w={5} c="var(--px-red)" />
      <P x={15} y={12} w={3} c="var(--px-red)" />
      <P x={16} y={13} c="var(--px-red)" />
      <P x={14} y={9} c="var(--px-pink)" />
      <P x={14} y={10} c="var(--px-pink)" />
    </>
  ),

  /** Enveloppe — page demande, contact */
  mail: (
    <>
      <P x={13} y={10} w={7} h={5} c="var(--px-surface)" />
      <P x={13} y={10} w={7} c="var(--px-accent)" />
      <P x={14} y={11} w={5} c="var(--px-accent)" />
      <P x={15} y={12} w={3} c="var(--px-accent)" />
      <P x={16} y={13} c="var(--px-accent)" />
      <P x={13} y={14} w={7} c="var(--px-border)" />
    </>
  ),

  /** Panneau — page comment ça marche */
  sign: (
    <>
      <P x={13} y={8} w={7} h={5} c="var(--px-kraft)" />
      <P x={13} y={8} w={7} c="var(--px-kraft-l)" />
      <P x={14} y={10} w={5} c="var(--px-bg)" />
      <P x={14} y={11} w={3} c="var(--px-bg)" />
      <P x={16} y={13} h={3} c="var(--px-border)" />
    </>
  ),
};

/**
 * @param state "idle" | "success"  — success = yeux souriants + étincelles
 * @param prop  clé de PROPS : parcel, coins, card, glass, heart, mail, sign
 * @param size  largeur en px
 * @param float active l'oscillation verticale
 * @param flip  retourne le chat horizontalement
 */
export default function Maneki({
  state = "idle",
  prop = null,
  size = 120,
  float = false,
  flip = false,
}) {
  const held = prop && PROPS[prop] ? PROPS[prop] : null;
  // La patte se lève dès qu'il tient quelque chose ou qu'il célèbre
  const pawUp = held || state === "success";

  const ears = (
    <>
      <P x={4} y={2} h={2} c="var(--px-ink)" />
      <P x={3} y={3} h={2} c="var(--px-ink)" />
      <P x={11} y={2} h={2} c="var(--px-ink)" />
      <P x={12} y={3} h={2} c="var(--px-ink)" />
      <P x={4} y={3} c="var(--px-pink)" />
      <P x={11} y={3} c="var(--px-pink)" />
    </>
  );

  const head = (
    <>
      <P x={4} y={4} w={8} h={7} c="var(--px-ink)" />
      <P x={3} y={5} h={5} c="var(--px-ink)" />
      <P x={12} y={5} h={5} c="var(--px-ink)" />
    </>
  );

  const eyes =
    state === "success" ? (
      <>
        <P x={5} y={7} w={2} c="var(--px-bg)" />
        <P x={9} y={7} w={2} c="var(--px-bg)" />
        <P x={4} y={6} c="var(--px-bg)" />
        <P x={11} y={6} c="var(--px-bg)" />
      </>
    ) : (
      <>
        <P x={5} y={6} h={2} c="var(--px-bg)" />
        <P x={10} y={6} h={2} c="var(--px-bg)" />
        <P x={5} y={6} c="var(--px-accent)" />
        <P x={10} y={6} c="var(--px-accent)" />
      </>
    );

  const muzzle =
    state === "success" ? (
      <>
        <P x={7} y={8} w={2} c="var(--px-pink)" />
        <P x={6} y={9} w={4} c="var(--px-bg)" />
        <P x={5} y={9} c="var(--px-pink)" />
        <P x={10} y={9} c="var(--px-pink)" />
      </>
    ) : (
      <>
        <P x={7} y={8} w={2} c="var(--px-pink)" />
        <P x={6} y={9} c="var(--px-muted)" />
        <P x={9} y={9} c="var(--px-muted)" />
      </>
    );

  const body = (
    <>
      <P x={5} y={11} w={6} h={5} c="var(--px-ink)" />
      <P x={6} y={12} w={4} h={2} c="var(--px-red)" />
      <P x={7} y={12} w={2} h={2} c="var(--px-accent)" />
      <P x={5} y={16} w={2} c="var(--px-ink)" />
      <P x={9} y={16} w={2} c="var(--px-ink)" />
    </>
  );

  const paws = pawUp ? (
    <>
      <P x={2} y={9} h={3} c="var(--px-ink)" />
      <P x={1} y={7} w={2} h={2} c="var(--px-ink)" />
      <P x={11} y={12} h={3} c="var(--px-ink)" />
    </>
  ) : (
    <>
      <P x={4} y={12} h={3} c="var(--px-ink)" />
      <P x={11} y={12} h={3} c="var(--px-ink)" />
      <P x={12} y={13} c="var(--px-ink)" />
      <P x={13} y={12} c="var(--px-ink)" />
    </>
  );

  const sparkles = state === "success" && (
    <>
      <P x={0} y={4} c="var(--px-accent)" />
      <P x={15} y={5} c="var(--px-accent)" />
      <P x={2} y={1} c="var(--px-accent2)" />
      <P x={14} y={2} c="var(--px-accent2)" />
    </>
  );

  // Le viewBox s'élargit quand le chat tient un objet
  const vbW = held ? 20 : 16;

  return (
    <svg
      width={size}
      height={(size * 18) / vbW}
      viewBox={`0 0 ${vbW} 18`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kizuna mascot"
      className={float ? "px-float" : ""}
      style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}
    >
      {ears}
      {head}
      {eyes}
      {muzzle}
      {body}
      {paws}
      {held}
      {sparkles}
    </svg>
  );
}

/** Version compacte, sans objet */
export function ManekiMini({ size = 28 }) {
  return <Maneki state="idle" size={size} />;
}

/** Mascotte placée en coin de section, avec une petite bulle de texte */
export function ManekiCorner({ prop, state = "idle", size = 92, label }) {
  return (
    <div className="px-mascot-corner">
      {label && <span className="px-mascot-label">{label}</span>}
      <Maneki state={state} prop={prop} size={size} float />
    </div>
  );
}
