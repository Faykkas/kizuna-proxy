import { formatJPY } from "../lib/money";
import { getL } from "../lib/lang-server";

export type ChartPoint = { month: string; total: number };

// Histogramme en SVG pur (rendu serveur, aucun JavaScript côté navigateur).
// La ligne pointillée verte est l'objectif mensuel.
export default async function CommissionChart({ points, goal, currentMonth }: { points: ChartPoint[]; goal: number; currentMonth: string }) {
  const { t, monthShort } = await getL();
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
  const summary = points.map((p) => `${monthShort(p.month)} ${p.month.slice(0, 4)} : ${formatJPY(p.total)}`).join(" ; ");

  return (
    <svg className="av2-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="av2-chart-title av2-chart-desc">
      <title id="av2-chart-title">{t("Commissions mensuelles (provisoire)")}</title>
      <desc id="av2-chart-desc">{summary}. {t("Objectif mensuel")} : {formatJPY(goal)}.</desc>
      <line className="axis" x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} />
      <line className="goal" x1={padL} x2={W - padR} y1={y(goal)} y2={y(goal)} />
      <text className="goal-label" x={padL} y={y(goal) - 5} textAnchor="start">
        {t("Objectif {n}k ¥", { n: Math.round(goal / 1000) })}
      </text>
      {points.map((p, i) => {
        const cx = padL + slot * i + slot / 2;
        const h = padT + innerH - y(p.total);
        const isNow = p.month === currentMonth;
        // Le chiffre ne doit pas être barré par la ligne d'objectif : s'il tombe dessus, on le place juste au-dessus de la ligne.
        const gy = y(goal);
        let ly = y(p.total) - 5;
        if (ly - 10 <= gy && gy <= ly + 3) ly = gy - 6;
        return (
          <g key={p.month}>
            <rect className={`bar${isNow ? " now" : ""}`} x={cx - barW / 2} y={y(p.total)} width={barW} height={Math.max(h, 0)} rx={4} />
            {p.total !== 0 ? (
              <text className="value" x={cx} y={ly} textAnchor="middle">
                {Math.round(p.total / 1000)}k
              </text>
            ) : null}
            <text x={cx} y={H - 12} textAnchor="middle">
              {monthShort(p.month)}
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
