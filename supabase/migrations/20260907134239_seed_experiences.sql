-- Seed reel extrait du CV (~/Downloads/CV-Enora-Le-Turnier-2026.pdf), relu
-- deux fois contre le rendu visuel du PDF pour eviter une erreur d'ordre
-- puces/entreprise due au layout 2 colonnes. `project_url` laisse `null`
-- pour les 7 lignes : aucune URL reelle fournie pour ces experiences, pas
-- d'invention de contenu.
insert into public.experiences
  (designer_profile_id, title, company, context, bullets, impact, project_url, start_date, end_date, display_order)
select dp.id, v.title, v.company, v.context, v.bullets, v.impact, null, v.start_date, v.end_date, v.display_order
from public.designer_profiles dp
cross join (values
  (
    'Product Designer & Vibe Coder', 'Folio+',
    'Plateforme de portfolio à accès contrôlé pour designers freelance — conçue, développée et déployée seule en 6 semaines, projet de certification RNCP niveau 6.',
    array[
      'Cadrage produit : PRD, personas, parcours critiques, périmètre MVP priorisé.',
      'Base de données PostgreSQL (12 tables) sécurisée par Row Level Security, 4 rôles utilisateurs.',
      'Front React 19 / Tailwind v4 sur design system documenté, contrastes WCAG vérifiés.',
      'Edge Functions, structuration de contenu par IA, emails transactionnels, conformité RGPD.',
      'Déploiement continu GitHub / Vercel sur nom de domaine personnel.'
    ],
    'MVP validé devant jury. Chaîne complète conception → production maîtrisée sans équipe de développement.',
    date '2026-06-01', null::date, 0
  ),
  (
    'Senior Product Designer', 'Koralplay',
    'Suite de produits SaaS B2B / B2B2C (back-office, e-gaming, loteries, paris sportifs) pour opérateurs internationaux.',
    array[
      'Standardisation UI transverse sur 5 équipes, refonte du Design System (+120 composants documentés).',
      'Réduction des frictions de workflow Figma / Notion / Storybook / développement.',
      'Redesign responsive des écrans back-office et accélération de la conception par IA.',
      'Discovery structurée en binôme Designer–Product Manager : interviews, user flows des parcours critiques.',
      'Prototypes low-fi et high-fi, tests utilisateurs des features stratégiques.'
    ],
    'Guidelines UX/UI structurées. Cycles de développement accélérés et cohérence produit améliorée.',
    date '2025-05-01', date '2025-11-30', 1
  ),
  (
    'Product Designer Consultante', 'Safireo (Keepcod, ESN)',
    'Logiciel de management de la performance des entreprises.',
    array[
      'Audit UX et matrice de priorisation (52 points), refonte de l''arborescence.',
      'Librairie de composants marque blanche (Syncfusion, Angular Material), refonte des dashboards et parcours clés (+20 écrans HD).'
    ],
    'Cohérence produit et workflows optimisés. Lisibilité des enjeux business.',
    date '2025-02-01', date '2025-03-31', 2
  ),
  (
    'UX/UI Designer', 'Auto-école Soteau',
    'Apside (ESN) — mission en parallèle. Plateforme d''apprentissage du code de la route accessible aux personnes en situation de handicap.',
    array[
      'Conception UX/UI complète (+170 écrans) et structuration des parcours pédagogiques.',
      'Design System inclusif en React conforme RGAA : intégration LSF, FALC, CAA, audiodescription.',
      'Tests utilisateurs spécifiques en collaboration avec un ergothérapeute.'
    ],
    'Outil adapté aux handicaps cognitifs, moteurs et auditifs. Conformité RGAA niveau AA.',
    date '2022-02-01', date '2024-01-31', 3
  ),
  (
    'UX/UI Engineer & Référente Design System', 'Sercel',
    'Apside (ESN) — mission en parallèle. Industrialisation d''un Design System transverse multi-produits (monitoring d''infrastructures, exploration des sous-sols).',
    array[
      'Développement et intégration de la librairie web, +80 composants (Angular, Bootstrap, Sass, Storybook).',
      'Cadrage produit, recherches UX (ateliers, interviews, data, tests), prototypage et suivi des développements en itération.',
      'Mise en place des thèmes light et dark, optimisation du workflow Figma / Storybook / Zeroheight.',
      'Documentation technique et guidelines design complètes.'
    ],
    'Design System adopté par 100 % des équipes. IHM homogénéisées et vélocité de développement améliorée.',
    date '2021-08-01', date '2023-02-28', 4
  ),
  (
    'UX/UI Designer', 'Caisse des Dépôts et Consignations',
    'Apside (ESN) — mission en parallèle. Espace gestionnaire MonCompteFormation — interface métier multi-services à fortes contraintes réglementaires (Angular).',
    array[
      'Animation d''ateliers et co-création en focus groupes métiers, validation des hypothèses par tests de wireframes interactifs.',
      'Création d''un Design System dédié, rédaction des User Stories et alimentation du backlog.'
    ],
    'Flux complexes multi-données simplifiés. Appropriation rapide de l''outil par les gestionnaires.',
    date '2019-11-01', date '2020-06-30', 5
  ),
  (
    'Expériences complémentaires', 'Missions diverses',
    'Rôles antérieurs et missions ponctuelles, du graphisme freelance aux applications métier réglementées.',
    array[
      'UX/UI Designer — AOP Saint-Nectaire (application mobile B2B), 2024.',
      'UX/UI Designer — Département de Loire-Atlantique, 2022–2023.',
      'Product Designer & intégratrice — Apside (projets internes) · Développeuse Front — Informatique CDC, 2019.',
      'Graphiste & UI Designer — Freelance, 2016–2018.'
    ],
    null,
    date '2016-01-01', date '2024-12-31', 6
  )
) as v(title, company, context, bullets, impact, start_date, end_date, display_order)
where dp.slug = 'enora-le-turnier'
  and not exists (select 1 from public.experiences limit 1);
