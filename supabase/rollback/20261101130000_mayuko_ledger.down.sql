-- Retour arrière de 20261101130000_mayuko_ledger.sql.
-- Supprime la table mayuko_ledger : les remboursements et avances enregistrés sont perdus
-- (les commandes ne sont pas touchées ; le journal d'audit garde la trace des mouvements passés).

drop trigger if exists audit_mayuko_ledger on public.mayuko_ledger;
drop table if exists public.mayuko_ledger;
