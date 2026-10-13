# Admin-v2 — architecture et conception

État : **phase 0 livrée en local** (branche `admin-v2`, non poussée, non déployée). Ce document décrit ce qui existe et
**propose** la phase 1. Rien de la phase 1 n'est construit.

## 1. Principes

1. L'ancienne admin (`/admin`) reste intacte et en service. L'admin-v2 vit sous `/admin-v2`, en parallèle.
2. Aucune écriture sur les données existantes depuis l'admin-v2 (phase 0 = lecture seule).
3. Les flux PayPal existants (`app/api/paypal`, `app/api/payment-link`) ne sont pas modifiés.
4. La clé service Supabase n'est jamais utilisée par l'admin-v2 ; la clé publique seule transporte le jeton de la personne
   connectée, donc la RLS s'applique à chaque lecture.
5. Aucune donnée métier inventée : une zone sans données réelles affiche « non disponible », jamais un zéro.

## 2. Ce que contient la phase 0

| Élément | Fichier(s) |
|---|---|
| Interface (menu latéral, tableau de bord, commandes, détail, clients, comptabilité, paramètres, thème sombre) | `app/admin-v2/**` |
| Connexion, MFA (enrôlement + vérification), page de refus | `app/admin-v2/(auth)/**` |
| Contrôle d'accès serveur | `app/admin-v2/lib/access.ts` (`requireAccess()` en tête de chaque page) |
| Proxy (rafraîchit la session, redirige les anonymes) — limité à `/admin-v2` | `proxy.ts` |
| Lecture seule des données | `app/admin-v2/lib/queries.ts` (uniquement `.select()`) |
| Calcul provisoire des commissions (entiers, testé) | `app/admin-v2/lib/commissions.ts` + `.test.ts` |
| Migration + retour arrière + test | `supabase/migrations`, `supabase/rollback`, `supabase/tests` |
| Schéma existant documenté | `docs/admin-v2/SCHEMA_EXISTANT.md` |

### Contrôle d'accès (à chaque requête, côté serveur)

1. Session valide (jeton vérifié par `getClaims()`).
2. `app_metadata.role` ∈ {`admin`, `staff`} — jamais `user_metadata`.
3. Second facteur validé (`aal2`) — **obligatoire en production**.
4. Ligne active dans `admin_users`, rôle identique à celui du jeton (permet de couper un accès tout de suite).
5. Rôle `staff` : voit le menu mais pas les données — les politiques RLS actuelles des tables existantes sont réservées à
   `admin`. L'ouverture « staff » est prévue table par table en phase 3, après export des politiques actuelles.

Modes dégradés, **développement local uniquement** (ignorés en production) : table `admin_users` absente, ou MFA désactivé avec
`ADMIN_V2_REQUIRE_MFA=false`. Dans les deux cas un bandeau jaune est affiché.

### Journal d'audit

`audit_log` est en ajout seul (aucun UPDATE/DELETE/TRUNCATE possible, même avec la clé service). Il est alimenté par des
déclencheurs sur les nouvelles tables. Le brancher sur les tables existantes (`orders`, `payment_links`…) est volontairement
reporté : ce serait modifier la production.

## 3. Observations sur les données existantes

À connaître avant de bâtir le registre :

- **Commissions d'octobre : 239 648 ¥** (frais de service 215 365 ¥ + marge PayPal 24 283 ¥, 24 commandes) — cohérent avec
  les 240 000 ¥ annoncés. La formule est celle de l'ancien onglet Stats.
- **Deux commandes datées du futur comptent déjà** : `KZN-2026-0176` (9 nov.) et `KZN-2026-0193` (8 nov.), statut
  « Awaiting Event », 5 000 ¥ chacune. Elles apparaissent en novembre (10 000 ¥) alors que rien n'est encaissé pour ce mois.
  C'est exactement la différence « prévue / encaissée » que le registre doit porter.
- **Mois en UTC pour la marge PayPal, en dates calendaires pour les commandes.** Un paiement du 30 septembre à 20 h UTC est le
  1er octobre à Tokyo. Le registre devra fixer **Asia/Tokyo** comme référence.
- **Les tables `payments` et `shipments` sont vides** : les frais de livraison vivent sur `orders`, les paiements sur
  `payment_links`. Il n'existe aucun journal de paiements.
- **`orders.items` est du texte libre** ; le détail des articles n'existe que dans `payment_links.items_breakdown` (JSON).
- **Un paiement = au plus une commande**, par fusion automatique dans la commande ouverte du mois (règle du 13 oct.).
  Les historiques fusionnés ne se distinguent que dans `admin_notes`.
