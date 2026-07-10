-- 1. Référentiels
INSERT INTO project_types_ref (name) VALUES
  ('Design de produit'), ('Identité de marque'), ('Motion'), ('UX-UI'), ('Print'), ('Graphisme'), ('3D')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tools_ref (name) VALUES
  ('Figma'), ('Notion'), ('Illustrator'), ('Webflow'), ('After Effects')
ON CONFLICT (name) DO NOTHING;

INSERT INTO keywords_ref (name) VALUES
  ('SaaS'), ('Design System'), ('Illustration'), ('B2B')
ON CONFLICT (name) DO NOTHING;

-- 2. Projets (idempotent)
INSERT INTO projects
  (title, short_desc, long_desc, ai_structured_desc, thumbnail_url, status, sensitivity_level,
   secteur_activite, client_name, company_name, role, team, start_date, end_date)
SELECT
  'Lumina Core',
  'Système d''exploitation intelligent pour la gestion d''infrastructures cloud haute performance.',
  'Refonte complète du dashboard d''administration cloud de NeoDynamics : simplification de la navigation, système de visualisation de données temps réel, et design system unifié pour l''ensemble de la suite produit.',
  '{"probleme":"Un dashboard historique devenu illisible à mesure que les fonctionnalités s''accumulaient, ralentissant les équipes ops.","decisions":"Refonte de l''architecture de l''information autour de 3 workflows prioritaires, nouveau système de composants data-viz.","resultat":"Temps de résolution d''incident réduit de 40%, adoption interne à 95% en 2 mois."}'::jsonb,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5pUyGiat_7KVutMx3Y4Mti88Ek2kQdJyslg_zmuU9PVZ0OmNjHpt5ApUZ_Lq1qfqbM3LhZ0uXPgLUkEh0c94BxBH2oPKBYv93DzvRu3VnzURfkBNZcTzcXXSUTNgfQYzW_JQ_aKC75wr-5yB8SB90HKArpH1_Oey9qs9uU76GHQ2VhLCOSHqCEGpja5Y545mw5C-ms2baSdz0x5OWHnJpwkRnHN1mdWKxFjGtZs2nrBoFBerM0hwGt8u3_txEwiw01pWjnr1UrVk',
  'public', 'sensible', 'tech_saas', 'David Chen, VP Engineering', 'NeoDynamics', 'Lead UI/UX',
  'Fondateur/équipe technique NeoDynamics', '2023-08-15', '2023-12-20'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Lumina Core');

INSERT INTO projects
  (title, short_desc, long_desc, ai_structured_desc, thumbnail_url, status, sensitivity_level,
   secteur_activite, client_name, company_name, role, team, start_date, end_date)
SELECT
  'Aether Assets',
  'Identité visuelle et plateforme de gestion d''actifs numériques pour le secteur du luxe.',
  'Création de l''identité de marque complète et de la plateforme de gestion de collections pour Privat-Garten, maison spécialisée dans la curation d''actifs de luxe.',
  '{"probleme":"Aucune identité digitale cohérente pour une marque reposant historiquement sur le bouche-à-oreille.","decisions":"Système graphique inspiré de l''orfèvrerie, palette sombre et dorée, plateforme de catalogue sur-mesure.","resultat":"Lancement de la plateforme B2B avec 12 clients institutionnels dès le premier trimestre."}'::jsonb,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrhyDGvkR_nazVN-YvZJz0tbEOFVpukKYNHnPBkDEeaFEPtd5oXZMb1D2ne6qwglVD_fSDR9Hb2DGKfUBX6tO7vewtxvhLy-tE-YisQUGt7UYET1kjdXP6ywzgTXKcI_j7Ayx72LgLQMzsuBeGODR8gE9ZKDFQV7uqHFvlpta4zlbBGlGLWuRgefj6l24-382ojcbVzEJynZ9YDpBSwheUg_Ut_uOMh-arBkB9TgJMfPYyujgw7ckZnQnxTUH1pvWS6JCTK4H5FmA',
  'public', 'sensible', 'luxe_mode', 'Aurélien Kessler, Directeur Artistique', 'Privat-Garten', 'Creative Director',
  'Studio créatif interne Privat-Garten', '2024-01-10', '2024-07-15'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Aether Assets');

INSERT INTO projects
  (title, short_desc, long_desc, ai_structured_desc, thumbnail_url, status, sensitivity_level,
   secteur_activite, client_name, company_name, role, team, start_date, end_date)
