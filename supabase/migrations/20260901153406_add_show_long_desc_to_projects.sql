alter table public.projects
  add column show_long_desc boolean not null default false;

comment on column public.projects.show_long_desc is
  'Si true, long_desc est affiche sur la fiche projet publique (ProjectDetailPage) -- sinon long_desc ne sert que de brouillon de travail (base pour la structuration IA) et reste invisible cote visiteur. Memes regles de visibilite/masquage que long_desc (aucune policy RLS dediee).';
