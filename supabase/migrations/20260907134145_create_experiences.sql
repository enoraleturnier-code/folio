create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  designer_profile_id uuid not null references public.designer_profiles(id),
  title text not null,
  company text not null,
  context text,
  bullets text[],
  impact text,
  project_url text,
  start_date date not null,
  end_date date,
  display_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_experiences_designer_profile_id on public.experiences(designer_profile_id);
create index idx_experiences_deleted_at on public.experiences(deleted_at);

-- Pas de trigger auto-update sur `updated_at` : verifie a l'ecriture de cette
-- migration qu'aucune fonction generique de ce type n'existe cote public
-- (seul storage.update_updated_at_column() existe, interne au schema
-- storage) -- meme absence de trigger que projects/designer_profiles, qui ne
-- maintiennent pas non plus updated_at automatiquement aujourd'hui.
