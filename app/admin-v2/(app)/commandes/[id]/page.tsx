import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "../../../lib/access";
import { createServerSupabase } from "../../../lib/supabase-server";
import { getOrder } from "../../../lib/queries";
import { BASE } from "../../../lib/config";
import { formatJPY } from "../../../lib/money";
import { formatDateFr, formatDateTimeFr } from "../../../lib/status";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, StatusBadge } from "../../../components/ui";
import { trackingUrl } from "../../../../lib/orderStatus";

export const metadata = { title: "Détail de la commande — Administration Kizuna" };

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
  const { id: rawId } = await params;
  if (!/^\d{1,9}$/.test(rawId)) notFound();
  const id = Number(rawId);

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={`Commande #${id}`} tags={<ReadOnlyTag />} />
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
  const track = o.tracking_number ? trackingUrl(o.tracking_number, o.shipping_method ?? "") : null;

  return (
    <>
      <Link className="av2-back" href={`${BASE}/commandes`}>← Retour aux commandes</Link>
      <PageHead
        title={`Commande ${o.public_ref ?? `#${o.id}`}`}
        subtitle={<StatusBadge status={o.status} />}
        tags={<ReadOnlyTag />}
      />

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>Client</h2>
          <dl className="av2-dl">
            <Row label="Nom">{o.client_name}</Row>
            <Row label="Email">{o.client_email}</Row>
            <Row label="Téléphone">{o.client_phone}</Row>
            <Row label="Pays">{o.delivery_country}</Row>
            <Row label="Adresse">{o.shipping_address}</Row>
            <Row label="Compte client">{o.customer_id ? "Oui" : "Non (commande saisie à la main)"}</Row>
          </dl>
        </div>

        <div className="av2-card">
          <h2>Montants</h2>
          <dl className="av2-dl">
            <Row label="Prix des articles">{formatJPY(o.item_price_jpy)}</Row>
            <Row label="Commission">{formatJPY(o.service_fee_jpy)}</Row>
            <Row label="Livraison">
              {(o.shipping_cost_jpy ?? 0) > 0 ? `${formatJPY(o.shipping_cost_jpy)} — ${o.shipping_paid ? "payée" : "à payer"}` : "Non facturée"}
            </Row>
            <Row label="Paiement reçu">{o.payment_received ? "Oui" : "Non"}</Row>
            <Row label="Moyen de paiement">{o.payment_method}</Row>
          </dl>
          <p style={{ color: "var(--av2-muted)", fontSize: "0.8rem", marginTop: "0.7rem" }}>
            Champs d'origine de la base actuelle. Les paiements multiples et répartis arrivent avec le registre (phase 1).
          </p>
        </div>

        <div className="av2-card">
          <h2>Commande</h2>
          <dl className="av2-dl">
            <Row label="Date d'achat">{formatDateFr(o.purchase_date)}</Row>
            <Row label="Plateforme">{o.platform}</Row>
            <Row label="Communication">{o.communication}</Row>
            <Row label="Créée le">{formatDateTimeFr(o.created_at)}</Row>
            <Row label="Modifiée le">{formatDateTimeFr(o.updated_at)}</Row>
          </dl>
          <h3 style={{ margin: "0.9rem 0 0.35rem" }}>Articles</h3>
          <p className="av2-pre">{o.items || "—"}</p>
        </div>

        <div className="av2-card">
          <h2>Expédition</h2>
          <dl className="av2-dl">
            <Row label="Transporteur">{o.shipping_method}</Row>
            <Row label="Suivi">
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
                <Row label="Événement">{o.event_name}</Row>
                <Row label="Date de l'événement">{formatDateFr(o.event_date)}</Row>
                <Row label="Statut événement">{o.event_status}</Row>
                <Row label="Résultat">{o.event_result}</Row>
              </>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>Notes internes</h2>
          <p className="av2-pre">{o.admin_notes || "—"}</p>
          {o.notes ? (
            <>
              <h3 style={{ margin: "0.9rem 0 0.35rem" }}>Notes</h3>
              <p className="av2-pre">{o.notes}</p>
            </>
          ) : null}
        </div>

        <div className="av2-card">
          <h2>Historique des statuts</h2>
          {events.length === 0 ? (
            <p style={{ color: "var(--av2-muted)" }}>Aucun changement enregistré.</p>
          ) : (
            <ol className="av2-timeline">
              {events.map((e) => (
                <li key={e.id}>
                  <StatusBadge status={e.status} />
                  <small>{formatDateTimeFr(e.created_at)}</small>
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
