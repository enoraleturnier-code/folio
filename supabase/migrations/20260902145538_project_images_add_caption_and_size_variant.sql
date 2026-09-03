alter table public.project_images
  add column caption text;

-- Nouveau systeme de taille (grille col-span/row-span + grid-auto-flow:
-- dense, remplace le masonry columns-* + width_variant full/half/third).
-- Migration des donnees existantes AVANT de changer la contrainte : renomme
-- la colonne (pas juste ses valeurs) pour que son nom refleche qu'elle porte
-- desormais largeur ET hauteur, pas seulement une largeur.
alter table public.project_images
  rename column width_variant to size_variant;

alter table public.project_images
  drop constraint project_images_width_variant_check;

update public.project_images set size_variant = 'full' where size_variant = 'full';
update public.project_images set size_variant = 'wide' where size_variant = 'half';
update public.project_images set size_variant = 'small' where size_variant = 'third';

alter table public.project_images
  add constraint project_images_size_variant_check
  check (size_variant in ('small', 'wide', 'tall', 'large', 'full'));

alter table public.project_images
  alter column size_variant set default 'small';

comment on column public.project_images.size_variant is
  'Taille dans la grille CSS de ProjectDetailPage (col-span/row-span, grid-auto-flow: dense) : small=1x1, wide=2x1, tall=1x2, large=2x2, full=pleine largeur (col-span-full) x1.';
comment on column public.project_images.caption is
  'Legende affichee en overlay bas-gauche sur ProjectDetailPage (toujours visible si non vide, pas de hover). Pre-remplie a l''upload depuis le nom de fichier (ProjectDrawer.tsx), editable par l''admin.';
