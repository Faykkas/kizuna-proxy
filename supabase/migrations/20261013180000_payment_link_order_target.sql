-- Choisir la commande qui reçoit un paiement, au moment de créer le lien.
--
-- Ajoute deux colonnes OPTIONNELLES à payment_links (aucune donnée existante n'est modifiée,
-- les liens actuels gardent le comportement automatique) :
--   target_order_id : commande précise à laquelle ajouter le paiement (même d'un autre mois)
--   new_order       : forcer la création d'une nouvelle commande
-- Idempotent. Retour arrière : supabase/rollback/20261013180000_payment_link_order_target.down.sql

alter table public.payment_links
  add column if not exists target_order_id bigint references public.orders (id) on delete set null;

alter table public.payment_links
  add column if not exists new_order boolean not null default false;

comment on column public.payment_links.target_order_id is
  'Commande choisie à la création du lien : le paiement y est ajouté (sinon règle automatique).';
comment on column public.payment_links.new_order is
  'true = le paiement crée toujours une nouvelle commande.';
