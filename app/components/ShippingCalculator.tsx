// @ts-nocheck
"use client";
// app/components/ShippingCalculator.tsx
//
// Answers the question that stops people from ordering: "how much will this
// cost me in total?" Shipping is the easy half; customs is the half nobody
// explains, so it gets equal billing here.

import { useState, useMemo } from "react";
import Maneki from "./pixel/Maneki";
import {
  COUNTRIES, ZONES, WEIGHT_EXAMPLES, DELIVERY_DAYS,
  emsPrice, customsFor, RATES_UPDATED,
} from "../lib/shipping";

/** Yen to euro/dollar, for people who don't think in yen */
const RATE_EUR = 165;
const RATE_USD = 155;

export default function ShippingCalculator() {
  const [country, setCountry] = useState("");
  const [grams, setGrams] = useState("");
  const [itemValue, setItemValue] = useState("");

  const dest = COUNTRIES.find(c => c.code === country);
  const weight = parseInt(grams, 10) || 0;

  const result = useMemo(() => {
    if (!dest || !weight) return null;
    return emsPrice(weight, dest.zone);
  }, [dest, weight]);

  const customs = dest ? customsFor(dest.code) : null;

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
          <label htmlFor="calc-country">SHIP TO</label>
          <select
            id="calc-country"
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            <option value="">Choose a country…</option>
            {Object.keys(grouped).sort().map(z => (
              <optgroup key={z} label={`${ZONES[z].name} — ${ZONES[z].desc}`}>
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
          <label htmlFor="calc-weight">WEIGHT (GRAMS)</label>
          <input
            id="calc-weight"
            type="number"
            min="1"
            max="30000"
            placeholder="e.g. 800"
            value={grams}
            onChange={e => setGrams(e.target.value)}
          />
        </div>

        <div className="calc-field">
          <label htmlFor="calc-value">
            ITEM VALUE <span className="calc-optional">optional</span>
          </label>
          <input
            id="calc-value"
            type="number"
            min="0"
            placeholder="¥ e.g. 12000"
            value={itemValue}
            onChange={e => setItemValue(e.target.value)}
          />
        </div>
      </div>

      {/* ── Weight helper ── */}
      <div className="calc-examples">
        <span className="calc-examples-label">NO IDEA? PICK ONE:</span>
        <div className="calc-chips">
          {WEIGHT_EXAMPLES.map(ex => (
            <button
              key={ex.g}
              className={`calc-chip${weight === ex.g ? " is-on" : ""}`}
              onClick={() => setGrams(String(ex.g))}
            >
              {ex.label} <em>{ex.g}g</em>
            </button>
          ))}
        </div>
        <p className="calc-examples-note">
          Add 100–200 g for packaging. We always use enough to protect what&apos;s inside.
        </p>
      </div>

      {/* ── Result ── */}
      {!dest || !weight ? (
        <div className="calc-empty">
          <Maneki prop="parcel" size={80} float />
          <p>Pick a country and a weight to see the price.</p>
        </div>
      ) : !result ? (
        <div className="calc-over">
          <strong>OVER 30 KG</strong>
          <p>
            EMS stops at 30 kg. Above that we split the parcel or use sea freight —
            get in touch and we&apos;ll work it out.
          </p>
          <a href="/request" className="btn btn-gold">ASK US</a>
        </div>
      ) : (
        <div className="calc-result">

          <div className="calc-price-block">
            <span className="calc-price-label">
              EMS TO {dest.name.toUpperCase()}
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
              <span className="calc-fact-label">BILLED AS</span>
              <span className="calc-fact-value">
                {result.bracket >= 1000
                  ? `${result.bracket / 1000} kg`
                  : `${result.bracket} g`}
              </span>
            </div>
            <div>
              <span className="calc-fact-label">DELIVERY</span>
              <span className="calc-fact-value">{DELIVERY_DAYS[dest.zone]}</span>
            </div>
            <div>
              <span className="calc-fact-label">TRACKING</span>
              <span className="calc-fact-value">Included</span>
            </div>
          </div>

          {/* EMS bills per bracket, and people are surprised by it */}
          {weight < result.bracket && (
            <p className="calc-bracket-note">
              EMS charges by bracket, so {weight} g is billed at the{" "}
              {result.bracket >= 1000 ? `${result.bracket / 1000} kg` : `${result.bracket} g`} rate.
              Anything up to that weight costs the same — worth adding a second item.
            </p>
          )}

          {/* ── Customs ── */}
          {customs && (
            <div className={`calc-customs${dest.code === "US" ? " is-us" : ""}`}>
              <div className="calc-customs-head">
                <span className="calc-customs-label">IMPORT TAXES</span>
                <strong>{customs.summary}</strong>
              </div>
              <p className="calc-customs-detail">{customs.detail}</p>

              {customs.kizuna && (
                <div className="calc-kizuna">
                  <Maneki prop="coins" size={54} />
                  <div>
                    <strong>WE HANDLE IT</strong>
                    <p>{customs.kizuna}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="calc-cta">
            <a href="/request" className="btn btn-gold">REQUEST THIS ITEM</a>
            <span>Free quote, no commitment.</span>
          </div>

        </div>
      )}

      <p className="calc-disclaimer">
        Official Japan Post EMS rates, updated {RATES_UPDATED}. Shipping only —
        the item price and our service fee are quoted separately.
        Import taxes are set by your country, not by us.
      </p>
    </div>
  );
}
