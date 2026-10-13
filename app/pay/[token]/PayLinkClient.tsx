// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import PayLinkButton from "../../components/PayLinkButton";
import { useLanguage } from "../../lib/language";
import { LANG_LABELS } from "../../translations";
import { formatJPY } from "../../lib/orderStatus";
import { PAY_COPY, fill } from "../payTranslations";
import { describeItem } from "../describeItem";

const CONTACT = "kizunaproxy@gmail.com";

const Icon = {
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
  ),
  bigCheck: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
  ),
  alert: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></svg>
  ),
};

// Lignes du détail : articles, frais Kizuna / livraison, frais PayPal. Le total vient toujours de la base ;
// si les lignes ne le retrouvent pas exactement (anciens liens), on l'affiche tel quel plutôt que de tricher.
function buildRows(link, c) {
  const rows = [];
  const items = Array.isArray(link.itemsBreakdown) ? link.itemsBreakdown : [];
  if (items.length > 0) {
    for (const it of items) {
      const d = describeItem(it.name);
      // Le lien saisi à la création (it.url) passe avant celui qu'on déduit d'un nom qui serait une adresse.
      const own = typeof it.url === "string" && /^https?:\/\//i.test(it.url) ? it.url : null;
      rows.push({ key: `i${rows.length}`, name: d.title, href: own || d.href, price: Number(it.price_jpy) || 0 });
    }
  } else if (!link.isShipping && link.itemAmountJpy > 0) {
    const d = describeItem(link.label);
    rows.push({ key: "item", name: d.title, href: d.href, price: link.itemAmountJpy });
  }
  if (link.feeAmountJpy > 0) rows.push({ key: "fee", name: link.isShipping ? c.shipping : c.serviceFee, price: link.feeAmountJpy, fee: true });
  if (link.paypalFeeAmountJpy > 0) {
    const base = (link.itemAmountJpy || 0) + (link.feeAmountJpy || 0);
    const rate = base > 0 ? (link.paypalFeeAmountJpy / base) * 100 : 0;
    const hint = Math.abs(rate - 6) < 0.25 ? " (6%)" : "";
    rows.push({ key: "pp", name: `${c.paypalFee}${hint}`, price: link.paypalFeeAmountJpy, fee: true });
  }
  const sum = rows.reduce((s, r) => s + r.price, 0);
  if (sum !== link.amountJpy) {
    if (rows.length === 0) {
      const d = describeItem(link.label);
      rows.push({ key: "all", name: d.title, href: d.href, price: link.amountJpy });
    } else if (link.amountJpy > sum) {
      rows.push({ key: "other", name: c.other, price: link.amountJpy - sum, fee: true });
    }
  }
  return rows;
}

function Summary({ link, c, name, paid }) {
  const rows = useMemo(() => buildRows(link, c), [link, c]);
  const d = describeItem(link.label);
  return (
    <section className="pp-card" aria-labelledby="pp-title">
      <span className="pp-badge">{link.isShipping ? c.kindShipping : c.kindItems}</span>
      <h1 className="pp-title" id="pp-title">{d.title}</h1>
      <p className="pp-for">{name ? fill(c.requestFor, { name }) : c.requestGeneric}</p>

      <h2 className="pp-h2">{c.summary}</h2>
      <ul className="pp-lines">
        {rows.map(r => (
          <li key={r.key} className={`pp-line${r.fee ? " is-fee" : ""}`}>
            <div className="pp-line-name">
              {r.name}
              {r.href && (
                <span className="pp-line-sub">
                  <a href={r.href} target="_blank" rel="noopener noreferrer nofollow">{c.viewItem} ↗</a>
                </span>
              )}
            </div>
            <div className="pp-line-price">{formatJPY(r.price)}</div>
          </li>
        ))}
      </ul>

      <div className="pp-total">
        <span className="pp-total-label">{paid ? c.totalPaid : c.total}</span>
        <span className="pp-total-amt" aria-live="polite">{formatJPY(link.amountJpy)}</span>
      </div>
      <p className="pp-note">{c.currencyNote}</p>
    </section>
  );
}

