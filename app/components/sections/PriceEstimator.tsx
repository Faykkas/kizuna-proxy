// @ts-nocheck
"use client";

// Calculateur « Combien ça coûte au total ? » de l'accueil : prix de l'article + frais Kizuna + livraison EMS estimée.
// Calcul : lib/estimate.ts (testé). Textes : estimateCopy.ts (12 langues). Montant aussi dans la monnaie du visiteur.

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "../../lib/shipping";
import { estimateTotal, MAX_QTY } from "../../lib/estimate";
import { formatJPY } from "../../lib/orderStatus";
import { formatMoney } from "../../lib/currency";
import { useCurrency } from "../../lib/useCurrency";
import { estimateCopy, ESTIMATE_WEIGHTS } from "./estimateCopy";

// Noms des pays dans la langue du visiteur : seulement dans le navigateur (le serveur et le navigateur n'ont pas
// les mêmes traductions, ex. « Hong Kong SAR China » / « Hong Kong », ce qui casserait l'hydratation).
function countryNames(lang, localize) {
  let dn = null;
  if (localize) try { dn = new Intl.DisplayNames([lang || "en"], { type: "region" }); } catch {}
  return COUNTRIES
    .map((c) => ({ ...c, label: (dn && dn.of(c.code)) || c.name }))
    .sort((a, b) => a.label.localeCompare(b.label, localize ? lang || "en" : "en"));
}

export default function PriceEstimator({ lang }) {
  const c = estimateCopy(lang);
  const cur = useCurrency(lang);
  const [kind, setKind] = useState("online");
  const [price, setPrice] = useState("10000"); // exemple pré-rempli : le résultat s'affiche tout de suite
  const [qty, setQty] = useState("1");
  const [country, setCountry] = useState("");
  const [grams, setGrams] = useState(String(ESTIMATE_WEIGHTS[1]));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const countries = useMemo(() => countryNames(lang, mounted), [lang, mounted]);
  const dest = countries.find((x) => x.code === country) || null;
  const est = estimateTotal({ kind, price: Number(price), qty: Number(qty) || 1, zone: dest ? dest.zone : null, grams: Number(grams) });
  const rate = cur.active && cur.rates ? cur.rates[cur.currency] : null;
  const approx = (jpy) => (rate ? `≈ ${formatMoney(jpy, rate, cur.currency, lang)}` : "");

  const quoteHref = est
    ? `/request?q=${encodeURIComponent(`${c.kinds[kind]} · ${formatJPY(Number(price))}${Number(qty) > 1 ? ` × ${qty}` : ""}${dest ? ` · ${dest.name}` : ""}`)}`
    : "/request";

  return (
    <section className="section reveal pe-section" aria-labelledby="pe-title">
      <div className="wrap">
        <div className="pe-card">
          <div className="pe-form">
            <p className="v3-eyebrow">{c.label}</p>
            <h2 id="pe-title">{c.title}</h2>
            <p className="pe-desc">{c.desc}</p>

            <label className="pe-field pe-full">
              <span>{c.kind}</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="online">{c.kinds.online}</option>
                <option value="store">{c.kinds.store}</option>
                <option value="coach">{c.kinds.coach}</option>
              </select>
            </label>
            <div className="pe-row">
              <label className="pe-field pe-grow">
                <span>{c.price}</span>
                <input inputMode="numeric" value={price} placeholder="10000" onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))} />
              </label>
              <label className="pe-field pe-qty">
                <span>{c.qty}</span>
                <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, "").slice(0, 2))} onBlur={() => setQty(String(Math.min(MAX_QTY, Math.max(1, Number(qty) || 1))))} />
              </label>
            </div>
            <label className="pe-field pe-full">
                <span>{c.country}</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">{c.choose}</option>
                  {countries.map((x) => <option key={x.code} value={x.code}>{x.flag} {x.label}</option>)}
                </select>
            </label>
            <label className="pe-field pe-full">
                <span>{c.weight}</span>
                <select value={grams} onChange={(e) => setGrams(e.target.value)}>
                  {ESTIMATE_WEIGHTS.map((g, i) => <option key={g} value={g}>{c.weights[i]} · ~{g >= 1000 ? `${g / 1000} kg` : `${g} g`}</option>)}
                </select>
            </label>
          </div>

          <div className="pe-result" aria-live="polite">
            {est ? (
              <>
                <dl>
                  <div><dt>{c.items}</dt><dd>{formatJPY(est.items)}</dd></div>
                  <div><dt>{c.fee}</dt><dd>{formatJPY(est.fee)}</dd></div>
                  <div><dt>{c.ship}</dt><dd>{est.shipping != null ? formatJPY(est.shipping) : <span className="pe-muted">{c.shipPending}</span>}</dd></div>
                </dl>
                <div className="pe-total">
                  <span>{c.total}</span>
                  <strong>{formatJPY(est.total)}</strong>
                  {approx(est.total) ? <em>{approx(est.total)}</em> : null}
                </div>
              </>
            ) : (
              <p className="pe-empty">{c.empty}</p>
            )}
            <p className="pe-note">{c.note}</p>
            <a className="btn btn-gold pe-cta" href={quoteHref}>{c.cta} →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
