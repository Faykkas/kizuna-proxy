import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { loadEntities } from "../../lib/queries";
import { formatDateFr } from "../../lib/status";
import { Banner, PageHead, SoonCard, Tag } from "../../components/ui";

export const metadata = { title: "Comptabilité — Administration Kizuna" };

const STEPS = [
  { name: "Prévue", text: "La commission attendue sur une commande enregistrée." },
  { name: "Facturée", text: "Demandée au client (lien de paiement, devis)." },
  { name: "Encaissée", text: "Paiement réellement reçu, frais PayPal déduits." },
  { name: "Remboursée", text: "Rendue au client, totalement ou en partie." },
];

const ENTRY_TYPES = [
  ["Avance client", "Argent reçu pour acheter les articles — n'est pas une commission."],
  ["Commission", "Frais de service Kizuna."],
  ["Livraison", "Frais d'expédition facturés, puis réels."],
  ["Remboursement", "Sortie d'argent vers le client."],
  ["Dépense", "Dépense professionnelle, avec justificatif."],
  ["Frais PayPal", "Frais réellement prélevés sur chaque paiement."],
  ["Transfert", "Mouvement entre comptes (ex. PayPal vers banque)."],
];

export default async function AccountingPage() {
  await requireAccess();
  const sb = await createServerSupabase();
  let entities: Awaited<ReturnType<typeof loadEntities>> = { available: false, rows: [] };
  try {
    entities = await loadEntities(sb);
  } catch {
    /* affichage dégradé : la page reste un aperçu */
  }

  return (
    <>
      <PageHead
        title="Comptabilité"
        subtitle="Registre financier — aperçu de ce qui sera construit."
        tags={<Tag kind="soon">Phase 1 · non fonctionnel</Tag>}
      />

      <Banner kind="warn">
        <strong>Cette page n'affiche aucun montant.</strong> Le registre financier n'existe pas encore : rien n'est calculé ni
        inventé ici. Les commissions provisoires du tableau de bord viennent de l'ancienne formule, pas de ce registre.
        <br />
        Aucune déclaration fiscale n'est produite automatiquement. Les règles (traitement des avances clients, taxe de consommation,
        PayPal de Mayuko) restent à valider avec un comptable japonais.
      </Banner>

      <div className="av2-card">
        <h2>Entités fiscales</h2>
        {entities.available && entities.rows.length > 0 ? (
          <ul className="av2-list">
            {entities.rows.map((e) => (
              <li key={e.id}>
                <span>
                  <strong>{e.name}</strong>
                  <small style={{ display: "block", color: "var(--av2-muted)" }}>{e.notes}</small>
                </span>
                <span style={{ textAlign: "right", color: "var(--av2-muted)", fontSize: "0.88rem" }}>
                  {e.active_from || e.active_to
                    ? `${e.active_from ? formatDateFr(e.active_from) : "…"} → ${e.active_to ? formatDateFr(e.active_to) : "en cours"}`
                    : "Dates non confirmées"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--av2-muted)", fontSize: "0.9rem" }}>
            {entities.available
              ? "Aucune entité visible (la lecture exige une session avec MFA)."
              : "Table des entités absente : la migration de la phase 0 n'est pas encore appliquée sur cette base."}{" "}
            Prévu : activité Mayuko (actuelle) et future activité Samuel, avec une date de bascule à confirmer.
          </p>
        )}
        <p style={{ color: "var(--av2-muted)", fontSize: "0.85rem", marginTop: "0.7rem" }}>
          Le changement d'entité n'efface rien et ne transfère aucun revenu historique : chaque écriture restera rattachée à
          l'entité qui l'a perçue.
        </p>
      </div>

      <div>
        <h2 style={{ margin: "0.4rem 0 0.7rem" }}>Cycle de vie d'une commission</h2>
        <div className="av2-steps">
          {STEPS.map((s, i) => (
            <div className="av2-step" key={s.name}>
              <b>
                {i + 1}. {s.name}
              </b>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="av2-grid cols-2">
        <SoonCard title="Journal financier" phase="Phase 1">
          Une ligne par mouvement, jamais modifiée après coup (une correction est une écriture inverse). Conserve le montant brut,
          la devise d'origine, la conversion en yens, les frais et la référence de transaction.
        </SoonCard>
        <SoonCard title="Paiements multiples et répartis" phase="Phase 1">
          Une commande peut recevoir plusieurs paiements ; un paiement peut être réparti entre plusieurs commandes. La somme des
          répartitions doit égaler le paiement.
        </SoonCard>
      </div>

      <div className="av2-card">
        <h2>Types d'écritures prévus</h2>
        <ul className="av2-list">
          {ENTRY_TYPES.map(([name, text]) => (
            <li key={name}>
              <strong>{name}</strong>
              <span style={{ color: "var(--av2-muted)", textAlign: "right", fontSize: "0.88rem" }}>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="av2-grid cols-3">
        <SoonCard title="Dépenses et justificatifs" phase="Phase 1" />
        <SoonCard title="Périodes et clôtures" phase="Phase 1" />
        <div className="av2-soon-card">
          <h3>
            Export CSV comptable <Tag kind="soon">Phase 1 · non disponible</Tag>
          </h3>
          <p style={{ fontSize: "0.88rem", marginBottom: "0.7rem" }}>Pour votre comptable japonais, par période et par entité.</p>
          <button className="av2-btn" type="button" disabled aria-disabled="true">Exporter</button>
        </div>
      </div>
    </>
  );
}
