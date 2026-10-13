# Étapes manuelles — Supabase et Vercel

Rien de ce qui suit n'a été fait. Je (Claude) n'ai exécuté **aucune** migration, n'ai créé **aucun** compte et n'ai **rien déployé**.
Les étapes sont dans l'ordre. Les trois premières (sauvegardes, export RLS, projet de staging) sont à faire **avant** tout le reste.

## 0. Avant de pousser quoi que ce soit sur GitHub — Vercel

La branche `admin-v2` existe seulement en local. **Ne la poussez pas avant l'étape suivante.**

Vercel crée automatiquement un déploiement « Preview » pour toute branche poussée, et **les Previews utilisent par défaut les mêmes variables d'environnement que la production** — donc la vraie base Supabase.

1. Vercel → projet → *Settings* → *Environment Variables*.
2. Pour `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (et `..._PUBLISHABLE_KEY` si présente) : ajouter des valeurs **Preview uniquement** qui pointent vers le **staging** (étape 3).
3. Ne **jamais** définir `ADMIN_V2_REQUIRE_MFA` sur Vercel (le MFA est de toute façon obligatoire en production, la variable y est ignorée).
4. Ne rien changer aux variables *Production*.

Tant que ces valeurs Preview ne sont pas posées, ne poussez pas la branche.

## 1. Vérifier les sauvegardes (je ne peux pas le voir d'ici)

Supabase → projet → *Database* → *Backups*.

- Notez votre offre (Free / Pro). L'offre **Free** n'a pas de sauvegarde automatique téléchargeable ; **Pro** garde des sauvegardes quotidiennes ; la restauration à un instant précis (PITR) est une option payante.
- Si vous n'avez pas de sauvegarde quotidienne : faites une copie manuelle **maintenant** (voir ci-dessous) et décidez de passer à l'offre Pro avant d'y mettre de la comptabilité.
- Copie manuelle (Supabase CLI installée et connectée) :
  ```bash
  supabase db dump --linked -f sauvegarde-donnees-AAAA-MM-JJ.sql --data-only
  ```
  Ce fichier contient des données clientes : ne le mettez pas dans le dépôt Git (`*.sql` de données à garder hors du projet).
- Testez une restauration au moins une fois **sur le staging**, pas sur la production.

## 2. Exporter les politiques RLS existantes

Les politiques RLS, triggers et index ne sont pas visibles depuis l'API (voir la fin de `SCHEMA_EXISTANT.md`).

1. Supabase → *SQL Editor* → exécuter, une par une, les 5 requêtes (lecture seule) de la section « Compléments à exporter ».
2. Coller les résultats dans `docs/admin-v2/RLS_EXPORT.md`. Ils me serviront à écrire les politiques « staff » de la phase 3 sans casser l'existant.

## 3. Créer le projet de staging

1. supabase.com → *New project* → nom `kizuna-staging`, **même région** que la production.
2. Récupérer *Project URL* et la clé *anon* / *publishable* (jamais la clé *service* dans un fichier du dépôt).
3. Copier le **schéma sans données** de la production vers le staging :
   ```bash
   supabase link --project-ref <ref-production>
   supabase db dump --linked -f supabase/baseline_schema.sql        # schéma seul, sans données
   supabase link --project-ref <ref-staging>
   ```
   puis exécuter `baseline_schema.sql` dans le *SQL Editor* du staging. Ne copiez **pas** les données de production dans le staging (données personnelles de clients).
4. Dupliquer `docs/admin-v2/env.staging.example` en `.env.local` pour travailler sur le staging.

## 4. Appliquer la migration de la phase 0 — d'abord sur le staging

Fichiers : `supabase/migrations/20261013120000_admin_foundation.sql` (aller) et `supabase/rollback/20261013120000_admin_foundation.down.sql` (retour).

1. Staging → *SQL Editor* → coller et exécuter le fichier « aller ». Il ne crée que : `admin_users`, `business_entities`, `audit_log` et huit fonctions préfixées `kz_`. Aucune table existante n'est touchée.
2. Vérifier : les trois tables existent ; `select * from public.business_entities;` renvoie `Mayuko` et `Samuel` sans dates.
3. **Tester le retour arrière** : exécuter le fichier « retour », vérifier que les trois tables ont disparu et que `orders` est intacte, puis ré-exécuter le fichier « aller ».
4. Avec Supabase CLI : copier le fichier dans `supabase/migrations/` (déjà fait) et utiliser `supabase db push --linked` sur le staging. Le CLI n'a pas de commande « down » : le retour arrière se joue avec le fichier du dossier `rollback/`.

Un test automatique équivalent tourne en local : `npm run test:sql` (PostgreSQL en mémoire). Il **ne remplace pas** l'essai du staging.

**Production** : seulement après validation complète du staging, et dans cet ordre : sauvegarde (étape 1) → migration → comptes (étape 5) → déploiement. Rien de tout cela n'est demandé maintenant.

## 4 bis. SQL « choix de la commande » (production, quand vous voulez l'utiliser)

Fichier : `supabase/migrations/20261013180000_payment_link_order_target.sql` (retour : `supabase/rollback/20261013180000_payment_link_order_target.down.sql`). Il ajoute deux colonnes **optionnelles** à `payment_links` ; aucun lien existant n'est modifié. Tant qu'il n'est pas exécuté, le formulaire fonctionne avec « Automatique » et refuse proprement un autre choix en expliquant pourquoi. À coller dans le *SQL Editor* (faites une sauvegarde avant, voir étape 1).

## 5. Comptes individuels (un par personne, plus de compte partagé)

Sur le **staging** d'abord. Pour chaque personne (Mayuko, Samuel, éventuel staff) :

1. Supabase → *Authentication* → *Users* → *Add user* (email + mot de passe fort, ou invitation).
2. *SQL Editor* — remplacer `EMAIL`, `NOM` et le rôle (`admin` ou `staff`) :
   ```sql
   begin;
   update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    where email = 'EMAIL';

   insert into public.admin_users (user_id, email, display_name, role)
   select id, email, 'NOM', 'admin' from auth.users where email = 'EMAIL'
   on conflict (user_id) do update
      set role = excluded.role, display_name = excluded.display_name, is_active = true;
   commit;
   ```
   Le rôle doit être le **même** dans les deux endroits, sinon l'accès est refusé (« role_mismatch »).
3. La personne se connecte sur `/admin-v2/connexion`, scanne le QR code et valide un premier code : le MFA est alors enrôlé.
4. Pour **couper un accès immédiatement** : `update public.admin_users set is_active = false where email = 'EMAIL';` (le dernier administrateur actif ne peut pas être désactivé).

Le rôle est lu dans `app_metadata` uniquement. Ne jamais utiliser `user_metadata` (modifiable par l'utilisateur).

## 6. Activer le MFA (TOTP) côté Supabase

*Authentication* → *Sign In / Providers* (ou *Multi-Factor*) → vérifier que **TOTP** est activé (inscription *et* vérification). C'est le réglage par défaut des projets récents.

Les inscriptions publiques doivent **rester ouvertes** : les clients du site créent des comptes. C'est le rôle dans `app_metadata` (qu'un client ne peut pas se donner) qui protège l'administration.

## 7. Essai en local (sans rien déployer)

```bash
npm run dev
```
Puis `http://localhost:3000/admin-v2`. Avec le `.env.local` du **staging**, tout fonctionne (connexion → MFA → pages).

Avec le `.env.local` de la **production** (lecture seule), la migration n'étant pas appliquée, la liste des comptes `admin_users` n'existe pas : l'accès n'est toléré **qu'en développement local**, avec un bandeau jaune, et uniquement si le compte a `app_metadata.role` = `admin` ou `staff`. Le compte partagé actuel est dans ce cas. La première connexion vous demandera d'enrôler un second facteur : cela ajoute un facteur d'authentification à ce compte en production (réversible dans *Authentication → Users*). Pour l'éviter, travaillez sur le staging.

## 8. Ce que je n'ai volontairement pas fait

- Aucune écriture dans la base de production (seules des lectures : schéma, comptages, contrôle des chiffres).
- Aucune modification des flux PayPal ni de `app/api/*`.
- Aucun `git push`, aucun déploiement.
- Pas de clé service dans l'admin-v2 : elle n'y est jamais utilisée.
