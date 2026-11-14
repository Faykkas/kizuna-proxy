-- Posts Instagram (admin-v2 → rubrique « Instagram ») et page publique /ig (lien de la bio Instagram).
--
-- Chaque post parle d'un événement ou d'une sortie au Japon SANS photo de produit : un visuel Kizuna est généré à partir
-- du texte (/api/ig-card), et le lien officiel (page ou post de l'organisateur) est toujours fourni.
--   draft     : brouillon (créé à la main ou par la recherche automatique hebdomadaire) — invisible au public
--   approved  : validé par Samuel — visible sur /ig
--   published : posté sur Instagram — visible sur /ig
--   archived  : retiré
-- La recherche automatique écrit avec la clé service (contourne la RLS) et ne crée que des brouillons.
-- Idempotent. Retour arrière : supabase/rollback/20261114120000_ig_posts.down.sql

create table if not exists public.ig_posts (
  id            uuid primary key default gen_random_uuid(),
  status        text not null default 'draft' check (status in ('draft', 'approved', 'published', 'archived')),
  kind          text not null default 'event' check (kind in ('event', 'popup', 'release', 'collab', 'lottery', 'other')),
  title         text not null check (char_length(title) between 3 and 90),
  subtitle      text check (subtitle is null or char_length(subtitle) <= 120),
  dates         text check (dates is null or char_length(dates) <= 80),
  place         text check (place is null or char_length(place) <= 100),
  highlights    text[] not null default '{}' check (cardinality(highlights) <= 5),
  official_url  text not null check (official_url ~ '^https://' and char_length(official_url) <= 500),
  source_name   text check (source_name is null or char_length(source_name) <= 80),
  caption       text check (caption is null or char_length(caption) <= 2200),
  created_by    text not null default 'admin' check (created_by in ('admin', 'auto')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz
);

-- Un même lien officiel ne donne qu'un post (la recherche automatique ne crée pas de doublons).
create unique index if not exists ig_posts_official_url_key on public.ig_posts (official_url);
create index if not exists ig_posts_status_idx on public.ig_posts (status, created_at desc);

alter table public.ig_posts enable row level security;
revoke all on public.ig_posts from anon, authenticated;
grant select on public.ig_posts to anon, authenticated;
grant insert, update, delete on public.ig_posts to authenticated;

-- Public : seulement les posts validés ou publiés (page /ig).
drop policy if exists ig_posts_public_read on public.ig_posts;
create policy ig_posts_public_read on public.ig_posts
  for select to anon, authenticated
  using (status in ('approved', 'published'));

-- Administrateurs avec second facteur : tout.
drop policy if exists ig_posts_admin_all on public.ig_posts;
create policy ig_posts_admin_all on public.ig_posts
  for all to authenticated
  using (public.kz_is_admin() and public.kz_is_mfa_verified())
  with check (public.kz_is_admin() and public.kz_is_mfa_verified());

drop trigger if exists ig_posts_touch on public.ig_posts;
create trigger ig_posts_touch
  before update on public.ig_posts
  for each row execute function public.kz_touch_updated_at();

drop trigger if exists audit_ig_posts on public.ig_posts;
create trigger audit_ig_posts
  after insert or update or delete on public.ig_posts
  for each row execute function public.kz_audit_row_change();

comment on table public.ig_posts is 'Posts Instagram : événements et sorties au Japon (visuel généré, lien officiel). Brouillons → validés (visibles sur /ig) → publiés.';
