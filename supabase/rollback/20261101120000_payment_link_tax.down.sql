-- Retour arrière de 20261101120000_payment_link_tax.sql.
-- Supprime la colonne tax_amount_jpy : les montants de taxe enregistrés sur les liens sont perdus
-- (les totaux amount_jpy des liens ne changent pas).

alter table public.payment_links
  drop column if exists tax_amount_jpy;
