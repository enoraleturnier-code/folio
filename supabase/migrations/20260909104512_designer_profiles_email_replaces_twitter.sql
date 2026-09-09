-- Remplace le champ "X (Twitter)" (mort : bouton public retiré le 09/09,
-- remplacé par un bouton "copier l'e-mail" utilisant jusqu'ici l'email
-- statique du mock) par un champ email réellement éditable en admin.
alter table public.designer_profiles add column email text;
update public.designer_profiles set email = 'enoraleturnier@gmail.com';
alter table public.designer_profiles drop column twitter_url;
