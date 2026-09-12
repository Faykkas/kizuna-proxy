// @ts-nocheck
// app/components/pixel/usePixelCanvas.tsx
// Remplace useSakuraCanvas. Des pétales-pixels qui tombent en escalier (pas
// de diagonale lisse — un vrai sprite d'époque se déplace par pas entiers)
// derrière le hero. Dessinait aussi le mot KIZUNA en filigrane pixel par
// pixel — retiré : le wordmark vit maintenant en petit et en vert à côté
// du titre, pas en animation de fond.
"use client";

import { useEffect } from "react";

export default function usePixelCanvas() {
  useEffect(() => {
    const cv = document.getElementById("hero-canvas");
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = 0, H = 0, raf;
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
