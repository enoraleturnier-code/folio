alter table public.design_watch_entries add column contenu text;

comment on column public.design_watch_entries.contenu is 'Corps de la page Notion converti en Markdown (titres/listes/gras) par sync-notion-veille -- affiche inline (Dashboard) a la place d''un simple lien "Voir sur Notion" pour les entrees publiees.';
