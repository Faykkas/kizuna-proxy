import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadPaymentLinks, type PaymentLinkRow } from "../../lib/queries";
import { currentMonthJst } from "../../lib/commissions";
import { BASE } from "../../lib/config";
import { formatJPY, toYen } from "../../lib/money";
import { shippingKind } from "../../lib/shipping";
import { Banner, DataError, PageHead, ReadOnlyTag, StaffNotice, StatCard, Tag } from "../../components/ui";
import LinkActions from "./LinkActions";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Liens de paiement")} — ${t("Administration Kizuna")}` };
}

const PAGE_SIZE = 25;
const STATUSES: Record<string, { label: string; kind: "ok" | "soon" | "muted" | "alert" }> = {
  pending: { label: "En attente", kind: "soon" },
  paid: { label: "Payé", kind: "ok" },
  cancelled: { label: "Annulé", kind: "muted" },
};

function totalOf(l: PaymentLinkRow): number {
  // amount_jpy est le total demandé au client ; à défaut, articles + frais + frais PayPal facturés.
  if (l.amount_jpy != null) return toYen(l.amount_jpy).yen;
  return toYen(l.item_amount_jpy).yen + toYen(l.fee_amount_jpy).yen + toYen(l.paypal_fee_jpy).yen;
}

function href(p: { q?: string; statut?: string; type?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.statut) sp.set("statut", p.statut);
  if (p.type) sp.set("type", p.type);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  const qs = sp.toString();
  return `${BASE}/liens-de-paiement${qs ? `?${qs}` : ""}`;
}

