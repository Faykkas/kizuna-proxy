# Migrations Supabase

Compatible avec le CLI Supabase (`supabase db push`, `supabase migration list`).

| Dossier | Contenu |
|---|---|
| `migrations/` | Migrations « aller », nommées `AAAAMMJJHHMMSS_nom.sql`. **Additives et idempotentes** : elles créent des objets neufs, ne modifient jamais les tables existantes. |
| `rollback/` | Un fichier « retour » par migration, même préfixe, suffixe `.down.sql`. Le CLI Supabase n'a pas de commande *down* : on l'exécute à la main (SQL Editor). Il ne supprime que ce que la migration a créé. |
| `tests/` | Test automatique : `npm run test:sql` (PostgreSQL en mémoire PGlite). |

## Règles

1. Jamais de `DROP` ni de modification destructive sur une table existante. Seul l'ajout de colonnes **optionnelles** (nullables ou avec valeur par défaut) est toléré, et il doit avoir son retour arrière.
2. Toute migration a son retour arrière, **testé** (appliquer → retour → ré-appliquer).
3. Toute fonction créée est préfixée `kz_` pour ne jamais en écraser une existante.
4. On applique d'abord sur le **staging**. La production vient après sauvegarde et validation.
5. Les fichiers de données (`*.sql` de sauvegarde) ne vont pas dans Git.

## Migrations

| Fichier | Contenu |
|---|---|
| `20261013120000_admin_foundation.sql` | Phase 0 : rôles (`kz_*`), `admin_users`, `business_entities`, `audit_log`. |
| `20261013180000_payment_link_order_target.sql` | Choix de la commande qui reçoit un paiement : colonnes optionnelles `target_order_id` et `new_order` sur `payment_links`. |

Le schéma de départ de la production n'est pas versionné ici (il a été créé à la main dans Supabase). Il est décrit dans
`docs/admin-v2/SCHEMA_EXISTANT.md` ; pour le staging, voir `docs/admin-v2/ETAPES_MANUELLES.md` (étape 3).
