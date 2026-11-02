// @ts-nocheck
"use client";

// Sélecteur de monnaie d'affichage (toutes les monnaies des taux). Rien n'est affiché tant que les taux ne sont pas chargés.

import { Icon } from "./PricingIcons";

export default function CurrencyPicker({ cur, copy, lang }: any) {
  if (!cur.codes.length) return null;
  let names: any = null;
  try { names = new Intl.DisplayNames([lang || "en"], { type: "currency" }); } catch {}
  const label = (c: string) => {
    let n = "";
    try { n = names?.of(c) || ""; } catch {}
    return n && n !== c ? `${c} — ${n}` : c;
  };
  return (
    <div className="pg-cur">
      <label className="pg-cur-row">
        <Icon name="globe" />
        <span>{copy.label}</span>
        <select value={cur.currency} onChange={(e) => cur.setCurrency(e.target.value)} aria-label={copy.label}>
          {cur.codes.map((c: string) => <option key={c} value={c}>{label(c)}</option>)}
        </select>
      </label>
      {cur.active ? <p className="pg-cur-note">{copy.note}</p> : null}
    </div>
  );
}
