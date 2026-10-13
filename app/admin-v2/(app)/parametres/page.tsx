import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadEntities, loadRoster } from "../../lib/queries";
import { MONTHLY_GOAL_JPY, NEXT_GOAL_JPY, REQUIRE_MFA } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { Banner, PageHead, Tag } from "../../components/ui";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Paramètres")} — ${t("Administration Kizuna")}` };
}

export default async function SettingsPage() {
  const access = await requireAccess();
  const L = await getL();
  const { t } = L;
  const sb = await createServerSupabase();

  let roster: Awaited<ReturnType<typeof loadRoster>> = { available: false, rows: [] };
  let entities: Awaited<ReturnType<typeof loadEntities>> = { available: false, rows: [] };
  try {
    [roster, entities] = await Promise.all([loadRoster(sb), loadEntities(sb)]);
  } catch {
    /* affichage dégradé */
  }

  const roleLabel = (r: string) => (r === "admin" ? t("Administrateur") : t("Staff"));

  return (
    <>
      <PageHead
        title={t("Paramètres")}
        subtitle={t("Compte, équipe, entités et sécurité. Cette page est en lecture seule : les changements se font pour l'instant dans Supabase.")}
        tags={<Tag kind="ro">{t("Lecture seule")}</Tag>}
      />

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>{t("Mon compte")}</h2>
          <dl className="av2-dl">
            <dt>{t("Nom")}</dt>
            <dd>{access.displayName}</dd>
            <dt>{t("Email")}</dt>
            <dd>{access.email}</dd>
            <dt>{t("Rôle")}</dt>
            <dd>{roleLabel(access.role)}</dd>
            <dt>{t("Second facteur (MFA)")}</dt>
            <dd>{access.mfaVerified ? <Tag kind="ok">{t("Vérifié pour cette session")}</Tag> : <Tag kind="alert">{t("Non vérifié (mode développement)")}</Tag>}</dd>
            <dt>{t("MFA exigé")}</dt>
            <dd>{REQUIRE_MFA ? t("Oui") : t("Non (développement local uniquement)")}</dd>
          </dl>
        </div>

        <div className="av2-card">
          <h2>{t("Objectifs mensuels")}</h2>
          <dl className="av2-dl">
            <dt>{t("Objectif actuel")}</dt>
            <dd>{formatJPY(MONTHLY_GOAL_JPY)}</dd>
            <dt>{t("Objectif suivant")}</dt>
            <dd>{formatJPY(NEXT_GOAL_JPY)}</dd>
          </dl>
          <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem", marginTop: "0.7rem" }}>
            {t("Valeurs communiquées le 13 octobre 2026, fixées dans le code pour l'instant.")} <Tag kind="soon">{t("Phase 1 : modifiables ici")}</Tag>
          </p>
        </div>
      </div>

      <div className="av2-card">
        <h2>{t("Équipe")}</h2>
        {!roster.available ? (
          <Banner kind="warn">
            {t("La table admin_users n'existe pas sur cette base : la migration de la phase 0 n'est pas appliquée.")}
          </Banner>
        ) : roster.rows.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{t("Aucun compte visible.")}</p>
        ) : (
          <div className="av2-tablewrap">
            <table className="av2-table">
              <thead>
                <tr>
                  <th>{t("Nom")}</th>
                  <th>{t("Email")}</th>
                  <th>{t("Rôle")}</th>
                  <th>{t("État")}</th>
                </tr>
              </thead>
              <tbody>
                {roster.rows.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.display_name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>{u.is_active ? <Tag kind="ok">{t("Actif")}</Tag> : <Tag kind="muted">{t("Désactivé")}</Tag>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem", marginTop: "0.7rem" }}>
          {t("Créer un compte ou changer un rôle : voir docs/admin-v2/ETAPES_MANUELLES.md (étape « Comptes individuels »).")}
        </p>
      </div>

      <div className="av2-card">
        <h2>{t("Entités fiscales")}</h2>
        {entities.rows.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{entities.available ? t("Aucune entité visible.") : t("Table business_entities absente (migration non appliquée).")}</p>
        ) : (
          <ul className="av2-list">
            {entities.rows.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong>
                <span style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
                  {e.active_from || e.active_to
                    ? `${e.active_from ? L.date(e.active_from) : "…"} → ${e.active_to ? L.date(e.active_to) : t("en cours")}`
                    : t("Dates de bascule non confirmées")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="av2-card">
        <h2>{t("Sécurité de cette interface")}</h2>
        <ul className="av2-list">
          <li><span>{t("Autorisation vérifiée côté serveur à chaque page")}</span><Tag kind="ok">{t("Oui")}</Tag></li>
          <li><span>{t("Rôle lu uniquement dans app_metadata (jamais user_metadata)")}</span><Tag kind="ok">{t("Oui")}</Tag></li>
          <li><span>{t("Clé service Supabase utilisée par l'admin-v2")}</span><Tag kind="ok">{t("Jamais")}</Tag></li>
          <li><span>{t("Écritures (commandes, liens, boutique…)")}</span><Tag kind="ok">{t("Administrateurs seulement, via le serveur")}</Tag></li>
          <li><span>{t("Suppression d'une commande")}</span><Tag kind="ok">{t("Impossible (on l'annule)")}</Tag></li>
          <li><span>{t("Journal d'audit (audit_log, ajout seul)")}</span>{roster.available ? <Tag kind="ok">{t("Disponible")}</Tag> : <Tag kind="soon">{t("Migration à appliquer")}</Tag>}</li>
        </ul>
      </div>
    </>
  );
}
