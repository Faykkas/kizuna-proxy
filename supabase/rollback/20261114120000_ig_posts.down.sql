-- Retour arrière de 20261114120000_ig_posts.sql.
-- Supprime la table ig_posts : les posts Instagram enregistrés sont perdus (rien d'autre n'est touché).
drop trigger if exists audit_ig_posts on public.ig_posts;
drop trigger if exists ig_posts_touch on public.ig_posts;
drop table if exists public.ig_posts;
