-- Retour arrière de 20261013180000_payment_link_order_target.sql
--
-- Supprime les deux colonnes ajoutées. Les liens déjà payés ne sont pas affectés (la commande est
-- déjà mise à jour) ; les liens EN ATTENTE perdent leur choix de commande et reviennent à la règle
-- automatique. Idempotent.

alter table public.payment_links drop column if exists new_order;
alter table public.payment_links drop column if exists target_order_id;
