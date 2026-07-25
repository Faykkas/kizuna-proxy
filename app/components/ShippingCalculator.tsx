// @ts-nocheck
"use client";
// app/components/ShippingCalculator.tsx
//
// Answers the question that stops people from ordering: "how much will this
// cost me in total?" Shipping is the easy half; customs is the half nobody
// explains, so it gets equal billing here.

import { useState, useMemo } from "react";
import Maneki from "./pixel/Maneki";
import { useLanguage } from "../lib/language";
import {
  COUNTRIES, ZONES, WEIGHT_EXAMPLES,
  emsPrice, customsKeyFor, RATES_UPDATED,
} from "../lib/shipping";

/** Yen to euro/dollar, for people who don't think in yen */
const RATE_EUR = 165;
const RATE_USD = 155;

export default function ShippingCalculator() {
  const { t } = useLanguage();
  const s = t.shippingPage || {};
  const [country, setCountry] = useState("");
  const [grams, setGrams] = useState("");
  const [itemValue, setItemValue] = useState("");

  const dest = COUNTRIES.find(c => c.code === country);
  const weight = parseInt(grams, 10) || 0;

  const result = useMemo(() => {
    if (!dest || !weight) return null;
    return emsPrice(weight, dest.zone);
  }, [dest, weight]);

  const customsKey = dest ? customsKeyFor(dest.code) : null;
  const customs = customsKey ? s[`customs${customsKey}`] : null;
  const deliveryDays = s.deliveryDays || {};
  const zoneDesc = s.zoneDesc || {};
  const weightExamples = s.weightExamples || [];

  // Countries grouped by zone, cheapest zone first
  const grouped = useMemo(() => {
    const g = {};
    COUNTRIES.forEach(c => {
      if (!g[c.zone]) g[c.zone] = [];
      g[c.zone].push(c);
    });
    return g;
  }, []);

  return (
    <div className="calc">

      {/* ── Inputs ── */}
      <div className="calc-inputs">

        <div className="calc-field">
          <label htmlFor="calc-country">{s.shipTo || "SHIP TO"}</label>
          <select
            id="calc-country"
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            <option value="">{s.chooseCountry || "Choose a country…"}</option>
            {Object.keys(grouped).sort().map(z => (
              <optgroup key={z} label={`${s.zone || "Zone"} ${z} — ${zoneDesc[z] || ZONES[z].desc}`}>
                {grouped[z]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="calc-field">
          <label htmlFor="calc-weight">{s.weightLabel || "WEIGHT (GRAMS)"}</label>
          <input
            id="calc-weight"
            type="number"
            min="1"
            max="30000"
            placeholder={s.weightPlaceholder || "e.g. 800"}
            value={grams}
            onChange={e => setGrams(e.target.value)}
          />
        </div>

        <div className="calc-field">
          <label htmlFor="calc-value">
            {s.itemValueLabel || "ITEM VALUE"} <span className="calc-optional">{s.optional || "optional"}</span>
          </label>
          <input
            id="calc-value"
            type="number"
            min="0"
            placeholder={s.itemValuePlaceholder || "¥ e.g. 12000"}
            value={itemValue}
            onChange={e => setItemValue(e.target.value)}
          />
        </div>
      </div>

      {/* ── Weight helper ── */}
      <div className="calc-examples">
        <span className="calc-examples-label">{s.noIdea || "NO IDEA? PICK ONE:"}</span>
        <div className="calc-chips">
          {WEIGHT_EXAMPLES.map((ex, i) => (
            <button
              key={ex.g}
              className={`calc-chip${weight === ex.g ? " is-on" : ""}`}
              onClick={() => setGrams(String(ex.g))}
            >
              {weightExamples[i] || ex.label} <em>{ex.g}g</em>
            </button>
          ))}
        </div>
        <p className="calc-examples-note">
          {s.packagingNote || "Add 100–200 g for packaging. We always use enough to protect what's inside."}
        </p>
      </div>

      {/* ── Result ── */}
      {!dest || !weight ? (
        <div className="calc-empty">
          <Maneki prop="parcel" size={80} float />
          <p>{s.pickCountryWeight || "Pick a country and a weight to see the price."}</p>
        </div>
      ) : !result ? (
        <div className="calc-over">
          <strong>{s.over30kg || "OVER 30 KG"}</strong>
          <p>
            {s.over30kgBody || "EMS stops at 30 kg. Above that we split the parcel or use sea freight — get in touch and we'll work it out."}
          </p>
          <a href="/request" className="btn btn-gold">{s.askUs || "ASK US"}</a>
        </div>
      ) : (
        <div className="calc-result">

          <div className="calc-price-block">
            <span className="calc-price-label">
              {s.emsTo || "EMS TO"} {dest.name.toUpperCase()}
            </span>
            <span className="calc-price">
              ¥{result.price.toLocaleString()}
            </span>
            <span className="calc-price-alt">
              ≈ €{Math.round(result.price / RATE_EUR)} · ${Math.round(result.price / RATE_USD)}
            </span>
          </div>

          <div className="calc-facts">
            <div>
              <span className="calc-fact-label">{s.billedAs || "BILLED AS"}</span>
              <span className="calc-fact-value">
                {result.bracket >= 1000
                  ? `${result.bracket / 1000} kg`
                  : `${result.bracket} g`}
              </span>
            </div>
            <div>
              <span className="calc-fact-label">{s.delivery || "DELIVERY"}</span>
              <span className="calc-fact-value">{deliveryDays[dest.zone]}</span>
            </div>
            <div>
              <span className="calc-fact-label">{s.tracking || "TRACKING"}</span>
              <span className="calc-fact-value">{s.included || "Included"}</span>
            </div>
          </div>

          {/* EMS bills per bracket, and people are surprised by it */}
          {weight < result.bracket && (
            <p className="calc-bracket-note">
              {s.bracketNotePre || "EMS charges by bracket, so"} {weight} {s.bracketNoteMid || "g is billed at the"}{" "}
              {result.bracket >= 1000 ? `${result.bracket / 1000} kg` : `${result.bracket} g`} {s.bracketNotePost || "rate. Anything up to that weight costs the same — worth adding a second item."}
            </p>
          )}

          {/* ── Customs ── */}
          {customs && (
            <div className={`calc-customs${dest.code === "US" ? " is-us" : ""}`}>
              <div className="calc-customs-head">
                <span className="calc-customs-label">{s.importTaxes || "IMPORT TAXES"}</span>
                <strong>{customs.summary}</strong>
              </div>
              <p className="calc-customs-detail">{customs.detail}</p>

              {customs.kizuna && (
                <div className="calc-kizuna">
                  <Maneki prop="coins" size={54} />
                  <div>
                    <strong>{s.weHandleIt || "WE HANDLE IT"}</strong>
                    <p>{customs.kizuna}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="calc-cta">
            <a href="/request" className="btn btn-gold">{s.requestThisItem || "REQUEST THIS ITEM"}</a>
            <span>{s.freeQuote || "Free quote, no commitment."}</span>
          </div>

        </div>
      )}

      <p className="calc-disclaimer">
        {s.disclaimerPre || "Official Japan Post EMS rates, updated"} {RATES_UPDATED}. {s.disclaimerPost || "Shipping only — the item price and our service fee are quoted separately. Import taxes are set by your country, not by us."}
      </p>
    </div>
  );
}
