// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── HERO CANVAS ANIMATION ───────────────────────────────────────────────────
export default function useSakuraCanvas() {
  useEffect(() => {
    const cv = document.getElementById("hero-canvas") as HTMLCanvasElement;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = 0, H = 0, raf: number, t = 0, spawnT = 0;

    function resize() {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width  = W * devicePixelRatio;
      cv.height = H * devicePixelRatio;
      cx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const G1='#e83050', G2='#C8102E', G4='#a00d24';

    // ── KIZUNA LETTER PATHS ────────────────────────────────────────────────
    const LETTERS: Record<string, {x:number;y:number}[][]> = {
      K: [
        [{x:.1,y:.05},{x:.1,y:.5}],[{x:.1,y:.5},{x:.1,y:.95}],
        [{x:.1,y:.5},{x:.85,y:.05}],[{x:.1,y:.5},{x:.85,y:.95}],
      ],
      I: [
        [{x:.5,y:.05},{x:.5,y:.95}],
        [{x:.2,y:.05},{x:.8,y:.05}],[{x:.2,y:.95},{x:.8,y:.95}],
      ],
      Z: [
        [{x:.1,y:.05},{x:.9,y:.05}],
        [{x:.9,y:.05},{x:.1,y:.95}],
        [{x:.1,y:.95},{x:.9,y:.95}],
      ],
      U: [[{x:.1,y:.05},{x:.1,y:.7},{x:.15,y:.85},{x:.3,y:.93},{x:.5,y:.95},{x:.7,y:.93},{x:.85,y:.85},{x:.9,y:.7},{x:.9,y:.05}]],
      N: [
        [{x:.1,y:.95},{x:.1,y:.05}],
        [{x:.1,y:.05},{x:.9,y:.95}],
        [{x:.9,y:.95},{x:.9,y:.05}],
      ],
      A: [
        [{x:.5,y:.05},{x:.1,y:.95}],[{x:.5,y:.05},{x:.9,y:.95}],
        [{x:.25,y:.58},{x:.75,y:.58}],
      ],
    };

    const WORD = ['K','I','Z','U','N','A'];

    type Stroke = { pts:{x:number;y:number}[]; prog:number; op:number; hold:number; phase:string; w:number; };

    function buildWord(): Stroke[] {
      const lw = Math.min(W * .13, 85);
      const lh = lw * 1.4;
      const gap = lw * .3;
      const totalW = WORD.length * lw + (WORD.length - 1) * gap;
      let ox = (W - totalW) / 2;
      const sy = H * .04;  // very top
      const all: Stroke[] = [];
      WORD.forEach(letter => {
        (LETTERS[letter] || []).forEach(stroke => {
          all.push({
            pts: stroke.map(p => ({ x: ox + p.x * lw, y: sy + p.y * lh })),
            prog: 0, op: 0, hold: 0, phase: 'wait', w: 1.2 + Math.random() * .6,
          });
        });
        ox += lw + gap;
      });
      return all;
    }

    let wordStrokes: Stroke[] = [];
    let wordIdx = 0, wordTimer = 0;

    function initWord() {
      wordStrokes = buildWord();
      wordIdx = 0; wordTimer = 0;
    }

    // ── PETALS ────────────────────────────────────────────────────────────
    const petals = Array.from({ length: 35 }, () => ({
      x: Math.random() * 1400 - 100, y: Math.random() * 800,
      sz: 3.5 + Math.random() * 7.5,
      vy: .28 + Math.random() * .6, vx: (Math.random() - .5) * .35,
      a: Math.random() * Math.PI * 2, sp: (Math.random() - .5) * .02,
      sw: Math.random() * Math.PI * 2, ss: .007 + Math.random() * .013,
      op: .15 + Math.random() * .35,
    }));

    function drawPetal(x: number, y: number, sz: number, a: number, op: number) {
      cx.save(); cx.translate(x, y); cx.rotate(a);
      cx.globalAlpha = op;
      const g = cx.createRadialGradient(0, -sz*.25, 0, 0, 0, sz*1.1);
      g.addColorStop(0, '#fce4ea'); g.addColorStop(.5, '#F4A7B9'); g.addColorStop(1, '#e8839a');
      cx.fillStyle = g;
      cx.beginPath();
      cx.moveTo(0, -sz);
      cx.bezierCurveTo(sz*.72, -sz*.38, sz*.72, sz*.38, 0, sz*.28);
      cx.bezierCurveTo(-sz*.72, sz*.38, -sz*.72, -sz*.38, 0, -sz);
      cx.fill();
      cx.restore();
    }

    // ── AMBIENT STROKES ────────────────────────────────────────────────────
    const AMBIENT_PATHS = [
      [[.04,.2],[.18,.18],[.32,.19],[.46,.21]],
      [[.54,.38],[.64,.35],[.76,.36],[.88,.38]],
      [[.06,.75],[.18,.71],[.32,.68],[.44,.7]],
      [[.58,.82],[.7,.78],[.82,.79],[.92,.81]],
      [[.12,.52],[.2,.47],[.28,.45]],
    ];
    const ambient: Stroke[] = [];
    let ambientTimer = 0;

    function spawnAmbient() {
      const def = AMBIENT_PATHS[Math.floor(Math.random() * AMBIENT_PATHS.length)];
      const ox = (Math.random() - .5) * .1, oy = (Math.random() - .5) * .15;
      ambient.push({
        pts: def.map((p: number[]) => ({ x: (p[0]+ox)*W, y: (p[1]+oy)*H })),
        prog: 0, op: 0, hold: 0, phase: 'draw', w: .5 + Math.random() * .9,
      });
    }

    function drawStroke(s: Stroke) {
      if (!s.pts || s.pts.length < 2) return;
      cx.save();
      cx.globalAlpha = s.op;
      cx.strokeStyle = G2;
      cx.lineWidth = s.w;
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.beginPath();
      cx.moveTo(s.pts[0].x, s.pts[0].y);
      const drawn = Math.min(s.prog, s.pts.length - 1);
      for (let i = 0; i < drawn; i++) {
        const f = Math.min(drawn - i, 1);
        const p0 = s.pts[i], p1 = s.pts[i+1];
        cx.lineTo(p0.x + (p1.x-p0.x)*f, p0.y + (p1.y-p0.y)*f);
      }
      cx.stroke();
      cx.restore();
    }

    // ── MON CIRCLES ────────────────────────────────────────────────────────
    const mons = Array.from({ length: 4 }, () => ({
      x: .1 + Math.random() * .8, y: .1 + Math.random() * .8,
      r: 14 + Math.random() * 22,
      op: .05 + Math.random() * .07,
      ph: Math.random() * Math.PI * 2,
    }));

    function draw() {
      cx.clearRect(0, 0, W, H);
      t += .012; spawnT += .012; ambientTimer += .012;

      // Radial warm glow
      const rg = cx.createRadialGradient(W*.5, H*.4, 0, W*.5, H*.4, W*.7);
      rg.addColorStop(0, 'rgba(200,16,46,0.06)');
      rg.addColorStop(1, 'rgba(26,39,68,0.0)');
      cx.fillStyle = rg; cx.fillRect(0, 0, W, H);

      // Mon circles
      mons.forEach(m => {
        const fy = Math.sin(t*.4 + m.ph) * 3;
        cx.save();
        cx.globalAlpha = m.op + Math.sin(t*.3 + m.ph) * .02;
        cx.strokeStyle = G1; cx.lineWidth = .7;
        cx.beginPath(); cx.arc(m.x*W, m.y*H+fy, m.r, 0, Math.PI*2); cx.stroke();
        cx.globalAlpha *= .5;
        cx.beginPath(); cx.arc(m.x*W, m.y*H+fy, m.r*.55, 0, Math.PI*2); cx.stroke();
        cx.restore();
      });

      // Ambient strokes
      if (ambientTimer > 4 + Math.random() * 3) {
        ambientTimer = 0;
        if (ambient.length < 4) spawnAmbient();
      }
      for (let i = ambient.length - 1; i >= 0; i--) {
        const s = ambient[i];
        if (s.phase === 'draw') { s.prog += .03; s.op = Math.min(s.op+.01, .1); if (s.prog >= s.pts.length-1) { s.prog = s.pts.length-1; s.phase = 'hold'; } }
        else if (s.phase === 'hold') { s.hold += .012; if (s.hold > 3.5) s.phase = 'fade'; }
        else { s.op -= .003; if (s.op <= 0) { ambient.splice(i, 1); continue; } }
        drawStroke(s);
      }

      // KIZUNA word
      wordTimer += .012;
      if (wordTimer > .32 && wordIdx < wordStrokes.length) {
        wordStrokes[wordIdx].phase = 'draw';
        wordIdx++;
        wordTimer = 0;
      }
      wordStrokes.forEach(s => {
        if (s.phase === 'draw') {
          s.prog += .06;
          s.op = Math.min(s.op + .025, .55);
          if (s.prog >= s.pts.length - 1) { s.prog = s.pts.length - 1; s.phase = 'hold'; }
        }
        if (s.phase !== 'wait') drawStroke(s);
      });

      // Petals
      petals.forEach(p => {
        p.sw += p.ss; p.y += p.vy; p.x += p.vx + Math.sin(p.sw) * .55; p.a += p.sp;
        drawPetal(p.x, p.y, p.sz, p.a, p.op);
        if (p.y > H+20) { p.y = -15; p.x = Math.random() * W; }
        if (p.x > W+20) p.x = -20;
        if (p.x < -20) p.x = W+20;
      });

      raf = requestAnimationFrame(draw);
    }

    setTimeout(() => { initWord(); spawnAmbient(); spawnAmbient(); }, 600);
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
}
