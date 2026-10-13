-- Retour arrière de 20261013120000_admin_foundation.sql
--
-- Supprime UNIQUEMENT ce que la migration a créé. Les tables existantes de
-- Kizuna (orders, payment_links, …) ne sont jamais touchées.
-- ATTENTION : supprime aussi le contenu de admin_users, business_entities et
-- audit_log. Exporter ces tables avant si elles contiennent des données utiles.
-- Idempotent.

drop trigger if exists audit_business_entities on public.business_entities;
drop trigger if exists audit_admin_users on public.admin_users;

-- Le journal est en ajout seul : on retire d'abord ses verrous.
drop trigger if exists audit_log_no_truncate on public.audit_log;
drop trigger if exists audit_log_no_update on public.audit_log;
drop table if exists public.audit_log;

drop table if exists public.business_entities;
drop table if exists public.admin_users;

drop function if exists public.kz_audit_row_change();
drop function if exists public.kz_audit_log_immutable();
drop function if exists public.kz_admin_users_keep_one_admin();
drop function if exists public.kz_touch_updated_at();
drop function if exists public.kz_is_mfa_verified();
drop function if exists public.kz_is_staff_or_admin();
drop function if exists public.kz_is_admin();
drop function if exists public.kz_admin_role();
