// @ts-nocheck
"use client";
// app/components/CookieConsent.tsx
//
// Trustpilot's invite script and the Google Ads tag set third-party cookies and can
// identify a visitor across sessions, so they only load after explicit consent. Vercel
// Analytics stays unconditional — it's first-party, cookie-free and doesn't
// fingerprint visitors, which is why it's treated as "necessary" here rather
// than gated behind this banner.
//
// Choice is stored in localStorage so it survives reloads; the footer's
// "Cookie preferences" link dispatches a window event to reopen this banner
// so a visitor can change their mind later.

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/language";

// v2 : le consentement a été redemandé quand la balise Google Ads a été ajoutée (l'ancien « accepté » ne couvrait que Trustpilot).
const CONSENT_KEY = "kizuna-cookie-consent-v2";
const GOOGLE_ADS_ID = "AW-18550874446";
const REOPEN_EVENT = "kizuna-open-cookie-prefs";

function loadOptionalScripts() {
  if (typeof window === "undefined" || window.__kizunaOptionalLoaded) return;
  window.__kizunaOptionalLoaded = true;

  const tp = document.createElement("script");
  tp.innerHTML = `
    (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
    a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
    f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
    tp('register', '08lU7DhAN84FqIu4');
  `;
  document.body.appendChild(tp);

  // Google Ads (balise gtag.js) : mesure des annonces et remarketing, uniquement après consentement.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  const g = document.createElement("script");
  g.async = true;
  g.src = "https://www.googletagmanager.com/gtag/js?id=" + GOOGLE_ADS_ID;
  document.head.appendChild(g);
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

const COPY = {
  en: {
    text: "We use optional cookies (Trustpilot reviews and Google Ads measurement) to improve your experience. Necessary cookies for sign-in and language always apply.",
    learnMore: "Learn more",
    necessary: "Necessary only",
    accept: "Accept all",
  },
  fr: {
    text: "Nous utilisons des cookies optionnels (avis Trustpilot et mesure des annonces Google Ads) pour améliorer votre expérience. Les cookies nécessaires à la connexion et à la langue restent toujours actifs.",
    learnMore: "En savoir plus",
    necessary: "Nécessaires uniquement",
    accept: "Tout accepter",
  },
};

export default function CookieConsent() {
  const { lang } = useLanguage();
  const c = COPY[lang] || COPY.en;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch {}
    if (!stored) setVisible(true);
    else if (stored === "accepted") loadOptionalScripts();

    function reopen() { setVisible(true); }
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  function accept() {
    try { localStorage.setItem(CONSENT_KEY, "accepted"); } catch {}
    setVisible(false);
    loadOptionalScripts();
  }
  function reject() {
    try { localStorage.setItem(CONSENT_KEY, "rejected"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie preferences">
      <p className="cookie-banner-text">
        {c.text} <a href="/privacy-policy">{c.learnMore}</a>
      </p>
      <div className="cookie-banner-actions">
        <button onClick={reject} className="btn btn-outline">{c.necessary}</button>
        <button onClick={accept} className="btn btn-gold">{c.accept}</button>
      </div>
    </div>
  );
}

export function reopenCookiePreferences() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REOPEN_EVENT));
}
