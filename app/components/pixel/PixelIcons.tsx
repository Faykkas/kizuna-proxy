// @ts-nocheck
// app/components/pixel/PixelIcons.tsx
// Icônes en pixel art dessinées sur grille 16×16.
// Vectorielles : nettes à toutes les tailles, ~300 octets pièce.
"use client";

const P = ({ x, y, w = 1, h = 1, c }) => <rect x={x} y={y} width={w} height={h} fill={c} />;

function Sprite({ size = 48, children, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 18"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      {children}
    </svg>
  );
}

/* ── CATÉGORIES ────────────────────────────────────────────────────────── */

export function IconCards({ size = 48 }) {
  return (
    <Sprite size={size} label="Trading cards">
      <P x={2} y={1} w={12} h={16} c="var(--px-accent)" />
      <P x={3} y={2} w={10} h={14} c="var(--px-bg)" />
      <P x={4} y={3} w={8} h={6} c="var(--px-accent2)" />
      <P x={6} y={4} w={4} h={4} c="var(--px-ink)" />
      <P x={4} y={10} w={8} h={1} c="var(--px-muted)" />
      <P x={4} y={12} w={6} h={1} c="var(--px-muted)" />
      <P x={4} y={14} w={7} h={1} c="var(--px-muted)" />
    </Sprite>
  );
}