export default function PayLinkClient({ token }) {
  const { lang, setLang } = useLanguage();
  const c = PAY_COPY[lang] || PAY_COPY.en;

  const [link, setLink] = useState(null);
  const [error, setError] = useState("");
  const [paidJustNow, setPaidJustNow] = useState(false);
  const [phone, setPhone] = useState("");
  const [wantsAltAddress, setWantsAltAddress] = useState(false);
  const [altAddress, setAltAddress] = useState("");

  useEffect(() => {
    fetch("/api/payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get", token }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) { setError(data.error === "Link not found" ? "notFound" : "loadError"); return; }
        setLink(data);
      })
      .catch(() => setError("loadError"));
  }, [token]);

  const paid = link && (link.status === "paid" || paidJustNow);
  const cancelled = link && link.status === "cancelled" && !paidJustNow;
  const payable = link && link.status === "pending" && !paidJustNow;
  const name = link?.clientFirstName || "";

  return (
    <div className="pp-page">
      <div className="pp-wrap">
        <header className="pp-top">
          <div className="pp-logo"><span>Kizuna</span> Proxy</div>
          <div className="pp-top-right">
            <span className="pp-secure">{Icon.lock} {c.secure}</span>
            <select className="pp-lang" value={lang} onChange={e => setLang(e.target.value)} aria-label={c.language}>
              {Object.entries(LANG_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>
        </header>

        {/* Erreur : lien introuvable ou chargement impossible */}
        {error && (
          <section className="pp-card pp-center" style={{ maxWidth: 520, margin: "2rem auto" }} role="alert">
            <div className="pp-status-icon warn">{Icon.alert}</div>
            <p className="pp-status-title">{error === "notFound" ? c.notFound : c.loadError}</p>
            <p className="pp-status-text">{c.notFoundHelp} <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          </section>
        )}

        {/* Chargement */}
        {!error && !link && (
          <div className="pp-grid" aria-busy="true" aria-label={c.loading}>
            <div className="pp-card">
              <div className="pp-skel" style={{ height: 22, width: 110, borderRadius: 999 }} />
              <div className="pp-skel" style={{ height: 34, width: "70%", margin: "1rem 0 0.6rem" }} />
              <div className="pp-skel" style={{ height: 18, width: "40%" }} />
              {[0, 1, 2].map(i => <div key={i} className="pp-skel" style={{ height: 44, margin: "1rem 0 0" }} />)}
            </div>
            <div className="pp-card">
              <div className="pp-skel" style={{ height: 20, width: "45%" }} />
              <div className="pp-skel" style={{ height: 46, margin: "1rem 0" }} />
              <div className="pp-skel" style={{ height: 46 }} />
            </div>
          </div>
        )}

        {/* Lien annulé */}
        {cancelled && (
          <section className="pp-card pp-center" style={{ maxWidth: 520, margin: "2rem auto" }}>
            <div className="pp-status-icon warn">{Icon.alert}</div>
            <p className="pp-status-title">{c.cancelled}</p>
            <p className="pp-status-text">{c.cancelledHelp} <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          </section>
        )}

        {/* Payé : on garde le détail visible comme reçu */}
        {paid && (
          <div className="pp-grid">
            <Summary link={link} c={c} name={name} paid={!!paid} />
            <section className="pp-card pp-center pp-sticky" role="status">
              <div className="pp-status-icon">{Icon.bigCheck}</div>
              <p className="pp-status-title">{c.paidTitle}</p>
              <p className="pp-status-text">{c.paidText}</p>
              <p className="pp-status-text">{c.paidReceipt}</p>
              <p className="pp-help" style={{ marginTop: "1.4rem" }}>{c.help} <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
            </section>
          </div>
        )}

        {/* À payer */}
        {payable && (
          <>
            <div className="pp-grid">
              <Summary link={link} c={c} name={name} paid={!!paid} />

              <section className="pp-card pp-sticky" aria-labelledby="pp-pay">
                <h2 className="pp-h2" style={{ margin: 0 }} id="pp-pay">{c.yourDetails}</h2>

                <div className="pp-field">
                  <label htmlFor="pp-phone">{c.phone}</label>
                  <input id="pp-phone" className="pp-input" type="tel" required autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={c.phonePh} />
                </div>

                <label className="pp-check">
                  <input type="checkbox" checked={wantsAltAddress} onChange={e => setWantsAltAddress(e.target.checked)} />
                  {c.altAddress}
                </label>
                {wantsAltAddress && (
                  <textarea className="pp-textarea" value={altAddress} onChange={e => setAltAddress(e.target.value)} placeholder={c.altPh} rows={3} aria-label={c.altAddress} />
                )}

                <div className="pp-paybox">
                  {phone.trim() ? (
                    <PayLinkButton token={token} phone={phone.trim()} shippingAddress={wantsAltAddress ? altAddress.trim() : ""} onPaid={() => setPaidJustNow(true)} />
                  ) : (
                    <p className="pp-hint">{c.needPhone}</p>
                  )}
                </div>

                <ul className="pp-trust">
                  <li>{Icon.check} {c.trust1}</li>
                  <li>{Icon.check} {c.trust2}</li>
                  <li>{Icon.check} {c.trust3}</li>
                </ul>
                <p className="pp-noaccount">{c.noAccount}</p>

                <h2 className="pp-h2">{c.nextTitle}</h2>
                <ol className="pp-steps">
                  <li>{c.next1}</li>
                  <li>{link.isShipping ? c.next2Ship : c.next2Items}</li>
                  <li>{link.isShipping ? c.next3Ship : c.next3Items}</li>
                </ol>
              </section>
            </div>
            <p className="pp-help">{c.help} <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          </>
        )}
      </div>
    </div>
  );
}
