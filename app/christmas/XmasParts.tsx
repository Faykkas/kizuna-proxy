// @ts-nocheck
"use client";

// Pièces de l'offensive de Noël : horloge, compte à rebours, pastille du menu, carte du code, quiz cadeau, bande de l'accueil.
// Tout ce qui dépend de l'heure est calculé APRÈS le montage (pas d'écart entre le rendu serveur et le navigateur).

import { useEffect, useState } from "react";
import Image from "next/image";
import { track } from "@vercel/analytics";
import { IconGacha, IconFigure, IconStore, IconShoppingBag, IconBox, IconApparel, IconCards } from "../components/pixel/PixelIcons";
import Maneki from "../components/pixel/Maneki";
import { XMAS_CODE, XMAS_CODE_UNTIL_MS, XMAS_DEADLINE_MS, XMAS_IDEAS, rankIdeas, timeLeft } from "./xmasConfig";
import { xmasCopy, fillX, XMAS_LOCALES } from "./xmasCopy";

const ICONS = { gacha: IconGacha, figure: IconFigure, store: IconStore, bag: IconShoppingBag, box: IconBox, apparel: IconApparel };
const UNIVERSE_ICONS = [IconFigure, IconCards, IconApparel, IconBox, IconGacha, IconStore];

/** Heure courante, mise à jour toutes les `ms` (null avant le montage). */
export function useClock(ms = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Vrai tant que les commandes de Noël sont ouvertes (vrai aussi avant le montage : pas de clignotement pendant la saison). */
export function useXmasOn(): boolean {
  const now = useClock(60000);
  return now == null || now < XMAS_DEADLINE_MS;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function XmasCountdown({ lang, size = "lg" }: { lang: string; size?: "lg" | "md" }) {
  const c = xmasCopy(lang);
  const now = useClock(1000);
  const t = now == null ? null : timeLeft(now);
  const cells = [
    { k: "d", v: t ? t.d : null, l: c.big.d },
    { k: "h", v: t ? t.h : null, l: c.big.h },
    { k: "m", v: t ? t.m : null, l: c.big.m },
    { k: "s", v: t ? t.s : null, l: c.big.s },
  ];
  return (
    <div className={`xm-count xm-count-${size}`} role="timer" aria-label={c.chip}>
      {cells.map((x) => (
        <div key={x.k} className="xm-cell">
          <span className="xm-num" key={x.v ?? "x"}>{x.v == null ? "--" : x.k === "d" ? x.v : pad(x.v)}</span>
          <span className="xm-lbl">{x.l}</span>
        </div>
      ))}
    </div>
  );
}

/** Pastille de la barre d'infos du menu : « Fin des commandes de Noël dans 22 j 04 h 12 min ». */
export function XmasChip({ lang }: { lang: string }) {
  const c = xmasCopy(lang);
  const now = useClock(30000);
  const t = now == null ? null : timeLeft(now);
  return (
    <a href="/christmas" className="xm-chip">
      <span aria-hidden="true">🎄</span>
      <span className="xm-chip-txt">{c.chip}</span>
      <strong>{t ? `${t.d}${c.units.d} ${pad(t.h)}${c.units.h} ${pad(t.m)}${c.units.m}` : "…"}</strong>
    </a>
  );
}

/** Le code est-il encore valable ? (null avant le montage) */
function useCodeValid(): boolean | null {
  const now = useClock(60000);
  return now == null ? null : now < XMAS_CODE_UNTIL_MS;
}

export function XmasCodeCard({ lang }: { lang: string }) {
  const c = xmasCopy(lang);
  const valid = useCodeValid();
  const [copied, setCopied] = useState(false);
  if (!valid) return null;
  const until = new Date(XMAS_CODE_UNTIL_MS).toLocaleDateString(XMAS_LOCALES[lang] || "en-US", { day: "numeric", month: "long", timeZone: "Asia/Tokyo" });
  async function copy() {
    try {
      await navigator.clipboard.writeText(XMAS_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track("xmas_code_copy");
    } catch {}
  }
  return (
    <div className="xm-code">
      <div className="xm-code-top">
        <span className="xm-code-title">{c.codeTitle}</span>
        <span className="xm-code-until">{fillX(c.codeUntil, { date: until })}</span>
      </div>
      <div className="xm-code-row">
        <code>{XMAS_CODE}</code>
        <button type="button" onClick={copy} className="xm-code-btn">{copied ? c.copied : c.copy}</button>
      </div>
      <p>{c.codeDesc}</p>
    </div>
  );
}

function IdeaVisual({ idea, alt }) {
  if (idea.img) return <Image src={idea.img} alt={alt} fill sizes="(max-width: 700px) 90vw, 300px" />;
  const Icon = ICONS[idea.icon] || IconBox;
  return (
    <span className="xm-idea-icon" aria-hidden="true">
      <Icon size={84} />
    </span>
  );
}

export function XmasQuiz({ lang }: { lang: string }) {
  const c = xmasCopy(lang);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<{ r?: number; u?: number; b?: number }>({});
  const valid = useCodeValid();

  function pick(key: "r" | "u" | "b", i: number) {
    const next = { ...ans, [key]: i };
    setAns(next);
    setStep((s) => s + 1);
    if (key === "b") track("xmas_quiz_result", { universe: c.universes[next.u] ? String(next.u) : "", budget: String(i) });
  }
  function restart() {
    setAns({});
    setStep(0);
  }

  const options =
    step === 0 ? c.recipients.map((x) => x.label) : step === 1 ? c.universes : step === 2 ? c.budgets : [];
  const key = step === 0 ? "r" : step === 1 ? "u" : "b";

  return (
    <div className="xm-quiz" id="quiz">
      {step < 3 ? (
        <>
          <div className="xm-quiz-head">
            <span className="xm-step">{fillX(c.step, { n: step + 1 })}</span>
            <div className="xm-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
          </div>
          <h2 className="xm-q">{c.q[step]}</h2>
          <div className={`xm-opts xm-opts-${step}`}>
            {options.map((label, i) => {
              const Icon = step === 1 ? UNIVERSE_ICONS[i] : null;
              return (
                <button key={i} type="button" className={`xm-opt${ans[key] === i ? " on" : ""}`} onClick={() => pick(key, i)}>
                  {Icon ? <span className="xm-opt-icon" aria-hidden="true"><Icon size={34} /></span> : null}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {step > 0 ? (
            <button type="button" className="xm-back" onClick={() => setStep((s) => s - 1)}>← {c.back}</button>
          ) : null}
        </>
      ) : (
        <Results c={c} ans={ans} valid={valid} onRestart={restart} />
      )}
    </div>
  );
}

function Results({ c, ans, valid, onRestart }) {
  const who = c.recipients[ans.r]?.who || "";
  const order = rankIdeas(ans.u, ans.b);
  const cat = c.universes[ans.u];
  const budget = c.budgets[ans.b];
  return (
    <div className="xm-results">
      <div className="xm-results-head">
        <Maneki state="success" prop="bag" size={64} />
        <div>
          <h2 className="xm-q">{fillX(c.resultTitle, { who })}</h2>
          <p>{c.resultSub}</p>
        </div>
      </div>
      <div className="xm-ideas">
        {order.map((i, rank) => {
          const idea = XMAS_IDEAS[ans.u][i];
          const txt = c.ideas[ans.u][i];
          const q = fillX(c.prefill, { idea: txt.t, cat, who: c.recipients[ans.r]?.label || "", budget }) + (valid ? fillX(c.prefillCode, { code: XMAS_CODE }) : "");
          return (
            <article key={i} className={`xm-idea${rank === 0 ? " best" : ""}`}>
              <div className="xm-idea-img">
                <IdeaVisual idea={idea} alt={txt.t} />
                {rank === 0 ? <span className="xm-best">★ {c.best}</span> : null}
              </div>
              <div className="xm-idea-body">
                <strong>{txt.t}</strong>
                <p>{txt.d}</p>
                <a className="btn btn-gold" href={`/request?q=${encodeURIComponent(q)}`} onClick={() => track("xmas_quiz_ask", { universe: String(ans.u), idea: String(i) })}>{c.ask}</a>
              </div>
            </article>
          );
        })}
      </div>
      <div className="xm-results-foot">
        <a href="/request" className="xm-own">{c.own}</a>
        <button type="button" className="xm-back" onClick={onRestart}>↺ {c.restart}</button>
      </div>
    </div>
  );
}

/** Bande de l'accueil, juste sous l'en-tête. Disparaît d'elle-même après la date limite. */
export function XmasBand({ lang }: { lang: string }) {
  const c = xmasCopy(lang);
  const on = useXmasOn();
  if (!on) return null;
  return (
    <section className="xm-band-wrap">
      <div className="wrap">
        <div className="xm-band">
          <div className="xm-band-copy">
            <span className="xm-badge">🎄 {c.bandBadge}</span>
            <h2>{c.bandTitle}</h2>
            <p>{c.bandDesc}</p>
            <a href="/christmas#quiz" className="btn btn-gold">{c.bandCta} →</a>
          </div>
          <div className="xm-band-side">
            <span className="xm-band-label">{c.chip}</span>
            <XmasCountdown lang={lang} size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
