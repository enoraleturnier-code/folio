create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  storage_path text not null,
  display_order integer not null default 0,
  width_variant text not null default 'full' check (width_variant in ('full', 'half', 'third')),
  created_at timestamptz not null default now()
);

create index idx_project_images_project_id on public.project_images(project_id);
