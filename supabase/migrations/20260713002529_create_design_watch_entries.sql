create table public.design_watch_entries (
  id uuid primary key default gen_random_uuid(),
  notion_page_id text not null unique,
  titre text not null,
  statut text not null,
  tags text[] not null default '{}',
  nb_sources integer,
  periode_debut date,
  periode_fin date,
  notion_url text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.design_watch_entries is 'Miroir de la base Notion "Veille Design Hebdo" (BC02 C3/C5/C6) -- alimentee exclusivement par l''Edge Function sync-notion-veille (service_role), jamais ecrite directement par un client.';
comment on column public.design_watch_entries.notion_page_id is 'Cle d''upsert idempotent -- correspond a l''id de page Notion.';
comment on column public.design_watch_entries.statut is 'Miroir direct du select Notion (Brouillon/Publie) -- text plutot qu''enum Postgres : les options sont gerees cote Notion, pas cote schema, un enum casserait le sync si une option est ajoutee/renommee cote Notion.';
comment on column public.design_watch_entries.tags is 'Miroir du multi_select Notion (UX/UI/Trends/Tools) -- array simple, pas de table de reference : cardinalite fermee et faible cote Notion (4 valeurs actuelles), contrairement a tools_ref/keywords_ref qui sont ouverts et extensibles par l''admin.';
comment on column public.design_watch_entries.nb_sources is 'Notion "Nombre de sources" -- pas de colonne "source" unique : chaque entree agrege plusieurs flux RSS/sources en une synthese hebdomadaire.';
comment on column public.design_watch_entries.periode_debut is 'Notion "Periode" (date range), borne de debut -- remplace un date_publication unique : la Veille est hebdomadaire, une entree = une semaine (periode_debut/periode_fin), pas une publication ponctuelle.';
comment on column public.design_watch_entries.periode_fin is 'Notion "Periode" (date range), borne de fin.';
comment on column public.design_watch_entries.notion_url is 'Lien vers la page Notion complete -- la synthese (Top 3, themes, sources traitees) reste riche et volumineuse cote Notion, non dupliquee ici.';

alter table public.design_watch_entries enable row level security;

create policy design_watch_entries_select_admin on public.design_watch_entries
  for select
  using (public.get_my_role() = 'admin');