export default async function PaymentLinksPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; type?: string; page?: string }> }) {
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const statut = sp.statut && STATUSES[sp.statut] ? sp.statut : "";
  const type = sp.type === "livraison" ? "livraison" : "";
  const page = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Liens de paiement")} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let links: PaymentLinkRow[];
  try {
    links = await loadPaymentLinks(await createServerSupabase());
  } catch (e) {
    return (
      <>
        <PageHead title={t("Liens de paiement")} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const month = currentMonthJst();
  const pending = links.filter((l) => l.status === "pending");
  const paidThisMonth = links.filter((l) => l.status === "paid" && l.paid_at && l.paid_at.slice(0, 7) === month);
  const sum = (rows: PaymentLinkRow[]) => rows.reduce((s, l) => s + totalOf(l), 0);

  const needle = q.toLowerCase();
  const filtered = links.filter(
    (l) =>
      (!statut || l.status === statut) &&
      (!type || shippingKind(l) !== null) &&
      (!needle || `${l.label ?? ""} ${l.client_name ?? ""} ${l.client_email ?? ""}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);

  return (
    <>
      <PageHead
        title={t("Liens de paiement")}
        subtitle={t("Créez, copiez ou annulez un lien de paiement.")}
        tags={access.role === "admin" ? undefined : <ReadOnlyTag />}
      />

      <div className="av2-grid cols-3">
        <StatCard label={t("En attente de paiement")} value={pending.length} sub={t("{x} demandés", { x: formatJPY(sum(pending)) })} />
        <StatCard
          label={t("Payés ce mois-ci")}
          value={paidThisMonth.length}
          sub={
            <>
              {t("{x} encaissés", { x: formatJPY(sum(paidThisMonth)) })}
              <br />
              <span style={{ textTransform: "capitalize" }}>{L.monthLabel(month)}</span> {t("(heure de Tokyo)")}
            </>
          }
        />
        <div className="av2-card">
          <div className="av2-label">{t("Nouveau lien")}</div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--av2-muted)" }}>{t("Articles, frais Kizuna ou livraison.")}</p>
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {access.role === "admin" ? <Link className="av2-btn" href={`${BASE}/liens-de-paiement/nouveau`}>{t("+ Créer un lien")}</Link> : null}
          </div>
        </div>
      </div>

      <Banner kind="info">
        <strong>{t("« Livraison ? »")}</strong>{" "}
        {t(": lien dont le libellé parle d'envoi mais qui a été saisi comme des articles — son montant est donc compté dans le prix des articles de la commande. Les nouveaux liens ont un type explicite.")}
        <br />
        {t("L'adresse d'un lien (/pay/…) sert d'unique « clé » au client : elle n'est pas affichée, seulement copiable pour un lien en attente.")}
      </Banner>

      <form method="get" action={`${BASE}/liens-de-paiement`} className="av2-filters" role="search">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder={t("Rechercher : libellé, client, email…")} aria-label={t("Rechercher un lien")} />
        <select className="av2-select" name="statut" defaultValue={statut} aria-label={t("Filtrer par statut")}>
          <option value="">{t("Tous les statuts")}</option>
          {Object.entries(STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{t(v.label)}</option>
          ))}
        </select>
        <select className="av2-select" name="type" defaultValue={type} aria-label={t("Filtrer par type")}>
          <option value="">{t("Tous les types")}</option>
          <option value="livraison">{t("Livraisons uniquement")}</option>
        </select>
        <button className="av2-btn" type="submit">{t("Filtrer")}</button>
        {q || statut || type ? <Link className="av2-btn ghost" href={`${BASE}/liens-de-paiement`}>{t("Réinitialiser")}</Link> : null}
      </form>

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>{t("Libellé")}</th>
              <th>{t("Client")}</th>
              <th>{t("Statut")}</th>
              <th>{t("Dates (Tokyo)")}</th>
              <th className="r">{t("Détail")}</th>
              <th className="r">{t("Total")}</th>
              <th className="r">{t("Marge PayPal")}</th>
              {access.role === "admin" ? <th>{t("Actions")}</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>{t("Aucun lien ne correspond.")}</td>
              </tr>
            ) : (
              rows.map((l) => {
                const st = STATUSES[l.status ?? ""] ?? { label: l.status ?? "—", kind: "muted" as const };
                const charged = toYen(l.paypal_fee_jpy).yen;
                const margin = l.status === "paid" && l.paypal_real_fee_jpy != null && charged > 0 ? charged - toYen(l.paypal_real_fee_jpy).yen : null;
                const kind = shippingKind(l);
                return (
                  <tr key={l.id}>
                    <td>
                      <div className="av2-clip" style={{ maxWidth: 170 }} title={l.label ?? ""}>{l.label ?? "—"}</div>
                      <small>{kind === "explicit" ? t("Livraison") : kind === "guessed" ? t("Livraison ? (d'après le libellé)") : t("Articles")}</small>
                    </td>
                    <td style={{ maxWidth: 190, overflowWrap: "anywhere" }}>
                      {l.client_name ?? "—"}
                      <small>{l.client_email ?? ""}</small>
                    </td>
                    <td className="av2-nowrap"><Tag kind={st.kind}>{t(st.label)}</Tag></td>
                    <td className="av2-nowrap">
                      {L.shortDateTime(l.created_at)}
                      <small style={{ whiteSpace: "normal" }}>{l.paid_at ? t("payé {d}", { d: L.shortDateTime(l.paid_at) }) : t("pas encore payé")}</small>
                    </td>
                    <td className="r">
                      {l.is_shipping ? (
                        <div className="av2-money"><span>{t("Livraison")}</span> {formatJPY(toYen(l.fee_amount_jpy).yen)}</div>
                      ) : (
                        <>
                          {toYen(l.item_amount_jpy).yen > 0 ? <div className="av2-money"><span>{t("Articles")}</span> {formatJPY(toYen(l.item_amount_jpy).yen)}</div> : null}
                          {toYen(l.fee_amount_jpy).yen > 0 ? <div className="av2-money"><span>{t("Commission")}</span> {formatJPY(toYen(l.fee_amount_jpy).yen)}</div> : null}
                        </>
                      )}
                    </td>
                    <td className="r"><strong>{formatJPY(totalOf(l))}</strong></td>
                    <td className="r">{margin == null ? "—" : formatJPY(margin)}</td>
                    {access.role === "admin" ? <td className="av2-nowrap"><LinkActions id={l.id} status={l.status} label={l.label} /></td> : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="av2-pager">
        <span>{filtered.length > 1 ? t("{n} liens", { n: filtered.length }) : t("{n} lien", { n: filtered.length })} · {t("page {p} / {pages}", { p: Math.min(page, pages), pages })}</span>
        <div>
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, type, page: page - 1 })}>{t("← Précédente")}</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, type, page: page + 1 })}>{t("Suivante →")}</Link> : null}
        </div>
      </div>
    </>
  );
}
