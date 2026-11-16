-- Retour arrière de 20261117120000_expense_purchases.sql.
-- Supprime la table expense_purchases : les achats ponctuels enregistrés sont perdus (le journal d'audit en garde la trace).
drop trigger if exists audit_expense_purchases on public.expense_purchases;
drop table if exists public.expense_purchases;
