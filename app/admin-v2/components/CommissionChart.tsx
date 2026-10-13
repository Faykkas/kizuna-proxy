import { formatJPY } from "../lib/money";
import { monthShortFr } from "../lib/status";

export type ChartPoint = { month: string; total: number };

// Histogramme en SVG pur (rendu serveur, aucun JavaScript côté navigateur).
// La ligne pointillée verte est l'objectif mensuel.
export default function CommissionChart({ points, goal, currentMonth }: { points: ChartPoint[]; goal: number; currentMonth: string }) {
  const W = 760;
  const H = 260;
  const padL = 12;
  const padR = 12;
  const padT = 22;
  const padB = 34;
  const max = Math.max(goal, ...points.map((p) => p.total), 1);
  const top = Math.ceil((max * 1.1) / 50_000) * 50_000;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = innerW / points.length;
  const barW = Math.min(38, slot * 0.62);
  const y = (v: number) => padT + innerH - (Math.max(v, 0) / top) * innerH;
  const summary = points.map((p) => `${monthShortFr(p.month)} ${p.month.slice(0, 4)} : ${formatJPY(p.total)}`).join(" ; ");

  return (
    <svg className="av2-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="av2-chart-title av2-chart-desc">
      <title id="av2-chart-title">Commissions mensuelles (provisoire)</title>
      <desc id="av2-chart-desc">{summary}. Objectif mensuel : {formatJPY(goal)}.</desc>
      <line className="axis" x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} />
      <line className="goal" x1={padL} x2={W - padR} y1={y(goal)} y2={y(goal)} />
      <text x={W - padR} y={y(goal) - 5} textAnchor="end">
        Objectif {Math.round(goal / 1000)}k ¥
      </text>
      {points.map((p, i) => {
        const cx = padL + slot * i + slot / 2;
        const h = padT + innerH - y(p.total);
        const isNow = p.month === currentMonth;
        return (
          <g key={p.month}>
            <rect className={`bar${isNow ? " now" : ""}`} x={cx - barW / 2} y={y(p.total)} width={barW} height={Math.max(h, 0)} rx={4} />
            {p.total !== 0 ? (
              <text x={cx} y={y(p.total) - 5} textAnchor="middle">
                {Math.round(p.total / 1000)}k
              </text>
            ) : null}
            <text x={cx} y={H - 12} textAnchor="middle">
              {monthShortFr(p.month)}
            </text>
            {p.month.endsWith("-01") || i === 0 ? (
              <text x={cx} y={H - 1} textAnchor="middle">
                {p.month.slice(0, 4)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
