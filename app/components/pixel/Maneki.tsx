// @ts-nocheck
// app/components/pixel/Maneki.tsx
// Mascotte Kizuna : maneki-neko livreur en pixel art.
// Le chat porte-bonheur des commerces japonais — la patte levée appelle
// la clientèle, ce qui est exactement le métier : quelqu'un à Tokyo qui
// fait venir les choses jusqu'à toi.
"use client";

const P = ({ x, y, w = 1, h = 1, c }) => <rect x={x} y={y} width={w} height={h} fill={c} />;

/**
 * @param state "idle" | "delivery" | "success"
 * @param size  taille en px
 * @param float active la légère oscillation verticale
 */
export default function Maneki({ state = "idle", size = 120, float = false }) {
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

  const eyesOpen = (
    <>
      <P x={5} y={6} h={2} c="var(--px-bg)" />
      <P x={10} y={6} h={2} c="var(--px-bg)" />
      <P x={5} y={6} c="var(--px-accent)" />
      <P x={10} y={6} c="var(--px-accent)" />
    </>
  );

  const eyesHappy = (
    <>
      <P x={5} y={7} w={2} c="var(--px-bg)" />
      <P x={9} y={7} w={2} c="var(--px-bg)" />
      <P x={4} y={6} c="var(--px-bg)" />
      <P x={11} y={6} c="var(--px-bg)" />
    </>
  );

  const muzzle = (
    <>
      <P x={7} y={8} w={2} c="var(--px-pink)" />
      <P x={6} y={9} c="var(--px-muted)" />
      <P x={9} y={9} c="var(--px-muted)" />
    </>
  );

  const muzzleSmile = (
    <>
      <P x={7} y={8} w={2} c="var(--px-pink)" />
      <P x={6} y={9} w={4} c="var(--px-bg)" />
      <P x={5} y={9} c="var(--px-pink)" />
      <P x={10} y={9} c="var(--px-pink)" />
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

  const pawDown = (
    <>
      <P x={4} y={12} h={3} c="var(--px-ink)" />
      <P x={11} y={12} h={3} c="var(--px-ink)" />
      <P x={12} y={13} c="var(--px-ink)" />
      <P x={13} y={12} c="var(--px-ink)" />
    </>
  );

  const pawUp = (
    <>
      <P x={2} y={9} h={3} c="var(--px-ink)" />
      <P x={1} y={7} w={2} h={2} c="var(--px-ink)" />
      <P x={11} y={12} h={3} c="var(--px-ink)" />
    </>
  );

  const bothPawsUp = (
    <>
      <P x={2} y={9} h={3} c="var(--px-ink)" />
      <P x={1} y={7} w={2} h={2} c="var(--px-ink)" />
      <P x={13} y={9} h={3} c="var(--px-ink)" />
      <P x={13} y={7} w={2} h={2} c="var(--px-ink)" />
    </>
  );

  const parcel = (
    <>
      <P x={13} y={10} w={6} h={5} c="var(--px-kraft)" />
      <P x={13} y={10} w={6} c="var(--px-kraft-l)" />
      <P x={15} y={10} w={2} h={5} c="var(--px-red)" />
      <P x={13} y={12} w={6} c="var(--px-red)" />
    </>
  );

  const sparkles = (
    <>
      <P x={0} y={4} c="var(--px-accent)" />
      <P x={15} y={5} c="var(--px-accent)" />
      <P x={2} y={1} c="var(--px-accent2)" />
      <P x={14} y={2} c="var(--px-accent2)" />
    </>
  );

  const viewBox = state === "delivery" ? "0 0 20 18" : "0 0 16 18";

  return (
    <svg
      width={size}
      height={size * (18 / (state === "delivery" ? 20 : 16))}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kizuna mascot"
      className={float ? "px-float" : ""}
      style={{ display: "block" }}
    >
      {ears}
      {head}
      {state === "success" ? eyesHappy : eyesOpen}
      {state === "success" ? muzzleSmile : muzzle}
      {body}
      {state === "idle" && pawDown}
      {state === "delivery" && pawUp}
      {state === "success" && bothPawsUp}
      {state === "delivery" && parcel}
      {state === "success" && sparkles}
    </svg>
  );
}

/** Version compacte pour la nav ou le footer */
export function ManekiMini({ size = 28 }) {
  return <Maneki state="idle" size={size} />;
}
