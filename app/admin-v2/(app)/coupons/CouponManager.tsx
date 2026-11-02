"use client";

import { useState } from "react";
import { createCoupon, deleteCoupon, releaseRedemption, sendCouponEmail, setCouponActive } from "./actions";
import { formatJPY } from "../../lib/money";
import { useRun } from "../../components/useRun";
import { useL } from "../../components/LangProvider";
import { COUPON_KINDS, COUPON_KIND_LABELS, couponMessage, type CouponKind } from "../../../lib/coupons";
import type { CouponAdmin } from "../../lib/queriesCoupons";

const KINDS = Object.keys(COUPON_KINDS) as CouponKind[];

function kindLabel(t: (s: string) => string, kind: string) {
  // Les libellés viennent d'une table : on les écrit ici en clair pour que la traduction les trouve.
  if (kind === "christmas") return t("Noël");
  if (kind === "trustpilot") return t("Avis Trustpilot");
  if (kind === "reddit") return t("Avis Reddit");
  if (kind === "reddit_photo") return t("Avis Reddit avec photos");
  return t(COUPON_KIND_LABELS[kind] ?? "Autre");
}

// Création d'un coupon, et liste des coupons avec leurs utilisations.
export default function CouponManager({ coupons }: { coupons: CouponAdmin[] }) {
  const { pending, msg, setMsg, run } = useRun();
  const { t, date } = useL();
  const [kind, setKind] = useState<CouponKind>("trustpilot");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(String(COUPON_KINDS.trustpilot.amount));
  const [email, setEmail] = useState("");
  const [expires, setExpires] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [note, setNote] = useState("");

  function pickKind(k: CouponKind) {
    setKind(k);
    setAmount(String(COUPON_KINDS[k].amount));
    if (!COUPON_KINDS[k].personal) setEmail("");
  }

  const personal = COUPON_KINDS[kind].personal;
  const now = Date.now();

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ kind: "ok", text: t("Copié.") });
    } catch {
      setMsg({ kind: "error", text: t("Copie impossible : sélectionnez le texte à la main.") });
    }
  }

  return (
    <>
      <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <h2>{t("Créer un coupon")}</h2>
        <form
          style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => createCoupon({ kind, code, amount, email, expires, maxUses, note }),
              "Enregistré.",
              () => {
                setCode("");
                setEmail("");
                setNote("");
              },
            );
          }}
        >
          <div className="av2-grid cols-2">
            <div className="av2-field">
              <label htmlFor="cp-kind">{t("Type")}</label>
              <select id="cp-kind" className="av2-select" value={kind} onChange={(e) => pickKind(e.target.value as CouponKind)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{kindLabel(t, k)} — {formatJPY(COUPON_KINDS[k].amount)}</option>
                ))}
              </select>
            </div>
            <div className="av2-field">
              <label htmlFor="cp-amount">{t("Montant de la remise (¥)")}</label>
              <input id="cp-amount" className="av2-input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>
          <div className="av2-grid cols-2">
            <div className="av2-field">
              <label htmlFor="cp-code">{personal ? t("Code (laissez vide : un code aléatoire est créé)") : t("Code (ex. NOEL500)")}</label>
              <input id="cp-code" className="av2-input" value={code} maxLength={32} onChange={(e) => setCode(e.target.value.toUpperCase())} autoComplete="off" />
            </div>
            <div className="av2-field">
              <label htmlFor="cp-email">{personal ? t("Email du client (obligatoire)") : t("Email du client (facultatif)")}</label>
              <input id="cp-email" className="av2-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            </div>
          </div>
          <div className="av2-grid cols-2">
            <div className="av2-field">
              <label htmlFor="cp-exp">{t("Valable jusqu'au (facultatif, inclus)")}</label>
              <input id="cp-exp" className="av2-input" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
            </div>
            <div className="av2-field">
              <label htmlFor="cp-max">{t("Nombre d'utilisations maximum, tous clients (facultatif)")}</label>
              <input id="cp-max" className="av2-input" inputMode="numeric" value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))} placeholder={t("Illimité")} />
            </div>
          </div>
          <div className="av2-field">
            <label htmlFor="cp-note">{t("Note (facultatif)")}</label>
            <input id="cp-note" className="av2-input" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={t("Ex : avis Reddit du 12 nov., 3 photos")} />
          </div>
          <div>
            <button className="av2-btn" type="submit" disabled={pending || amount === ""}>{t("Créer le coupon")}</button>
          </div>
        </form>
        {msg ? <p className={msg.kind === "ok" ? "av2-ok" : "av2-error"} role="status">{msg.text}</p> : null}
      </div>

      <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <h2>{t("Coupons")}</h2>
        {coupons.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucun coupon pour l'instant.")}</p>
        ) : (
          coupons.map((c) => {
            const used = c.redemptions.filter((r) => r.status === "used");
            const reserved = c.redemptions.filter((r) => r.status === "reserved");
            const expired = c.expires_at != null && Date.parse(c.expires_at) < now;
            const message = couponMessage(c);
            const mailto = c.customer_email ? `mailto:${c.customer_email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}` : null;
            return (
              <div key={c.id} style={{ borderTop: "1px solid var(--av2-border)", paddingTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem 1rem", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontFamily: "monospace", fontSize: "1.05rem" }}>{c.code}</strong>{" "}
                    <span className="av2-tag muted">{kindLabel(t, c.kind)}</span>{" "}
                    <strong>{formatJPY(c.amount_jpy)}</strong>{" "}
                    {!c.active ? <span className="av2-tag alert">{t("Désactivé")}</span> : expired ? <span className="av2-tag alert">{t("Expiré")}</span> : <span className="av2-tag ok">{t("Actif")}</span>}
                    <small style={{ display: "block", color: "var(--av2-muted)" }}>
                      {c.customer_email ? t("Réservé à {e}", { e: c.customer_email }) : t("Valable pour tout client, une fois chacun")}
                      {c.expires_at ? ` · ${t("jusqu'au {d}", { d: date(new Date(Date.parse(c.expires_at)).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })) })}` : ""}
                      {c.max_total_uses ? ` · ${t("max {n} utilisations", { n: c.max_total_uses })}` : ""}
                      {` · ${t("{n} utilisé(s), {m} en cours", { n: used.length, m: reserved.length })}`}
                    </small>
                    {c.note ? <small style={{ display: "block" }}>{c.note}</small> : null}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    <button type="button" className="av2-btn ghost" onClick={() => copy(c.code)}>{t("Copier le code")}</button>
                    {c.customer_email ? (
                      <>
                        {mailto ? <a className="av2-btn ghost" href={mailto}>{t("Ouvrir dans ma messagerie")}</a> : null}
                        <button
                          type="button"
                          className="av2-btn ghost"
                          disabled={pending || !c.active}
                          onClick={() => {
                            if (window.confirm(t("Envoyer le coupon à {e} ?", { e: c.customer_email ?? "" }))) run(() => sendCouponEmail(c.id), "E-mail envoyé.");
                          }}
                        >
                          {t("Envoyer par email")}
                        </button>
                      </>
                    ) : (
                      <button type="button" className="av2-btn ghost" onClick={() => copy(`${message.subject}\n\n${message.body}`)}>{t("Copier le message")}</button>
                    )}
                    <button type="button" className="av2-btn ghost" disabled={pending} onClick={() => run(() => setCouponActive(c.id, !c.active), "Enregistré.")}>
                      {c.active ? t("Désactiver") : t("Réactiver")}
                    </button>
                    {c.redemptions.length === 0 ? (
                      <button
                        type="button"
                        className="av2-btn ghost"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm(t("Supprimer ce coupon ?"))) run(() => deleteCoupon(c.id), "Supprimé.");
                        }}
                      >
                        {t("Supprimer")}
                      </button>
                    ) : null}
                  </div>
                </div>

                {c.redemptions.length > 0 ? (
                  <div className="av2-tablewrap">
                    <table className="av2-table">
                      <thead>
                        <tr>
                          <th>{t("Client")}</th>
                          <th>{t("Statut")}</th>
                          <th>{t("Date")}</th>
                          <th className="r">{t("Remise")}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {c.redemptions.map((r) => (
                          <tr key={r.id}>
                            <td>
                              {r.client_email}
                              {r.payer_email && r.payer_email.toLowerCase() !== r.client_email ? <small>{t("Payé avec : {e}", { e: r.payer_email })}</small> : null}
                            </td>
                            <td>{r.status === "used" ? t("Utilisé") : r.status === "reserved" ? t("En cours (lien pas encore payé)") : t("Libéré")}</td>
                            <td className="av2-nowrap">{date((r.used_at ?? r.created_at).slice(0, 10))}</td>
                            <td className="r">{formatJPY(r.discount_jpy)}</td>
                            <td className="r">
                              {r.status === "reserved" ? (
                                <button type="button" className="av2-btn ghost" disabled={pending} onClick={() => run(() => releaseRedemption(r.id), "Enregistré.")}>{t("Libérer")}</button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
