-- F-11 (auto-approbation par sensitivity_level) retirée côté produit :
-- toute nouvelle demande d'accès reste désormais status='pending' quel
-- que soit le niveau de sensibilité du projet et l'historique du visiteur.
-- Revert de la policy élargie par 20260710180223 (qui autorisait un
-- insert direct en status='approved' sous conditions F-11) : sans ce
-- revert, un appel direct à l'API (hors UI) pourrait encore auto-valider
-- même après le retrait du code client.
alter policy "access_requests_insert_pending"
on public.access_requests
with check (
  (user_id = (select auth.uid()))
  and (get_my_role() = 'pending'::text)
  and (status = 'pending'::access_request_status)
);

-- Ces deux fonctions security definer ne servaient qu'au check F-11
-- ci-dessus (aucune autre référence dans le code ou les migrations).
drop function if exists public.has_other_approved_access_request(uuid);
drop function if exists public.project_is_sensible(uuid);
