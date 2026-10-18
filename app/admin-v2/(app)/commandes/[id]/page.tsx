import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "../../../lib/access";
import { createServerSupabase } from "../../../lib/supabase-server";
import { getL } from "../../../lib/lang-server";
import { getOrder, loadClientPayments } from "../../../lib/queries";
import { assignLinksToOrders, shippingAmount, shippingKind } from "../../../lib/shipping";
import { BASE } from "../../../lib/config";
import { formatJPY } from "../../../lib/money";
import { BackLink } from "../../../components/ListMemory";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatusBadge } from "../../../components/ui";
import { trackingUrl } from "../../../../lib/orderStatus";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Détail de la commande")} — ${t("Administration Kizuna")}` };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children || "—"}</dd>
    </>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;
  const { id: rawId } = await params;
  if (!/^\d{1,9}$/.test(rawId)) notFound();
  const id = Number(rawId);

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Commande #{id}", { id })} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  const sb = await createServerSupabase();
  let found;
  try {
    found = await getOrder(sb, id);
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }
  if (!found) notFound();
  const { order: o, events } = found;
  // Paiements reçus sur cette commande, rattachés par email et date (estimation).
  let payments: Awaited<ReturnType<typeof loadClientPayments>>["links"] = [];
  if (o.client_email) {
    try {
      const all = await loadClientPayments(sb, o.client_email);
      const owner = assignLinksToOrders(all.orders, all.links);
      payments = all.links.filter((l) => owner.get(l.id) === o.id);
    } catch {
      /* section facultative : on n'empêche pas l'affichage de la commande */
    }
  }
  const shippingLinks = payments.filter((l) => shippingKind(l) !== null);
  const shippingPaid = shippingLinks.reduce((s, l) => s + shippingAmount(l).amount, 0);
  const shippingMixed = shippingLinks.some((l) => shippingAmount(l).mixed);
  const track = o.tracking_number ? trackingUrl(o.tracking_number, o.shipping_method ?? "") : null;
  const ref = o.public_ref ?? `#${o.id}`;

  return (
    <>
      <BackLink className="av2-back" name="commandes" fallback={`${BASE}/commandes`}>{t("← Retour aux commandes")}</BackLink>
      <PageHead
        title={t("Commande {ref}", { ref })}
        subtitle={<StatusBadge status={o.status} />}
        tags={access.role === "admin" ? <Link className="av2-btn" href={`${BASE}/commandes/${o.id}/modifier`}>{t("Modifier")}</Link> : <ReadOnlyTag />}
      />

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>{t("Client")}</h2>
          <dl className="av2-dl">
            <Row label={t("Nom")}>{o.client_name}</Row>
            <Row label={t("Email")}>{o.client_email}</Row>
            <Row label={t("Téléphone")}>{o.client_phone}</Row>
            <Row label={t("Pays")}>{o.delivery_country}</Row>
            <Row label={t("Adresse")}>{o.shipping_address}</Row>
            <Row label={t("Compte client")}>{o.customer_id ? t("Oui") : t("Non (commande saisie à la main)")}</Row>
          </dl>
        </div>

        <div className="av2-card">
          <h2>{t("Montants")}</h2>
          <dl className="av2-dl">
            <Row label={t("Prix des articles")}>{formatJPY(o.item_price_jpy)}</Row>
            <Row label={t("Commission")}>{formatJPY(o.service_fee_jpy)}</Row>
            <Row label={t("Livraison")}>
              {(o.shipping_cost_jpy ?? 0) > 0 ? `${formatJPY(o.shipping_cost_jpy)} — ${o.shipping_paid ? t("payée") : t("à payer")}` : t("Non facturée")}
            </Row>
            <Row label={t("Livraison payée (estimée)")}>
              {shippingLinks.length > 0 ? `${formatJPY(shippingPaid)}${shippingMixed ? ` — ${t("au moins un lien mélange livraison et frais Kizuna")}` : ""}` : t("Aucun paiement de livraison trouvé")}
            </Row>
            <Row label={t("Paiement reçu")}>{o.payment_received ? t("Oui") : t("Non")}</Row>
            <Row label={t("Moyen de paiement")}>{o.payment_method}</Row>
          </dl>
          <p style={{ color: "var(--av2-muted)", fontSize: "0.8rem", marginTop: "0.7rem" }}>
            {t("Champs d'origine de la base actuelle. Les paiements multiples et répartis arrivent avec le registre (phase 1).")}
          </p>
        </div>

        <div className="av2-card">
          <h2>{t("Commande")}</h2>
          <dl className="av2-dl">
            <Row label={t("Date d'achat")}>{L.date(o.purchase_date)}</Row>
            <Row label={t("Plateforme")}>{o.platform}</Row>
            <Row label={t("Communication")}>{o.communication}</Row>
            <Row label={t("Créée le")}>{L.dateTime(o.created_at)}</Row>
            <Row label={t("Modifiée le")}>{L.dateTime(o.updated_at)}</Row>
          </dl>
          <h3 style={{ margin: "0.9rem 0 0.35rem" }}>{t("Articles")}</h3>
          <p className="av2-pre">{o.items || "—"}</p>
        </div>

        <div className="av2-card">
          <h2>{t("Expédition")}</h2>
          <dl className="av2-dl">
            <Row label={t("Transporteur")}>{o.shipping_method}</Row>
            <Row label={t("Suivi")}>
              {o.tracking_number ? (
                track ? (
                  <a href={track.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--av2-info)" }}>{o.tracking_number} ({track.carrier})</a>
                ) : (
                  o.tracking_number
                )
              ) : (
                ""
              )}
            </Row>
            {o.event_name || o.event_date ? (
              <>
                <Row label={t("Événement")}>{o.event_name}</Row>
                <Row label={t("Date de l'événement")}>{L.date(o.event_date)}</Row>
                <Row label={t("Statut événement")}>{o.event_status}</Row>
                <Row label={t("Résultat")}>{o.event_result}</Row>
              </>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="av2-card">
        <h2>{t("Paiements reçus (liens de paiement)")}</h2>
        {payments.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucun lien payé retrouvé pour cet email sur cette commande.")}</p>
        ) : (
          <div className="av2-tablewrap">
            <table className="av2-table">
              <thead>
                <tr>
                  <th>{t("Payé le")}</th>
                  <th>{t("Libellé")}</th>
                  <th>{t("Type")}</th>
                  <th className="r">{t("Montant payé")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((l) => {
                  const k = shippingKind(l);
                  const items = Array.isArray(l.items_breakdown) ? l.items_breakdown : [];
                  const fee = Math.round(l.fee_amount_jpy ?? 0);
                  const paypal = Math.round(l.paypal_fee_jpy ?? 0);
                  const itemsTotal = Math.round(l.item_amount_jpy ?? 0);
                  return (
                    <Fragment key={l.id}>
                      <tr>
                        <td>{L.dateTime(l.paid_at)}</td>
                        <td>{l.label}</td>
                        <td>{k === "explicit" ? t("Livraison") : k === "guessed" ? t("Livraison ? (d'après le libellé)") : t("Articles")}</td>
                        <td className="r"><strong>{formatJPY(l.amount_jpy)}</strong></td>
                      </tr>
                      <tr>
                        <td colSpan={4} style={{ paddingTop: 0, borderTop: 0 }}>
                          <div className="av2-invoice">
                            <small>{t("Détail du paiement")}</small>
                            {k === "explicit" ? (
                              <div><span>{t("Livraison")}</span><b>{formatJPY(fee)}</b></div>
                            ) : items.length > 0 ? (
                              items.map((it, i) => (
                                <div key={i}>
                                  <span>
                                    {/^https?:\/\//i.test(it.url ?? "") ? (
                                      <a className="av2-link" href={it.url!} target="_blank" rel="noopener noreferrer">{it.name || t("Article sans nom")}</a>
                                    ) : (
                                      it.name || t("Article sans nom")
                                    )}
                                  </span>
                                  <b>{formatJPY(it.price_jpy)}</b>
                                </div>
                              ))
                            ) : itemsTotal > 0 ? (
                              <div><span>{t("Articles (total seul, sans détail)")}</span><b>{formatJPY(itemsTotal)}</b></div>
                            ) : null}
                            {k !== "explicit" && fee > 0 ? <div><span>{t("Frais Kizuna")}</span><b>{formatJPY(fee)}</b></div> : null}
                            {paypal > 0 ? <div><span>{t("Frais PayPal")}</span><b>{formatJPY(paypal)}</b></div> : null}
                            <div className="total"><span>{t("Total payé")}</span><b>{formatJPY(l.amount_jpy)}</b></div>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
          {t("Rattachement estimé : les paiements du même email sont attribués à la commande la plus récente au moment du paiement. Les paiements de livraison saisis avant ce changement sont reconnus à leur libellé (« Shipping… », « Delivery… »).")}
        </p>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>{t("Notes internes")}</h2>
          <p className="av2-pre">{o.admin_notes || "—"}</p>
          {o.notes ? (
            <>
              <h3 style={{ margin: "0.9rem 0 0.35rem" }}>{t("Notes")}</h3>
              <p className="av2-pre">{o.notes}</p>
            </>
          ) : null}
        </div>

        <div className="av2-card">
          <h2>{t("Historique des statuts")}</h2>
          {events.length === 0 ? (
            <p style={{ color: "var(--av2-muted)" }}>{t("Aucun changement enregistré.")}</p>
          ) : (
            <ol className="av2-timeline">
              {events.map((e) => (
                <li key={e.id}>
                  <StatusBadge status={e.status} />
                  <small>{L.dateTime(e.created_at)}</small>
                  {e.note ? <span style={{ fontSize: "0.88rem" }}>{e.note}</span> : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
