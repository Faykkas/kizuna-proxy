# Demandes du site : fonctionnement et notification Discord

## Comment une demande est traitée

Les trois formulaires (demande complète, mini-formulaire, formulaire business) envoient leur contenu à **`/api/requests`**.
Le serveur fait, dans cet ordre :

1. **Contrôle** : email valide, texte présent, longueurs bornées, date valide, champ piège anti-robots, taille maximale.
2. **Limites** : au plus 5 demandes par email et par heure ; une même demande envoyée deux fois de suite n'est gardée qu'une fois.
3. **Enregistrement** dans la table `requests` (statut `new`). C'est la source de vérité.
4. **Notification**, par deux canaux indépendants : **Discord** et **email**. Si l'un échoue, l'autre part quand même, et la demande reste enregistrée.

Si le serveur est injoignable, le navigateur bascule sur l'envoi par email (Formspree), comme avant.

Toutes les demandes sont visibles et traitables dans **l'admin v2 → Demandes** (statuts : Nouvelle, Vue, Convertie, Refusée ;
mêmes valeurs que l'ancienne admin). Le tableau de bord affiche le nombre de demandes « à traiter ».

## Activer la notification Discord (une seule fois)

1. Dans Discord, crée (ou choisis) un salon privé, par exemple `#demandes-kizuna`.
2. Paramètres du salon → **Intégrations** → **Webhooks** → **Nouveau webhook**. Nomme-le « Kizuna — demandes ».
3. Clique sur **Copier l'URL du webhook**. Cette URL est un secret : quiconque la possède peut écrire dans le salon. Ne la partage pas.
4. Vercel → projet `kizuna-proxy` → **Settings → Environment Variables** → ajoute :
   - Nom : `DISCORD_WEBHOOK_URL`
   - Valeur : l'URL copiée
   - Environnements : Production (et Preview si tu veux)
5. **Redéploie** (Deployments → les trois points du dernier déploiement → Redeploy) : une variable n'est lue qu'au prochain déploiement.
6. Envoie-toi une demande de test depuis le site : un message doit apparaître dans le salon.

Sans `DISCORD_WEBHOOK_URL`, le canal Discord est simplement ignoré (l'email et l'admin fonctionnent normalement).

## Autres variables utilisées

| Variable | Rôle |
|---|---|
| `SUPABASE_SECRET_KEY` | Enregistrement des demandes côté serveur (déjà utilisée par les paiements). |
| `RESEND_API_KEY` | Email de notification. |
| `NOTIFY_EMAIL` | Destinataire de l'email (par défaut `kizunaproxy@gmail.com`). |

## À faire plus tard (non fait)

- Confirmation automatique au client : demande de vérifier le domaine chez Resend (enregistrements DNS dans Namecheap) pour envoyer depuis une adresse du domaine sans passer en spam.
- Retirer la politique « insertion anonyme » de la table `requests` une fois ce circuit stable depuis quelques semaines : plus personne n'a besoin d'écrire directement dans la base depuis le navigateur.
