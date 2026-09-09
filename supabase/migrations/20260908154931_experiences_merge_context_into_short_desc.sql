-- Fusionne l'ancien couple short_desc/context (accordéon, en-tête) en un
-- seul champ short_desc, affiché dans l'en-tête -- context devient redondant
-- et est supprimée. Contenu recalé sur le CV le plus récent de l'utilisatrice
-- (~/Downloads/CVEnoraLeTurnier-ProductDesignerNocode.pdf, 08/09) : la
-- première expérience (Folio+) y est intitulée "Product Designer
-- Consultante" avec une date de fin (Juin-Août 2026, plus "poste actuel").

update public.experiences set
  title = 'Product Designer Consultante',
  end_date = '2026-08-31',
  short_desc = 'Plateforme de portfolio à accès contrôlé pour designers freelance, conçue, développée et déployée seule en 6 semaines — projet de certification RNCP niveau 6.'
where display_order = 0;

update public.experiences set short_desc = 'Suite de produits SaaS B2B/B2B2C (back-office, e-gaming, loteries, paris sportifs) pour opérateurs internationaux — refonte du Design System et standardisation UI sur 5 équipes.' where display_order = 1;
update public.experiences set short_desc = 'Logiciel de management de la performance des entreprises — audit UX et refonte des dashboards et de l''arborescence.' where display_order = 2;
update public.experiences set short_desc = 'Plateforme d''apprentissage du code de la route accessible aux personnes en situation de handicap (Apside, mission en parallèle).' where display_order = 3;
update public.experiences set short_desc = 'Industrialisation d''un Design System transverse multi-produits pour le monitoring d''infrastructures (Apside, mission en parallèle).' where display_order = 4;
update public.experiences set short_desc = 'Espace gestionnaire MonCompteFormation, interface métier multi-services à fortes contraintes réglementaires (Apside, mission en parallèle).' where display_order = 5;
update public.experiences set short_desc = 'Rôles antérieurs et missions ponctuelles, du graphisme freelance aux applications métier réglementées.' where display_order = 6;

alter table public.experiences drop column context;
