"use client";

import { useEffect, useState, useTransition } from "react";
import { createPaymentLink, listClientOrders, type ClientOrder, type CreateResult } from "./actions";
import { looksLikeShipping, paypalFee } from "../../../lib/shipping";
import { formatJPY } from "../../../lib/money";
import { currentMonthJst } from "../../../lib/commissions";
import { monthLabelFr, statusInfo } from "../../../lib/status";

// Domaine public où le client ouvre le lien (identique à l'ancienne admin).
const SITE_URL = "https://kizunaproxy.com";

type Kind = "articles" | "shipping";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : 0);

export default function NewLinkForm() {
  const [kind, setKind] = useState<Kind>("articles");
  const [label, setLabel] = useState("");
  const [items, setItems] = useState([{ name: "", price: "" }]);
  const [fee, setFee] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [confirmArticles, setConfirmArticles] = useState(false);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [orderTarget, setOrderTarget] = useState("auto"); // "auto" | "new" | id de commande
  const [result, setResult] = useState<CreateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  // Charge les commandes du client dès que l'email est complet (pour choisir où va le paiement).
  useEffect(() => {
    if (!EMAIL_RE.test(clientEmail.trim())) return;
    let cancelled = false;
    const t = setTimeout(() => {
      listClientOrders(clientEmail)
        .then((list) => {
          if (cancelled) return;
          setOrders(list);
          setOrderTarget((cur) => (cur === "auto" || cur === "new" || list.some((o) => String(o.id) === cur) ? cur : "auto"));
        })
        .catch(() => {
          if (!cancelled) setOrders([]);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [clientEmail]);

  const itemAmount = kind === "shipping" ? 0 : items.reduce((s, it) => s + num(it.price), 0);
  const feeAmount = num(fee);
  const paypal = paypalFee(itemAmount, feeAmount);
  const total = itemAmount + feeAmount + paypal;

  // Le piège d'origine : un paiement « Shipping… » saisi comme des articles n'est jamais
  // enregistré comme livraison sur la commande. On bloque tant que ce n'est pas confirmé.
  // Tant que l'email est incomplet, aucune commande n'est proposée (et le choix revient à « automatique »).
  const emailOk = EMAIL_RE.test(clientEmail.trim());
  const shownOrders = emailOk ? orders : [];
  const chosenOrder = shownOrders.find((o) => String(o.id) === orderTarget) ?? null;
  const suspicious = kind === "articles" && looksLikeShipping(label) && !confirmArticles;
  const canSubmit = !pending && label.trim() !== "" && total > 0 && !suspicious;

  function submit() {
    setResult(null);
    startTransition(async () => {
      // Une commande précise n'est envoyée que si l'email est complet (sinon elle n'était pas affichée).
      const target = orderTarget === "new" || (emailOk && shownOrders.some((o) => String(o.id) === orderTarget)) ? orderTarget : "auto";
      setResult(await createPaymentLink({ kind, label, items, feeAmount: fee, clientName, clientEmail, orderTarget: target }));
    });
  }

  function reset() {
    setResult(null);
    setLabel("");
    setItems([{ name: "", price: "" }]);
    setFee("");
    setClientName("");
    setClientEmail("");
    setConfirmArticles(false);
    setOrders([]);
    setOrderTarget("auto");
    setCopied(false);
  }

  if (result?.ok) {
    const url = `${SITE_URL}/pay/${result.id}`;
    return (
      <div className="av2-card" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <h2>Lien créé</h2>
        <p>
          Total demandé au client : <strong>{formatJPY(result.total)}</strong>
        </p>
        <div className="av2-secret">{url}</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="av2-btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copié ✓" : "Copier le lien"}
          </button>
          <button type="button" className="av2-btn ghost" onClick={reset}>Créer un autre lien</button>
        </div>
        <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem" }}>
          Envoyez ce lien au client. Quiconque le possède peut payer : ne le publiez pas.
        </p>
      </div>
    );
  }

  return (
    <form
      className="av2-card"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
    >
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="av2-label" style={{ marginBottom: "0.4rem" }}>Type de paiement</legend>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {(
            [
              ["articles", "Articles / frais Kizuna", "Achat d'articles, réservation, commission."],
              ["shipping", "Livraison (shipping)", "Le prix d'envoi sera enregistré sur la commande."],
            ] as [Kind, string, string][]
          ).map(([k, title, hint]) => (
            <label key={k} className="av2-card" style={{ flex: "1 1 220px", cursor: "pointer", borderColor: kind === k ? "var(--av2-accent)" : undefined }}>
              <input type="radio" name="kind" checked={kind === k} onChange={() => { setKind(k); setConfirmArticles(false); }} /> <strong>{title}</strong>
              <div className="av2-sub">{hint}</div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="av2-field">
        <label htmlFor="label">Libellé (ce que le client voit)</label>
        <input id="label" className="av2-input" value={label} onChange={(e) => { setLabel(e.target.value); setConfirmArticles(false); }} placeholder={kind === "shipping" ? "Ex : Shipping to america" : "Ex : Commande figurines x3"} maxLength={200} />
      </div>

      {kind === "articles" ? (
        <div className="av2-field">
          <label>Articles (facultatif si vous ne facturez que des frais Kizuna)</label>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input className="av2-input" style={{ flex: 3, maxWidth: "none" }} placeholder="Nom ou lien de l'article" value={it.name} maxLength={127} onChange={(e) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label={`Article ${i + 1}`} />
              <input className="av2-input" style={{ flex: 1, maxWidth: "none" }} placeholder="Prix ¥" inputMode="numeric" value={it.price} onChange={(e) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, "") } : x)))} aria-label={`Prix de l'article ${i + 1}`} />
              {items.length > 1 ? (
                <button type="button" className="av2-btn ghost" onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))} aria-label={`Retirer l'article ${i + 1}`}>×</button>
              ) : null}
            </div>
          ))}
          <div>
            <button type="button" className="av2-btn ghost" onClick={() => setItems((arr) => [...arr, { name: "", price: "" }])}>+ Ajouter un article</button>
          </div>
        </div>
      ) : null}

      <div className="av2-field">
        <label htmlFor="fee">{kind === "shipping" ? "Montant de la livraison (¥)" : "Frais Kizuna (¥)"}</label>
        <input id="fee" className="av2-input" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} placeholder="0" />
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-field">
          <label htmlFor="cname">Nom du client (facultatif)</label>
          <input id="cname" className="av2-input" value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={120} />
        </div>
        <div className="av2-field">
          <label htmlFor="cemail">Email du client (recommandé)</label>
          <input id="cemail" className="av2-input" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          <span className="av2-sub">C'est l'email qui rattache le paiement à la bonne commande.</span>
        </div>
      </div>

      <div className="av2-field">
        <label htmlFor="order">Commande qui reçoit ce paiement</label>
        <select id="order" className="av2-select" value={orderTarget} onChange={(e) => setOrderTarget(e.target.value)}>
          <option value="auto">Automatique — commande ouverte du mois, sinon nouvelle commande</option>
          <option value="new">Nouvelle commande</option>
          {shownOrders.map((o) => (
            <option key={o.id} value={String(o.id)}>
              {o.ref} · {o.purchaseDate ?? "sans date"} · {statusInfo(o.status).label} · {formatJPY(o.itemPrice)}
              {o.itemsSummary ? ` · ${o.itemsSummary}` : ""}
            </option>
          ))}
        </select>
        <span className="av2-sub">
          {emailOk && shownOrders.length === 0
            ? "Aucune commande trouvée pour cet email."
            : "Renseignez l'email du client pour choisir une de ses commandes. Choisir une commande y ajoute le paiement même si elle date d'un autre mois."}
        </span>
      </div>

      {chosenOrder && kind === "articles" && (chosenOrder.purchaseDate ?? "").slice(0, 7) !== currentMonthJst() ? (
        <div className="av2-banner warn" role="note">
          <div>
            <strong>Commande d'un autre mois.</strong> La commission de ce paiement sera comptée dans les statistiques de{" "}
            <span style={{ textTransform: "capitalize" }}>{chosenOrder.purchaseDate ? monthLabelFr(chosenOrder.purchaseDate.slice(0, 7)) : "sa date"}</span>{" "}
            (le mois de la commande), pas dans le mois du paiement. Seule la marge PayPal suit la date du paiement.
          </div>
        </div>
      ) : null}

      <div className="av2-card" style={{ background: "var(--av2-surface-2)" }}>
        <dl className="av2-dl" style={{ gridTemplateColumns: "1fr auto" }}>
          {kind === "articles" ? (
            <>
              <dt>Articles</dt>
              <dd>{formatJPY(itemAmount)}</dd>
            </>
          ) : null}
          <dt>{kind === "shipping" ? "Livraison" : "Frais Kizuna"}</dt>
          <dd>{formatJPY(feeAmount)}</dd>
          <dt>Frais PayPal (6 %)</dt>
          <dd>{formatJPY(paypal)}</dd>
          <dt><strong>Total demandé au client</strong></dt>
          <dd><strong>{formatJPY(total)}</strong></dd>
        </dl>
      </div>

      {suspicious ? (
        <div className="av2-banner warn" role="alert">
          <div>
            <strong>Ce libellé ressemble à une livraison.</strong> Si c'est le prix d'envoi, choisissez le type « Livraison » : sinon le
            montant est compté comme des articles et vous ne retrouverez pas le prix de livraison de la commande.
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
              <button type="button" className="av2-btn" onClick={() => { setKind("shipping"); setFee(String(itemAmount || feeAmount || "")); setItems([{ name: "", price: "" }]); }}>
                Passer en « Livraison »
              </button>
              <button type="button" className="av2-btn ghost" onClick={() => setConfirmArticles(true)}>Non, ce sont bien des articles</button>
            </div>
          </div>
        </div>
      ) : null}

      {result && !result.ok ? <p className="av2-error" role="alert">{result.error}</p> : null}

      <div>
        <button className="av2-btn" type="submit" disabled={!canSubmit}>
          {pending ? "Création…" : "Créer le lien"}
        </button>
      </div>
    </form>
  );
}