export function IconSneaker({ size = 48 }) {
  return (
    <Sprite size={size} label="Limited drops">
      <P x={0} y={9} w={3} h={4} c="var(--px-ink)" />
      <P x={3} y={7} w={3} h={6} c="var(--px-ink)" />
      <P x={6} y={5} w={4} h={8} c="var(--px-accent)" />
      <P x={10} y={7} w={6} h={6} c="var(--px-accent)" />
      <P x={0} y={13} w={16} h={2} c="var(--px-accent2)" />
      <P x={7} y={7} w={2} h={2} c="var(--px-bg)" />
      <P x={11} y={9} w={4} h={1} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconFigure({ size = 48 }) {
  return (
    <Sprite size={size} label="Figures">
      <P x={5} y={1} w={6} h={5} c="var(--px-accent2)" />
      <P x={6} y={2} w={1} h={2} c="var(--px-bg)" />
      <P x={9} y={2} w={1} h={2} c="var(--px-bg)" />
      <P x={4} y={6} w={8} h={6} c="var(--px-accent)" />
      <P x={3} y={7} w={1} h={4} c="var(--px-accent)" />
      <P x={12} y={7} w={1} h={4} c="var(--px-accent)" />
      <P x={5} y={12} w={2} h={4} c="var(--px-muted)" />
      <P x={9} y={12} w={2} h={4} c="var(--px-muted)" />
      <P x={4} y={16} w={8} h={1} c="var(--px-border)" />
    </Sprite>
  );
}

export function IconGaming({ size = 48 }) {
  return (
    <Sprite size={size} label="Gaming">
      <P x={1} y={5} w={14} h={8} c="var(--px-muted)" />
      <P x={0} y={7} w={1} h={4} c="var(--px-muted)" />
      <P x={15} y={7} w={1} h={4} c="var(--px-muted)" />
      <P x={3} y={8} w={1} h={3} c="var(--px-bg)" />
      <P x={2} y={9} w={3} h={1} c="var(--px-bg)" />
      <P x={11} y={7} w={2} h={2} c="var(--px-accent)" />
      <P x={13} y={10} w={2} h={2} c="var(--px-red)" />
      <P x={6} y={7} w={4} h={4} c="var(--px-bg)" />
      <P x={7} y={8} w={2} h={2} c="var(--px-accent)" />
    </Sprite>
  );
}

export function IconMarketplace({ size = 48 }) {
  return (
    <Sprite size={size} label="Marketplaces">
      <P x={5} y={1} w={1} h={3} c="var(--px-accent2)" />
      <P x={10} y={1} w={1} h={3} c="var(--px-accent2)" />
      <P x={6} y={0} w={4} h={1} c="var(--px-accent2)" />
      <P x={2} y={4} w={12} h={12} c="var(--px-accent)" />
      <P x={3} y={5} w={10} h={10} c="var(--px-bg)" />
      <P x={5} y={7} w={6} h={1} c="var(--px-ink)" />
      <P x={5} y={9} w={6} h={1} c="var(--px-muted)" />
      <P x={5} y={11} w={4} h={1} c="var(--px-muted)" />
    </Sprite>
  );
}

export function IconStore({ size = 48 }) {
  return (
    <Sprite size={size} label="Tokyo stores">
      <P x={0} y={4} w={16} h={2} c="var(--px-red)" />
      <P x={1} y={2} w={14} h={2} c="var(--px-accent2)" />
      <P x={2} y={6} w={12} h={9} c="var(--px-surface)" />
      <P x={2} y={6} w={12} h={1} c="var(--px-border)" />
      <P x={4} y={8} w={4} h={7} c="var(--px-accent)" />
      <P x={10} y={8} w={3} h={4} c="var(--px-bg)" />
      <P x={11} y={9} w={1} h={2} c="var(--px-accent)" />
      <P x={1} y={15} w={14} h={1} c="var(--px-border)" />
    </Sprite>
  );
}

/* ── STATUTS DE COMMANDE ───────────────────────────────────────────────── */

export function IconCheck({ size = 32 }) {
  return (
    <Sprite size={size} label="Completed">
      <P x={12} y={4} w={2} h={2} c="var(--px-accent)" />
      <P x={10} y={6} w={2} h={2} c="var(--px-accent)" />
      <P x={8} y={8} w={2} h={2} c="var(--px-accent)" />
      <P x={6} y={10} w={2} h={2} c="var(--px-accent)" />
      <P x={4} y={8} w={2} h={2} c="var(--px-accent)" />
      <P x={2} y={6} w={2} h={2} c="var(--px-accent)" />
    </Sprite>
  );
}

export function IconTruck({ size = 32 }) {
  return (
    <Sprite size={size} label="Shipped">
      <P x={1} y={5} w={8} h={6} c="var(--px-accent)" />
      <P x={9} y={7} w={3} h={4} c="var(--px-accent2)" />
      <P x={12} y={8} w={2} h={3} c="var(--px-accent2)" />
      <P x={2} y={12} w={2} h={2} c="var(--px-ink)" />
      <P x={10} y={12} w={2} h={2} c="var(--px-ink)" />
      <P x={3} y={7} w={4} h={2} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconBox({ size = 32 }) {
  return (
    <Sprite size={size} label="Package">
      <P x={2} y={5} w={12} h={9} c="var(--px-accent)" />
      <P x={2} y={5} w={12} h={2} c="var(--px-accent2)" />
      <P x={7} y={5} w={2} h={9} c="var(--px-red)" />
      <P x={2} y={8} w={12} h={1} c="var(--px-red)" />
      <P x={5} y={2} w={2} h={3} c="var(--px-red)" />
      <P x={9} y={2} w={2} h={3} c="var(--px-red)" />
    </Sprite>
  );
}

export function IconHourglass({ size = 32 }) {
  return (
    <Sprite size={size} label="Pending">
      <P x={3} y={2} w={10} h={2} c="var(--px-muted)" />
      <P x={3} y={12} w={10} h={2} c="var(--px-muted)" />
      <P x={5} y={4} w={6} h={2} c="var(--px-accent2)" />
      <P x={6} y={6} w={4} h={2} c="var(--px-accent2)" />
      <P x={7} y={8} w={2} h={1} c="var(--px-accent2)" />
      <P x={6} y={9} w={4} h={3} c="var(--px-accent)" />
    </Sprite>
  );
}

export const CATEGORY_ICONS = [
  IconMarketplace,
  IconCards,
  IconSneaker,
  IconFigure,
  IconGaming,
  IconStore,
];

/* ── NAV GUIDES / ADMIN / MISC CONTENT ICONS ──────────────────────────────
   Same Sprite/P primitives as above — kept in this file so every "content"
   glyph (as opposed to functional UI controls, see icons/UiIcons.tsx) shares
   one visual language and re-themes together via the --px-* tokens. */

export function IconShoppingBag({ size = 48 }) {
  return (
    <Sprite size={size} label="Marketplace">
      <P x={5} y={2} w={1} h={3} c="var(--px-muted)" />
      <P x={10} y={2} w={1} h={3} c="var(--px-muted)" />
      <P x={5} y={2} w={6} h={1} c="var(--px-muted)" />
      <P x={3} y={5} w={10} h={11} c="var(--px-accent)" />
      <P x={3} y={5} w={10} h={2} c="var(--px-accent2)" />
      <P x={6} y={9} w={4} h={1} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconAuction({ size = 48 }) {
  return (
    <Sprite size={size} label="Auctions">
      <P x={8} y={1} w={5} h={4} c="var(--px-accent)" />
      <P x={5} y={4} w={5} h={4} c="var(--px-accent)" />
      <P x={3} y={9} w={7} h={2} c="var(--px-accent2)" />
      <P x={3} y={11} w={2} h={5} c="var(--px-ink)" />
      <P x={1} y={16} w={7} h={1} c="var(--px-border)" />
    </Sprite>
  );
}

export function IconApparel({ size = 48 }) {
  return (
    <Sprite size={size} label="Apparel">
      <P x={5} y={2} w={6} h={2} c="var(--px-muted)" />
      <P x={2} y={3} w={3} h={3} c="var(--px-accent2)" />
      <P x={11} y={3} w={3} h={3} c="var(--px-accent2)" />
      <P x={4} y={4} w={8} h={12} c="var(--px-accent)" />
      <P x={7} y={4} w={2} h={2} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconEvent({ size = 48 }) {
  return (
    <Sprite size={size} label="Events">
      <P x={1} y={4} w={14} h={2} c="var(--px-red)" />
      <P x={3} y={1} w={2} h={4} c="var(--px-red)" />
      <P x={11} y={1} w={2} h={4} c="var(--px-red)" />
      <P x={3} y={6} w={2} h={10} c="var(--px-accent2)" />
      <P x={11} y={6} w={2} h={10} c="var(--px-accent2)" />
      <P x={1} y={16} w={14} h={1} c="var(--px-border)" />
    </Sprite>
  );
}

export function IconBusiness({ size = 48 }) {
  return (
    <Sprite size={size} label="Business">
      <P x={6} y={2} w={4} h={2} c="var(--px-muted)" />
      <P x={2} y={5} w={12} h={9} c="var(--px-accent)" />
      <P x={2} y={5} w={12} h={2} c="var(--px-accent2)" />
      <P x={7} y={5} w={2} h={9} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconRequests({ size = 32 }) {
  return (
    <Sprite size={size} label="Requests">
      <P x={2} y={3} w={12} h={9} c="var(--px-surface)" />
      <P x={2} y={3} w={12} h={9} c="var(--px-border)" />
      <P x={3} y={4} w={10} h={7} c="var(--px-bg)" />
      <P x={1} y={11} w={14} h={4} c="var(--px-accent)" />
      <P x={1} y={11} w={5} h={1} c="var(--px-accent2)" />
      <P x={10} y={11} w={5} h={1} c="var(--px-accent2)" />
    </Sprite>
  );
}

export function IconCustomers({ size = 32 }) {
  return (
    <Sprite size={size} label="Customers">
      <P x={6} y={2} w={4} h={4} c="var(--px-ink)" />
      <P x={3} y={7} w={10} h={8} c="var(--px-accent)" />
      <P x={5} y={9} w={2} h={2} c="var(--px-bg)" />
      <P x={9} y={9} w={2} h={2} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconStats({ size = 32 }) {
  return (
    <Sprite size={size} label="Stats">
      <P x={2} y={10} w={3} h={6} c="var(--px-accent2)" />
      <P x={6} y={6} w={3} h={10} c="var(--px-accent)" />
      <P x={10} y={9} w={3} h={7} c="var(--px-accent2)" />
      <P x={1} y={16} w={14} h={1} c="var(--px-border)" />
    </Sprite>
  );
}

export function IconGallery({ size = 32 }) {
  return (
    <Sprite size={size} label="Gallery">
      <P x={1} y={2} w={14} h={12} c="var(--px-border)" />
      <P x={2} y={3} w={12} h={10} c="var(--px-bg)" />
      <P x={3} y={9} w={4} h={3} c="var(--px-accent)" />
      <P x={9} y={7} w={4} h={5} c="var(--px-accent2)" />
      <P x={4} y={4} w={2} h={2} c="var(--px-muted)" />
    </Sprite>
  );
}

export function IconNews({ size = 32 }) {
  return (
    <Sprite size={size} label="News">
      <P x={2} y={2} w={11} h={13} c="var(--px-bg)" />
      <P x={2} y={2} w={11} h={13} c="var(--px-border)" />
      <P x={4} y={4} w={5} h={4} c="var(--px-accent)" />
      <P x={4} y={9} w={7} h={1} c="var(--px-muted)" />
      <P x={4} y={11} w={7} h={1} c="var(--px-muted)" />
      <P x={4} y={13} w={5} h={1} c="var(--px-muted)" />
    </Sprite>
  );
}

export function IconBanner({ size = 32 }) {
  return (
    <Sprite size={size} label="Banner">
      <P x={1} y={5} w={5} h={4} c="var(--px-accent)" />
      <P x={6} y={3} w={6} h={8} c="var(--px-accent2)" />
      <P x={12} y={6} w={2} h={2} c="var(--px-red)" />
      <P x={3} y={9} w={2} h={5} c="var(--px-muted)" />
    </Sprite>
  );
}

export function IconCharges({ size = 32 }) {
  return (
    <Sprite size={size} label="Charges">
      <P x={4} y={2} w={8} h={12} c="var(--px-accent2)" />
      <P x={7} y={4} w={2} h={1} c="var(--px-bg)" />
      <P x={7} y={5} w={2} h={6} c="var(--px-bg)" />
      <P x={5} y={11} w={6} h={1} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconBook({ size = 32 }) {
  return (
    <Sprite size={size} label="Manga">
      <P x={3} y={2} w={10} h={13} c="var(--px-accent)" />
      <P x={3} y={2} w={2} h={13} c="var(--px-accent2)" />
      <P x={6} y={5} w={5} h={1} c="var(--px-bg)" />
      <P x={6} y={7} w={5} h={1} c="var(--px-bg)" />
      <P x={6} y={9} w={3} h={1} c="var(--px-bg)" />
    </Sprite>
  );
}

export function IconPaymentLink({ size = 32 }) {
  return (
    <Sprite size={size} label="Payment link">
      <P x={1} y={4} w={14} h={9} c="var(--px-accent)" />
      <P x={1} y={4} w={14} h={2} c="var(--px-red)" />
      <P x={3} y={9} w={5} h={2} c="var(--px-bg)" />
    </Sprite>
  );
}
