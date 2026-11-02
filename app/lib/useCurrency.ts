// @ts-nocheck
"use client";

// Monnaie d'affichage du visiteur : choix sauvegardé > pays du visiteur (en-tête Vercel) > pays de la langue du navigateur > JPY.
// Les taux viennent de /api/rates (une seule requête par chargement de page).

import { useCallback, useEffect, useState } from "react";
import { convertYenText, countryFromLocale, currencyForCountry } from "./currency";

const KEY = "kizuna-currency";
let ratesPromise: Promise<any> | null = null;

function loadRates() {
  if (!ratesPromise) {
    ratesPromise = fetch("/api/rates")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return ratesPromise;
}

export function useCurrency(locale?: string) {
  const [currency, setCurrencyState] = useState("JPY");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let off = false;
    loadRates().then((d) => {
      if (off || !d?.rates) return;
      setData(d);
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch {}
      const guess = currencyForCountry(d.country) || currencyForCountry(countryFromLocale(navigator.language));
      const pick = [saved, guess].find((c) => c && (c === "JPY" || d.rates[c]));
      setCurrencyState(pick || "JPY");
    });
    return () => { off = true; };
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try { localStorage.setItem(KEY, code); } catch {}
  }, []);

  const rates = data?.rates || null;
  const rate = rates && currency !== "JPY" ? rates[currency] : null;
  const conv = useCallback((text: string) => convertYenText(text, rate, currency, locale), [rate, currency, locale]);
  const codes = rates ? ["JPY", ...Object.keys(rates).filter((c) => c !== "JPY").sort()] : [];

  return { currency, setCurrency, rates, codes, updated: data?.updated || null, conv, active: !!rate };
}
