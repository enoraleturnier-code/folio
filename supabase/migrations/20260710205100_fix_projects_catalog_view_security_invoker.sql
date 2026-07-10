-- projects_catalog_view avait perdu security_invoker=true (présent à la
-- création dans audit_corrections_v2_0, mais silencieusement réinitialisé
-- par les CREATE OR REPLACE VIEW suivants qui ne le repassaient pas).
-- Conséquence réelle vérifiée : la vue, en mode SECURITY DEFINER implicite,
-- bypassait la RLS de `projects` et exposait les projets status='draft'
-- à n'importe quel visiteur anonyme via l'API.
alter view public.projects_catalog_view set (security_invoker = true);
