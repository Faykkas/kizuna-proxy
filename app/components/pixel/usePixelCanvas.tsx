// @ts-nocheck
// app/components/pixel/usePixelCanvas.tsx
// Remplace useSakuraCanvas. Deux couches :
//  1. Le mot KIZUNA qui se compose lettre par lettre sur une grille de pixels
//  2. Des pétales-pixels qui tombent en escalier (pas de diagonale lisse —
//     un vrai sprite d'époque se déplace par pas entiers)
"use client";

import { useEffect } from "react";

const GLYPHS = {
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
};

const WORD = ["K", "I", "Z", "U", "N", "A"];

export default function usePixelCanvas() {
  useEffect(() => {
    const cv = document.getElementById("hero-canvas");
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, raf, frame = 0;
    let px = 6;          // taille d'un pixel logique
    let cells = [];      // pixels du mot
    let petals = [];

    const ACCENT = "#a8e04a";
    const ACCENT2 = "#c77dff";
    const PINK = "#ff8fa3";

    function resize() {
      W = cv.offsetWidth;
      H = cv.offsetHeight;
      cv.width = W * devicePixelRatio;
      cv.height = H * devicePixelRatio;
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.scale(devicePixelRatio, devicePixelRatio);
      cx.imageSmoothingEnabled = false;
      build();
    }

    function build() {
      // Taille de pixel adaptée à la largeur : le mot occupe ~62% de l'écran
      const glyphW = 5, glyphH = 7, gap = 2;
      const totalCols = WORD.length * glyphW + (WORD.length - 1) * gap;
      // Contraint par la largeur ET la hauteur : le mot doit rester un
      // filigrane discret derrière le titre, pas occuper tout l'écran.
      const byWidth  = (W * 0.34) / totalCols;
      const byHeight = (H * 0.14) / glyphH;
      px = Math.max(2, Math.floor(Math.min(byWidth, byHeight)));

      const wordW = totalCols * px;
      const ox = (W - wordW) / 2;
      const oy = H * 0.055;

      cells = [];
      WORD.forEach((ch, gi) => {
        const g = GLYPHS[ch];
        g.forEach((row, ry) => {
          row.split("").forEach((bit, rx) => {
            if (bit !== "1") return;
            cells.push({
              x: ox + (gi * (glyphW + gap) + rx) * px,
              y: oy + ry * px,
              // Ordre d'apparition : par lettre, puis colonne, puis ligne
              order: gi * 100 + rx * 10 + ry,
              on: 0,
            });
          });
        });
      });

      petals = Array.from({ length: 14 }, () => spawnPetal(true));
    }

    function spawnPetal(initial) {
      const pp = 7;  // grille des pétales, indépendante de celle du mot
      return {
        pp,
        x: Math.floor(Math.random() * (W / pp)) * pp,
        y: initial ? Math.floor(Math.random() * (H / pp)) * pp : -pp * 2,
        vy: 0.25 + Math.random() * 0.5,
        drift: Math.random() < 0.5 ? -1 : 1,
        acc: 0,
        sz: 1,
        col: Math.random() < 0.5 ? PINK : Math.random() < 0.5 ? ACCENT2 : ACCENT,
        alpha: 0.18 + Math.random() * 0.22,
      };
    }

    function draw() {
      cx.clearRect(0, 0, W, H);

      // ── Pétales-pixels ──
      petals.forEach(p => {
        p.acc += p.vy;
        if (p.acc >= 1) {
          p.y += p.pp * Math.floor(p.acc);
          p.acc = 0;
          if (Math.random() < 0.35) p.x += p.pp * p.drift;
          if (Math.random() < 0.04) p.drift *= -1;
        }
        if (p.y > H + p.pp) Object.assign(p, spawnPetal(false));

        cx.globalAlpha = p.alpha;
        cx.fillStyle = p.col;
        cx.fillRect(p.x, p.y, p.pp, p.pp);
      });
      cx.globalAlpha = 1;

      // ── Le mot, pixel par pixel ──
      const reveal = reduced ? 9999 : frame * 1.6;
      cells.forEach(c => {
        if (c.order < reveal) c.on = Math.min(1, c.on + 0.14);
        if (c.on <= 0) return;

        cx.globalAlpha = c.on * 0.17;
        cx.fillStyle = ACCENT;
        cx.fillRect(c.x, c.y, px, px);

        // Liseré plus clair en haut-gauche : donne du relief au sprite
        if (c.on > 0.9) {
          cx.globalAlpha = 0.06;
          cx.fillStyle = "#d4f08a";
          cx.fillRect(c.x, c.y, px, Math.max(1, px * 0.22));
        }
      });
      cx.globalAlpha = 1;

      frame++;
      // Le mot se recompose toutes les ~20 s
      if (!reduced && frame > 1400) {
        frame = 0;
        cells.forEach(c => (c.on = 0));
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
}
