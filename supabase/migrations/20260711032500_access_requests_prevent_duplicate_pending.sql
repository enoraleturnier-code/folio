-- Empeche un meme visiteur d'avoir plusieurs demandes 'pending' simultanees
-- sur le meme projet. Index partiel : n'affecte que les lignes status='pending',
-- une nouvelle demande reste possible apres approbation/refus de la precedente.
create unique index access_requests_one_pending_per_user_project
on public.access_requests (user_id, project_id)
where status = 'pending';
