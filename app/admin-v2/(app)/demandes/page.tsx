import Link from "next/link";
import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { listRequests, REQUESTS_PAGE_SIZE } from "../../lib/queries";
import { REQUEST_STATUSES, REQUEST_STATUS_LABEL, type RequestStatus } from "../../lib/requestStatuses";
import { originOf } from "../../../lib/requestIntake.ts";
import { BASE } from "../../lib/config";
import FilterForm from "../../components/FilterForm";
import { RememberList } from "../../components/ListMemory";
import { DataError, PageHead, ReadOnlyTag, StaffNotice, Tag } from "../../components/ui";
import RequestActions from "./RequestActions";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Demandes")} — ${t("Administration Kizuna")}` };
}

type SearchParams = Promise<{ q?: string; statut?: string; page?: string }>;

const STATUS_TAG: Record<RequestStatus, "alert" | "muted" | "ok" | "soon"> = { new: "alert", read: "soon", converted: "ok", declined: "muted" };

function href(p: { q?: string; statut?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.statut) sp.set("statut", p.statut);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  const qs = sp.toString();
  return `${BASE}/demandes${qs ? `?${qs}` : ""}`;
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const statut = (REQUEST_STATUSES as readonly string[]).includes(sp.statut ?? "") ? sp.statut! : "";
  const page = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));
  // La lecture démarre en même temps que la vérification d'accès (la RLS protège les données quoi qu'il arrive).
  const dataP = createServerSupabase().then((sb) => listRequests(sb, { q, status: statut || undefined, page }));
  dataP.catch(() => {});

  const access = await requireAccess();
  const L = await getL();
  const { t } = L;

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Demandes")} tags={<ReadOnlyTag />} />
        <StaffNotice />
      </>
    );
  }

  let result;
  try {
    result = await dataP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("Demandes")} tags={<ReadOnlyTag />} />
        <DataError message={(e as Error).message} />
      </>
    );
  }
  const { rows, total } = result;
  const pages = Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE));
  const label = (s: string | null) => (s && s in REQUEST_STATUS_LABEL ? t(REQUEST_STATUS_LABEL[s as RequestStatus]) : (s ?? "—"));

  return (
    <>
      <PageHead title={t("Demandes")} subtitle={t("Les demandes envoyées par le formulaire du site. Chacune est enregistrée ici même si un email ou une notification n'arrive pas.")} />
      <RememberList name="demandes" />

      <FilterForm key={`${q}|${statut}`} action={`${BASE}/demandes`} className="av2-filters">
        <input className="av2-input" type="search" name="q" defaultValue={q} placeholder={t("Rechercher : nom, email, pays, article…")} aria-label={t("Rechercher une demande")} />
        <select className="av2-select" name="statut" defaultValue={statut} aria-label={t("Filtrer par statut")}>
          <option value="">{t("Tous les statuts")}</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(REQUEST_STATUS_LABEL[s])}
            </option>
          ))}
        </select>
        <button className="av2-btn" type="submit">{t("Filtrer")}</button>
        {q || statut ? <Link className="av2-btn ghost" href={`${BASE}/demandes`}>{t("Réinitialiser")}</Link> : null}
      </FilterForm>

      {rows.length === 0 ? (
        <p style={{ color: "var(--av2-muted)", padding: "1.4rem 0" }}>{t("Aucune demande ne correspond.")}</p>
      ) : (
        <div className="av2-reqs">
          {rows.map((r) => {
            const origin = originOf({ utm_source: r.utm_source, utm_content: r.utm_content, discovery_source: r.discovery_source });
            const business = r.lead_type === "business";
            const extra = [
              r.purchase_type === "visit" ? t("Visite en boutique") : null,
              r.budget ? `${t("Budget")} : ${r.budget}` : null,
              r.quantity ? `${t("Quantité")} : ${r.quantity}` : null,
              r.deadline ? `${t("Date limite")} : ${r.deadline}` : null,
              r.notes,
            ].filter(Boolean);
            return (
              <article key={r.id} className={`av2-card av2-req${r.status === "new" ? " is-new" : ""}`}>
                <header>
                  <div>
                    <strong>{r.name ?? "—"}</strong>
                    {business ? <> <Tag kind="soon">{t("Business")}</Tag></> : null}
                    <small>
                      {r.email ?? "—"} · {r.country ?? "—"}
                      {business && r.business_name ? ` · ${r.business_name}` : ""}
                    </small>
                  </div>
                  <div className="av2-req-meta">
                    <Tag kind={STATUS_TAG[r.status as RequestStatus] ?? "muted"}>{label(r.status)}</Tag>
                    <small>{L.dateTime(r.created_at)}</small>
                  </div>
                </header>
                <p className="av2-pre av2-req-items">{r.items ?? "—"}</p>
                {extra.length > 0 ? <p className="av2-req-extra">{extra.join(" · ")}</p> : null}
                <footer>
                  <small>
                    {t("Provenance")} : {origin}
                  </small>
                  {r.order_id ? (
                    <Link className="av2-link" href={`${BASE}/commandes/${r.order_id}`}>
                      {t("Commande #{id}", { id: r.order_id })}
                    </Link>
                  ) : null}
                  <RequestActions id={r.id} status={r.status} email={r.email} />
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <div className="av2-pager">
        <span>
          {total > 1 ? t("{n} demandes", { n: total }) : t("{n} demande", { n: total })} · {t("page {p} / {pages}", { p: Math.min(page, pages), pages })}
        </span>
        <div>
          {page > 1 ? <Link className="av2-btn ghost" href={href({ q, statut, page: page - 1 })}>{t("← Précédente")}</Link> : null}
          {page < pages ? <Link className="av2-btn ghost" href={href({ q, statut, page: page + 1 })}>{t("Suivante →")}</Link> : null}
        </div>
      </div>
    </>
  );
}
