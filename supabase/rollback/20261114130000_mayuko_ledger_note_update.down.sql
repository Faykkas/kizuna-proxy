-- Retour arrière de 20261114130000_mayuko_ledger_note_update.sql : on ne peut plus modifier les notes.
-- Les notes déjà modifiées restent telles quelles.

drop policy if exists mayuko_ledger_update on public.mayuko_ledger;
revoke update on public.mayuko_ledger from authenticated;
