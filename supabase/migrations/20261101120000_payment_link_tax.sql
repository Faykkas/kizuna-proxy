-- Taxes Zonos dans un lien de paiement « livraison ».
--
-- Ajoute UNE colonne optionnelle à payment_links (aucune donnée existante n'est modifiée) :
--   tax_amount_jpy : taxes / droits de douane (Zonos) facturés au client en plus de la livraison, en yens entiers.
-- Les liens actuels gardent 0. Le total du lien (amount_jpy) inclut déjà cette taxe.
-- Idempotent. Retour arrière : supabase/rollback/20261101120000_payment_link_tax.down.sql

alter table public.payment_links
  add column if not exists tax_amount_jpy integer not null default 0 check (tax_amount_jpy >= 0);

comment on column public.payment_links.tax_amount_jpy is
  'Taxes / droits de douane (Zonos) facturés au client avec la livraison, en yens. 0 = aucune.';