SELECT
  'Meridian Trading Platform',
  'Refonte écosystème bancaire nouvelle génération. Identité visuelle et UX plateforme de trading haute fréquence.',
  'Refonte de la plateforme de trading interne de Meridian Capital : latence perçue, densité d''information, et conformité réglementaire pour les équipes de traders professionnels.',
  '{"probleme":"Interface héritée d''un ancien fournisseur, non adaptée aux nouveaux volumes de trading haute fréquence.","decisions":"Nouveau système de composants denses mais lisibles, raccourcis clavier natifs, mode sombre par défaut.","resultat":"Réduction du temps de traitement moyen par ordre de 18%, feedback traders très positif."}'::jsonb,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYI49vo5G1SO75LXBEGY82Dhj7HiHhdNDwVtgBc2Mrj_3_u35E863fGSPWxK4TXPUjn7s96yOJV2hkd7w5m0aKTi4N0m5FPPYaxAYM2lgkolPt0bmG9adbBSp1LUCEFH7x8EspWl1c9u4tDXTP1cN3YvLAtXbN0tcg3KBLTmgHs9gClzHSw2Vl3wzHMwov_ezu8SIpUx8Swgx8QxzijAV0nBGS4BvHRMNFcCfsuQv-LMOwkmHqLW51DqE9mxxynpJcorp8vpI505w',
  'confidential', 'tres_sensible', 'finance_banque_assurance', 'Alexandre Dubois, Head of Product', 'Meridian Capital', 'Lead Product Designer',
  '2 designers, 4 développeurs', '2024-03-01', '2024-08-05'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Meridian Trading Platform');

INSERT INTO projects
  (title, short_desc, long_desc, ai_structured_desc, thumbnail_url, status, sensitivity_level,
   secteur_activite, client_name, company_name, role, team, start_date, end_date)
SELECT
  'Nexus Hub Identity',
  'Identité complète de marque pour le nouveau centre de recherche en architecture durable.',
  'Système d''identité visuelle et signalétique pour le centre de recherche Nexus Hub, incluant direction artistique 3D pour les rendus architecturaux destinés aux investisseurs.',
  '{"probleme":"Un projet architectural ambitieux sans identité visuelle pour convaincre les financeurs institutionnels.","decisions":"Palette inspirée de l''aurore boréale, rendus 3D photoréalistes, système typographique sur-mesure.","resultat":"Levée de fonds bouclée en 3 mois, identité reprise pour l''ensemble de la communication du centre."}'::jsonb,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOeo7_YHZ1NfBC-6VZk6CQY-raY7dBwWYWgF3k05ycXiRRcszzi9ZXHoGmWw9QvdQIFBB4O0fzLCU9YNf3zitn14hctN8VB3QDJjCIq2PK7D720KfKTiC4OymlIpf8nLnVf8VLODhEZKvv-DiyoCKzNL4ffyS6lPPFXdFILVYjL2rmB6d89mD2FDtnyMAX84QPvE1qC5IWobEgDnWnd30S9fB3fu1LNO7ztPpu61DFQWhUq3aWnN9lC5J40Rf5mW2Qm4s1lSUSUNs',
  'confidential', 'sensible', 'immobilier', 'Dr. Elena Kovač, Directrice R&D', 'Nexus Corp', 'Lead Designer',
  '1 designer, 1 architecte 3D', '2024-04-01', '2024-07-20'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Nexus Hub Identity');

-- 3. Tables de liaison
INSERT INTO project_types (project_id, type_id)
SELECT p.id, t.id FROM projects p JOIN project_types_ref t ON t.name = 'Design de produit' WHERE p.title = 'Lumina Core'
UNION ALL
SELECT p.id, t.id FROM projects p JOIN project_types_ref t ON t.name = 'Identité de marque' WHERE p.title = 'Aether Assets'
UNION ALL
SELECT p.id, t.id FROM projects p JOIN project_types_ref t ON t.name = 'UX-UI' WHERE p.title = 'Meridian Trading Platform'
UNION ALL
SELECT p.id, t.id FROM projects p JOIN project_types_ref t ON t.name = '3D' WHERE p.title = 'Nexus Hub Identity'
ON CONFLICT DO NOTHING;

INSERT INTO project_tools (project_id, tool_id)
SELECT p.id, tl.id FROM projects p JOIN tools_ref tl ON tl.name IN ('Figma', 'Notion') WHERE p.title = 'Lumina Core'
UNION ALL
SELECT p.id, tl.id FROM projects p JOIN tools_ref tl ON tl.name IN ('Figma', 'Illustrator') WHERE p.title = 'Aether Assets'
UNION ALL
SELECT p.id, tl.id FROM projects p JOIN tools_ref tl ON tl.name IN ('Figma', 'Webflow') WHERE p.title = 'Meridian Trading Platform'
UNION ALL
SELECT p.id, tl.id FROM projects p JOIN tools_ref tl ON tl.name IN ('Figma', 'Notion') WHERE p.title = 'Nexus Hub Identity'
ON CONFLICT DO NOTHING;

INSERT INTO project_keywords (project_id, keyword_id)
SELECT p.id, k.id FROM projects p JOIN keywords_ref k ON k.name IN ('SaaS', 'Design System') WHERE p.title = 'Lumina Core'
UNION ALL
SELECT p.id, k.id FROM projects p JOIN keywords_ref k ON k.name IN ('Illustration', 'B2B') WHERE p.title = 'Aether Assets'
UNION ALL
SELECT p.id, k.id FROM projects p JOIN keywords_ref k ON k.name IN ('B2B', 'SaaS') WHERE p.title = 'Meridian Trading Platform'
UNION ALL
SELECT p.id, k.id FROM projects p JOIN keywords_ref k ON k.name IN ('Design System') WHERE p.title = 'Nexus Hub Identity'
ON CONFLICT DO NOTHING;
