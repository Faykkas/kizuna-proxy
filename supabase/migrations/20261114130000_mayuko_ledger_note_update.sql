-- Registre Mayuko : permet de modifier la NOTE d'un mouvement (pour classer une avance en
-- « Livraison », « Taxes Zonos » ou « Autre » après coup). Seule la colonne note peut changer :
-- le montant, la date et le type restent impossibles à modifier (il faut supprimer et recréer).
-- Réservé aux administrateurs avec second facteur. Chaque changement va dans le journal d'audit (trigger existant).
-- Aucune donnée existante n'est modifiée. Idempotent.
-- Retour arrière : supabase/rollback/20261114130000_mayuko_ledger_note_update.down.sql

grant update (note) on public.mayuko_ledger to authenticated;

drop policy if exists mayuko_ledger_update on public.mayuko_ledger;
create policy mayuko_ledger_update on public.mayuko_ledger
  for update to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());
