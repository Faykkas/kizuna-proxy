"use client";

import { useEffect, useRef } from "react";

// Thème de Noël du site public : neige en profondeur (canvas, 3 plans + vent léger), boules de Noël qui se balancent dans
// les marges, lueurs chaudes, bonnet de Père Noël sur la mascotte (voir v3.css). Tout s'allume avec l'attribut data-xmas
// sur <html> et s'éteint tout seul le 8 janvier 2027. Pour le couper plus tôt : mettre CHRISTMAS_ON à false.
const CHRISTMAS_ON = true;
const CHRISTMAS_END = new Date(2027, 0, 8).getTime();

// [classe, longueur du fil, taille, couleurs claire / moyenne / foncée, durée, décalage]
const ORNAMENTS = [
  ["xm-orn-l1", 70, 30, "#ff8a96", "#e8334a", "#8f1627", "4.6s", "-1.2s"],
  ["xm-orn-l2", 128, 24, "#ffe9a0", "#ffd24d", "#a9781a", "5.4s", "-3s"],
  ["xm-orn-r1", 92, 28, "#dcb0ff", "#c77dff", "#6a2fb0", "5s", "-2s"],
  ["xm-orn-r2", 54, 22, "#d4f58f", "#a8e04a", "#4f7a14", "4.2s", "-0.6s"],
];
// [gauche %, haut %, taille px, couleur rgb, durée s, décalage s]
const GLOWS = [
  [8, 14, 220, "255,196,110", 9, 0],
  [78, 8, 280, "255,170,90", 11, -3],
  [46, 62, 200, "199,125,255", 10, -5],
  [90, 70, 240, "255,210,140", 12, -7],
  [18, 78, 260, "255,150,110", 13, -2],
  [62, 34, 180, "168,224,74", 8, -4],
];

export default function ChristmasTheme() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!CHRISTMAS_ON || Date.now() >= CHRISTMAS_END) return;
    const root = document.documentElement;
    root.setAttribute("data-xmas", "1");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (reduce || !canvas || !ctx) return () => root.removeAttribute("data-xmas");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;

    // sprites de flocons : un cœur blanc et un halo doux, dessinés une seule fois
    const sprite = (size: number, soft: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = Math.ceil(size * 2 * dpr);
      const x = c.getContext("2d")!;
      const r = c.width / 2;
      const g = x.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(soft, "rgba(240,237,247,.85)");
      g.addColorStop(1, "rgba(240,237,247,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(r, r, r, 0, Math.PI * 2);
      x.fill();
      return c;
    };
    // 3 plans : loin (petits, lents, discrets), milieu, près (gros, doux, rapides)
    const layers = [
      { n: 0.55, vy: [0.25, 0.55], alpha: 0.42, sway: 0.25, sprite: sprite(2.2, 0.45) },
      { n: 0.32, vy: [0.5, 1.0], alpha: 0.68, sway: 0.5, sprite: sprite(3.6, 0.4) },
      { n: 0.13, vy: [0.9, 1.6], alpha: 0.5, sway: 0.9, sprite: sprite(7, 0.2) },
    ];
    type Flake = { x: number; y: number; vy: number; d: number; p: number; L: number };
    let flakes: Flake[] = [];

    const make = (L: number, initial: boolean): Flake => {
      const l = layers[L];
      return { x: Math.random() * w, y: initial ? Math.random() * h : -20, vy: l.vy[0] + Math.random() * (l.vy[1] - l.vy[0]), d: Math.random() * 6.28, p: 0.5 + Math.random() * 0.9, L };
    };
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const total = Math.round(Math.min(110, Math.max(34, w / 13)));
      flakes = [];
      layers.forEach((l, i) => {
        for (let k = 0; k < Math.round(total * l.n); k++) flakes.push(make(i, true));
      });
    };

    const tick = () => {
      t += 0.004;
      const wind = Math.sin(t) * 0.35 + Math.sin(t * 2.3) * 0.12; // vent qui change doucement
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const f of flakes) {
        const l = layers[f.L];
        f.y += f.vy;
        f.d += 0.011 * f.p;
        f.x += Math.sin(f.d) * l.sway + wind * (0.4 + f.L * 0.5);
        if (f.y > h + 20 || f.x < -30 || f.x > w + 30) {
          Object.assign(f, make(f.L, false));
        }
        ctx.globalAlpha = l.alpha;
        const s = l.sprite.width;
        ctx.drawImage(l.sprite, f.x * dpr - s / 2, f.y * dpr - s / 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeAttribute("data-xmas");
    };
  }, []);

  return (
    <>
      <div className="xm-glow" aria-hidden="true">
        {GLOWS.map(([x, y, s, rgb, dur, dl], i) => (
          <span
            key={i}
            style={{ left: x + "%", top: y + "%", width: s, height: s, ["--bc" as any]: "rgba(" + rgb + ",.55)", ["--t" as any]: dur + "s", ["--dl" as any]: dl + "s" }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="xm-snow" aria-hidden="true" />
      {ORNAMENTS.map(([cls, len, size, c1, c2, c3, dur, dl]) => (
        <div
          key={cls as string}
          className={"xm-orn " + cls}
          aria-hidden="true"
          style={{ ["--h" as any]: len + "px", ["--s" as any]: size + "px", ["--c1" as any]: c1, ["--c2" as any]: c2, ["--c3" as any]: c3, ["--d" as any]: dur, ["--dl" as any]: dl }}
        >
          <i />
        </div>
      ))}
    </>
  );
}
