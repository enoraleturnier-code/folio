-- Chantier "Section Expériences" (accordéon 3 colonnes) -- fait évoluer le
-- schéma `experiences` posé lors du chantier précédent ("Bloc Parcours") :
-- `project_url` retiré (remplacé par `project_id`, FK vers `projects`),
-- `short_desc` (une ligne, ~90 caractères) ajoutée. `bullets` CONSERVÉE
-- (affichée dans le contenu déplié, juste avant le bloc Impact -- gardée
-- par erreur de rédaction du premier jet de ce chantier, confirmé avec
-- l'utilisatrice). `context`/`impact`/`start_date`/`end_date`/
-- `display_order`/`deleted_at` inchangés. RLS déjà en place
-- (`experiences_select`/`experiences_admin`, migration 20260907134157) --
-- aucune policy à modifier ici.

alter table public.designer_profiles add column experiences_intro text;

-- short_desc ajoutée nullable, backfillée pour les 7 lignes seedées
-- (identifiées par display_order, stable depuis le seed initial), puis
-- verrouillée NOT NULL -- ne jamais poser NOT NULL directement sur une
-- colonne ajoutée à une table qui a déjà des lignes.
alter table public.experiences add column short_desc text;

update public.experiences set short_desc = 'Portfolio à accès contrôlé conçu, développé et déployé seule en 6 semaines.' where display_order = 0;
update public.experiences set short_desc = 'Refonte du Design System et standardisation UI sur 5 équipes produit.' where display_order = 1;
update public.experiences set short_desc = 'Audit UX et refonte des dashboards d''un logiciel de pilotage de la performance.' where display_order = 2;
update public.experiences set short_desc = 'Plateforme d''apprentissage du code de la route accessible aux personnes handicapées.' where display_order = 3;
update public.experiences set short_desc = 'Industrialisation d''un Design System transverse multi-produits.' where display_order = 4;
update public.experiences set short_desc = 'Espace gestionnaire multi-services à fortes contraintes réglementaires.' where display_order = 5;
update public.experiences set short_desc = 'Missions diverses, du graphisme freelance aux applications métier réglementées.' where display_order = 6;

alter table public.experiences alter column short_desc set not null;

alter table public.experiences drop column project_url;

alter table public.experiences add column project_id uuid references public.projects(id);
create index idx_experiences_project_id on public.experiences(project_id);
