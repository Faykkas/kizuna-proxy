import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { loadEntities, loadRoster } from "../../lib/queries";
import { MONTHLY_GOAL_JPY, NEXT_GOAL_JPY, REQUIRE_MFA } from "../../lib/config";
import { formatJPY } from "../../lib/money";
import { formatDateFr } from "../../lib/status";
import { Banner, PageHead, Tag } from "../../components/ui";

export const metadata = { title: "Paramètres — Administration Kizuna" };

export default async function SettingsPage() {
  const access = await requireAccess();
  const sb = await createServerSupabase();

  let roster: Awaited<ReturnType<typeof loadRoster>> = { available: false, rows: [] };
  let entities: Awaited<ReturnType<typeof loadEntities>> = { available: false, rows: [] };
  try {
    [roster, entities] = await Promise.all([loadRoster(sb), loadEntities(sb)]);
  } catch {
    /* affichage dégradé */
  }

  return (
    <>
      <PageHead
        title="Paramètres"
        subtitle="Compte, équipe, entités et sécurité. Cette page est en lecture seule : les changements se font pour l'instant dans Supabase."
        tags={<Tag kind="ro">Lecture seule</Tag>}
      />

      <div className="av2-grid cols-2">
        <div className="av2-card">
          <h2>Mon compte</h2>
          <dl className="av2-dl">
            <dt>Nom</dt>
            <dd>{access.displayName}</dd>
            <dt>Email</dt>
            <dd>{access.email}</dd>
            <dt>Rôle</dt>
            <dd>{access.role === "admin" ? "Administrateur" : "Staff"}</dd>
            <dt>Second facteur (MFA)</dt>
            <dd>{access.mfaVerified ? <Tag kind="ok">Vérifié pour cette session</Tag> : <Tag kind="alert">Non vérifié (mode développement)</Tag>}</dd>
            <dt>MFA exigé</dt>
            <dd>{REQUIRE_MFA ? "Oui" : "Non (développement local uniquement)"}</dd>
          </dl>
        </div>

        <div className="av2-card">
          <h2>Objectifs mensuels</h2>
          <dl className="av2-dl">
            <dt>Objectif actuel</dt>
            <dd>{formatJPY(MONTHLY_GOAL_JPY)}</dd>
            <dt>Objectif suivant</dt>
            <dd>{formatJPY(NEXT_GOAL_JPY)}</dd>
          </dl>
          <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem", marginTop: "0.7rem" }}>
            Valeurs communiquées le 13 octobre 2026, fixées dans le code pour l'instant. <Tag kind="soon">Phase 1 : modifiables ici</Tag>
          </p>
        </div>
      </div>

      <div className="av2-card">
        <h2>Équipe</h2>
        {!roster.available ? (
          <Banner kind="warn">
            La table <code>admin_users</code> n'existe pas sur cette base : la migration de la phase 0 n'est pas appliquée.
          </Banner>
        ) : roster.rows.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>Aucun compte visible.</p>
        ) : (
          <div className="av2-tablewrap">
            <table className="av2-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {roster.rows.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.display_name}</td>
                    <td>{u.email}</td>
                    <td>{u.role === "admin" ? "Administrateur" : "Staff"}</td>
                    <td>{u.is_active ? <Tag kind="ok">Actif</Tag> : <Tag kind="muted">Désactivé</Tag>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem", marginTop: "0.7rem" }}>
          Créer un compte ou changer un rôle : voir <code>docs/admin-v2/ETAPES_MANUELLES.md</code> (étape « Comptes individuels »).
        </p>
      </div>

      <div className="av2-card">
        <h2>Entités fiscales</h2>
        {entities.rows.length === 0 ? (
          <p style={{ color: "var(--av2-muted)" }}>{entities.available ? "Aucune entité visible." : "Table business_entities absente (migration non appliquée)."}</p>
        ) : (
          <ul className="av2-list">
            {entities.rows.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong>
                <span style={{ color: "var(--av2-muted)", fontSize: "0.88rem" }}>
                  {e.active_from || e.active_to
                    ? `${e.active_from ? formatDateFr(e.active_from) : "…"} → ${e.active_to ? formatDateFr(e.active_to) : "en cours"}`
                    : "Dates de bascule non confirmées"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="av2-card">
        <h2>Sécurité de cette interface</h2>
        <ul className="av2-list">
          <li><span>Autorisation vérifiée côté serveur à chaque page</span><Tag kind="ok">Oui</Tag></li>
          <li><span>Rôle lu uniquement dans <code>app_metadata</code> (jamais <code>user_metadata</code>)</span><Tag kind="ok">Oui</Tag></li>
          <li><span>Clé service Supabase utilisée par l'admin-v2</span><Tag kind="ok">Jamais</Tag></li>
          <li><span>Écriture sur les données existantes</span><Tag kind="ok">Aucune (lecture seule)</Tag></li>
          <li><span>Flux PayPal existants</span><Tag kind="ok">Non modifiés</Tag></li>
          <li><span>Journal d'audit (<code>audit_log</code>, ajout seul)</span>{roster.available ? <Tag kind="ok">Disponible</Tag> : <Tag kind="soon">Migration à appliquer</Tag>}</li>
        </ul>
      </div>
    </>
  );
}
