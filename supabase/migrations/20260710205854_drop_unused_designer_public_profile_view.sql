-- Vue SECURITY DEFINER flaguée par le linter Supabase (ERROR), vérifiée
-- non utilisée nulle part dans le code applicatif (grep exhaustif sur
-- src/) et absente du PRD. Supprimée avec confirmation explicite de
-- l'utilisateur plutôt que corrigée : élimine le risque et le lint à la
-- source, aucune régression possible puisque rien n'en dépend.
drop view if exists public.designer_public_profile;