- Les tables `business_charges` (8 lignes) et `translation_cache` existaient sans être listées dans nos audits précédents ; elles
  sont bien fermées aux visiteurs anonymes (vérifié).

## 4. Proposition pour la phase 1 — registre financier (non construit)

### Objectifs couverts
Distinguer commissions / avances clients / frais / dépenses / remboursements ; plusieurs paiements par commande ; un paiement
réparti entre plusieurs commandes ; commissions prévue / facturée / encaissée / remboursée ; entités fiscales sans transfert
automatique de l'historique ; export CSV.

### Tables proposées (ajouts uniquement)

- `ledger_entries` — **une ligne par mouvement, jamais modifiée** (une correction = une écriture inverse qui référence l'originale)
  - `id`, `entity_id` → `business_entities`, `account_id` (PayPal Mayuko, banque…), `occurred_at` (timestamptz, affichage JST)
  - `kind` : `client_advance`, `commission`, `shipping`, `refund`, `expense`, `transfer`, `payment_fee`
  - `direction` : `in` / `out`
  - `amount_minor` (bigint, unités mineures) + `currency` (ISO 4217) — le yen n'a pas de décimales
  - `fx_rate` (numeric, nullable), `amount_jpy` (bigint) — montant d'origine **et** converti conservés
  - `external_ref` (capture PayPal, etc.) avec **contrainte d'unicité (`source`, `external_ref`, `kind`)** → idempotence
  - `reverses_entry_id`, `created_by`, `created_at`, `notes`
- `payment_allocations` — répartit une écriture d'encaissement entre commandes : (`entry_id`, `order_id`, `amount_jpy`, `purpose`).
  Invariant : la somme des répartitions d'un paiement = son montant (vérifié en base).
- `commission_lines` — cycle de vie par commande : `planned` → `invoiced` → `collected` → `refunded`, avec `amount_jpy` et les
  références vers l'écriture qui a fait avancer chaque étape.
- `expenses` (+ `documents` liés, bucket Storage privé, URL signées).
- `fiscal_periods` (clôture) : une période close n'accepte plus d'écriture.

### Garanties techniques

- **Calculs côté serveur**, en entiers (`bigint`), jamais en flottants ; taux de change en `numeric`.
- **Écritures transactionnelles** : chaque opération (ex. « enregistrer un paiement et le répartir ») est **une fonction SQL**
  (`security definer`, appelée par RPC) qui fait tout dans une seule transaction ou rien.
- **Idempotentes** : rejouer le même webhook/saisie ne crée pas de doublon (clé d'unicité ci-dessus).
- **Entités** : chaque écriture est rattachée à l'entité qui a perçu l'argent ; la date de bascule vit dans
  `business_entities` ; **changer d'entité ne recopie ni ne déplace aucune écriture.** Le PayPal de Mayuko continuera de
  percevoir l'argent après la bascule : un compte `account_id` + des écritures `transfer` documentent le reversement.
- **Reprise de l'historique** : script en lecture seule qui produit un rapport (ce qui serait créé, ce qui est ambigu, marqué
  « à vérifier ») ; rien n'est écrit en production avant validation ligne par ligne du rapport.

### Questions à trancher avec un comptable japonais (avant de coder la phase 1)

1. Le prix d'achat des articles est-il du chiffre d'affaires ou une avance (affecte la taxe de consommation et le seuil des 10 M¥) ?
2. Comment documenter l'argent perçu sur le PayPal de Mayuko pour l'activité de Samuel après la bascule ?
3. Date de bascule et traitement de l'année de transition.
4. Valeur comptable des remboursements partiels et des frais PayPal (déduits au moment du paiement ou du virement ?).

## 5. Périmètre des modules (décidé le 13 oct. 2026)

- **Repris dans la v2** : tableau de bord, commandes (création, modification, photos, demande de paiement de livraison), clients, liens de paiement (création, copie, annulation), boutique, galerie, actualités, bandeau d'annonce, paramètres, **comptabilité**.
- **Volontairement différent de la v1** : pas de suppression de commande (on l'annule, l'historique reste) ; une modification de commande n'écrit que les champs changés et refuse d'écraser un champ modifié entre-temps (un paiement peut se fusionner pendant l'édition) ; modifier une actualité ne change plus sa date de publication.
- **Abandonné** : « Demandes » (reçues par email).
- **Pas encore repris** : colis groupés (table `shipments`, vide), calculateur de charges japonaises de l'ancien onglet « Charges » (Kokuho, impôts… : à remplacer par quelque chose de plus pro), conversion EUR des statistiques, recherche rapide de l'en-tête, onglets masqués de la v1 (Événements, liste d'attente).

### Comptabilité (étape 1, sans migration)

Calculée à partir des données existantes, en entiers, mois à l'heure de Tokyo : journal des encaissements PayPal (un lien payé = une ligne : total payé, articles/avance client, commission, livraison, frais PayPal facturés et réels, marge, net), synthèse mensuelle (gains = formule du tableau de bord, dépenses lissées, résultat provisoire), dépenses (table `business_expenses`), export CSV pour le comptable (`/admin-v2/comptabilite/export`, protection contre l'injection de formules Excel). Ne contient pas : ventes d'avant septembre 2026 et paiements directs PayPal sans lien, remboursements, transferts, justificatifs (étape 2 : registre complet et saisie manuelle). La colonne « Entité » reste vide tant qu'aucune date de bascule n'est confirmée.

### Livraison : constat et correction

Au 13 oct., **aucun des 180 liens payés** n'avait été créé en mode « livraison » et **aucune commande** n'a de `shipping_cost_jpy`. Les paiements « Shipping… » ont été saisis comme des articles et se sont fusionnés dans `item_price_jpy`. Conséquences : prix de livraison introuvable par commande, et prix « articles » surévalué.

- **Pour l'avenir** : le formulaire de création impose le type (Articles / Livraison) et bloque un libellé « shipping » saisi comme articles.
- **Pour le passé** : la fiche commande retrouve les paiements de livraison d'après leur libellé, rattachés à la commande par email et date (estimation, signalée comme telle). Aucune donnée n'a été corrigée.
- **Reste à décider** : un rattrapage de l'historique (déplacer ces montants de `item_price_jpy` vers `shipping_cost_jpy`) après validation ligne par ligne.

### « Commission package » (gains hebdomadaires sur les colis)

Chaque semaine, Kizuna encaisse un peu plus que le coût réel des colis. Ces gains sont enregistrés comme des lignes de commande (client « COMISSION PACKING 12/1 », « Comission PACKAGE WEEK »…, sans email, articles à 0 ¥) : **11 lignes, 46 005 ¥**, de juillet à octobre. Elles sont **conservées** et **comptées dans les commissions**, mais ne sont plus comptées comme des commandes ni comme des clients (`app/lib/commissionPackage.ts`). Dans l'admin-v2 : nombre de commandes, commandes actives, moyennes et liste des clients les excluent ; le tableau de bord affiche leur part (« dont commissions colis ») ; la page Commandes a un filtre (commandes / commissions colis / tout). L'**ancienne admin** compte encore ces lignes comme des commandes dans Stats et Clients tant qu'elle n'est pas corrigée.

### Choisir la commande qui reçoit un paiement

À la création d'un lien (v2), on peut choisir : **Automatique** (règle actuelle : commande ouverte du mois, sinon nouvelle), **Nouvelle commande**, ou **une commande précise** du client (même d'un autre mois, même déjà livrée). Utile pour un client qui achète tous les jours : le numéro de commande ne change plus au changement de mois.

- Stockage : deux colonnes optionnelles sur `payment_links` (`target_order_id`, `new_order`) — SQL `20261013180000_payment_link_order_target.sql`, à exécuter dans Supabase **avant** de choisir autre chose qu'« Automatique ».
- Application : `app/api/payment-link/route.ts` (étape de capture, seulement la sélection de la commande) via `app/lib/paymentOrderTarget.ts`. Les appels PayPal ne sont pas modifiés. Les liens existants gardent la règle automatique ; si la commande choisie a disparu, repli automatique (le paiement n'est jamais perdu).
- Attention comptable : la commission d'un paiement ajouté à une commande d'un autre mois est comptée dans le **mois de cette commande** (`purchase_date`) ; le formulaire le signale. La marge PayPal suit la date de paiement.

## 6. Feuille de route (inchangée)

0. Fondations + squelette ✅ (local)
1. Registre financier, dépenses, justificatifs, export CSV, reprise d'historique
2. Tableau de bord alimenté par le registre
3. Commandes (articles multiples, paiements partiels, remboursements, notes), clients, accès staff
4. Expéditions, factures et documents
5. Branchement des flux live (paiement par lien → registre), PayPal en lecture pour rapprochement — **après validation**
