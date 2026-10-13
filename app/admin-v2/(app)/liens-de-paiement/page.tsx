import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { loadPaymentLinks, type PaymentLinkRow } from "../../lib/queries";
import { currentMonthJst } from "../../lib/commissions";
import { BASE } from "../../lib/config";
import { formatJPY, toYen } from "../../lib/money";
import { formatDateTimeFr, monthLabelFr } from "../../lib/status";
import { shippingKind } from "../../lib/shipping";
import { Banner, DataError, PageHead, ReadOnlyTag, StaffNotice, StatCard, Tag } from "../../components/ui";

export const metadata = { title: "Liens de paiement — Administration Kizuna" };

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
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const statut = sp.statut && STATUSES[sp.statut] ? sp.statut : "";
  const type = sp.type === "livraison" ? "livraison" : "";
  const page = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));

  if (access.role === "staff") {
    return (
      <>
        <PageHead title="Liens de paiement" tags={<ReadOnlyTag />} />
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
        <PageHead title="Liens de paiement" tags={<ReadOnlyTag />} />
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
        title="Liens de paiement"
        subtitle="Créez un lien ici ; pour en annuler un, utilisez encore l'ancienne admin."
        tags={<ReadOnlyTag />}
      />

      <div className="av2-grid cols-3">
        <StatCard label="En attente de paiement" value={pending.length} sub={`${formatJPY(sum(pending))} demandés`} />
        <StatCard
          label="Payés ce mois-ci"
          value={paidThisMonth.length}
          sub={
            <>
              {formatJPY(sum(paidThisMonth))} encaissés
              <br />
              <span style={{ textTransform: "capitalize" }}>{monthLabelFr(month)}</span> (heure de Tokyo)
            </>
          }
        />
        <div className="av2-card">
          <div className="av2-label">Nouveau lien</div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--av2-muted)" }}>Articles, frais Kizuna ou livraison.</p>
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {access.role === "admin" ? <Link className="av2-btn" href={`${BASE}/liens-de-paiement/nouveau`}>+ Créer un lien</Link> : null}
            <Link className="av2-btn ghost" href="/admin" prefetch={false}>Ancienne admin</Link>
          </div>
        </div>
      </div>

      <Banner kind="info">
        <strong>« Livraison ? »</strong> : lien dont le libellé parle d'envoi mais qui a été saisi comme des articles — son montant est donc compté dans le prix des articles de la commande. Les nouveaux liens ont un type explicite.<br />
        L'adresse d'un lien (<code>/pay/…</code>) sert d'unique « clé » au client : elle n'est volontairement pas affichée ici.
      </Banner>

      <form method="get" action={`${BASE}/liens-de-paiement`} className="av2-filters" role="search">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder="Rechercher : libellé, client, email…" aria-label="Rechercher un lien" />
        <select className="av2-select" name="statut" defaultValue={statut} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="av2-select" name="type" defaultValue={type} aria-label="Filtrer par type">
          <option value="">Tous les types</option>
          <option value="livraison">Livraisons uniquement</option>
        </select>
        <button className="av2-btn" type="submit">Filtrer</button>
        {q || statut || type ? <Link className="av2-btn ghost" href={`${BASE}/liens-de-paiement`}>Réinitialiser</Link> : null}
      </form>

      <div className="av2-tablewrap">
        <table className="av2-table">
          <thead>
            <tr>
              <th>Libellé</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Type</th>
              <th>Créé</th>
              <th>Payé</th>
              <th className="r">Articles</th>
              <th className="r">Commission</th>
              <th className="r">Total</th>
              <th className="r">Marge PayPal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "var(--av2-muted)", padding: "1.6rem" }}>Aucun lien ne correspond.</td>
              </tr>
            ) : (
              rows.map((l) => {
                const st = STATUSES[l.status ?? ""] ?? { label: l.status ?? "—", kind: "muted" as const };
                const charged = toYen(l.paypal_fee_jpy).yen;
                const margin = l.status === "paid" && l.paypal_real_fee_jpy != null && charged > 0 ? charged - toYen(l.paypal_real_fee_jpy).yen : null;
                return (
                  <tr key={l.id}>
                    <td>
                      <div className="av2-clip" title={l.label ?? ""}>{l.label ?? "—"}</div>
                      
                    </td>
                    <td>
                      {l.client_name ?? "—"}
                      <small>{l.client_email ?? ""}</small>
                    </td>
                    <td><Tag kind={st.kind}>{st.label}</Tag></td>
                    <td>{(() => { const k = shippingKind(l); return k === "explicit" ? <Tag kind="ok">Livraison</Tag> : k === "guessed" ? <span title="Déduit du libellé : ce lien a été saisi comme des articles"><Tag kind="soon">Livraison ?</Tag></span> : <span style={{ color: "var(--av2-muted)" }}>Articles</span>; })()}</td>
                    <td>{formatDateTimeFr(l.created_at)}</td>
                    <td>{l.paid_at ? formatDateTimeFr(l.paid_at) : "—"}</td>
                    <td className="r">{l.is_shipping ? "—" : formatJPY(toYen(l.item_amount_jpy).yen)}</td>
                    <td className="r">{formatJPY(toYen(l.fee_amount_jpy).yen)}</td>
                    <td className="r"><strong>{formatJPY(totalOf(l))}</strong></td>
                    <td className="r">{margin == null ? "—" : formatJPY(margin)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="av2-pager">
        <span>{filtered.length} lien{filtered.length > 1 ? "s" : ""} · page {Math.min(page, pages)} / {pages}</span>
        <div>
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, type, page: page - 1 })}>← Précédente</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, type, page: page + 1 })}>Suivante →</Link> : null}
        </div>
      </div>
    </>
  );
}
