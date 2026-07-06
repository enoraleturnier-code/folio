
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum for project status
CREATE TYPE public.project_status AS ENUM ('public', 'confidential', 'draft', 'deleted');
CREATE TYPE public.sensitivity AS ENUM ('publique', 'confidentielle');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.contact_status AS ENUM ('nouveau', 'traite', 'archive');

-- ============ user_roles ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ designers ============
CREATE TABLE public.designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar TEXT NOT NULL,
  linkedin TEXT,
  twitter TEXT,
  website TEXT,
  cal_username TEXT,
  email TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.designers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designers TO authenticated;
GRANT ALL ON public.designers TO service_role;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view designers"
  ON public.designers FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Admins can insert designers"
  ON public.designers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update designers"
  ON public.designers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete designers"
  ON public.designers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_designers_updated_at
  BEFORE UPDATE ON public.designers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ projects ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cover TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  status project_status NOT NULL DEFAULT 'draft',
  sensitivity sensitivity NOT NULL DEFAULT 'publique',
  published BOOLEAN NOT NULL DEFAULT false,
  company TEXT,
  client TEXT,
  role TEXT,
  team TEXT,
  period TEXT,
  problem TEXT,
  decisions TEXT,
  result TEXT,
  tags JSONB NOT NULL DEFAULT '{"designType":[],"sector":[],"tools":[],"keywords":[]}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read: only non-deleted, published projects
CREATE POLICY "Anyone can view published projects"
  ON public.projects FOR SELECT TO anon, authenticated
  USING (published = true AND status <> 'deleted');
-- Admins see everything
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ access_requests ============
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  project_titles JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.access_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit access requests"
  ON public.access_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins can view access requests"
  ON public.access_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete access requests"
  ON public.access_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ contact_messages ============
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED DATA ============

INSERT INTO public.designers (slug, full_name, headline, bio, avatar, linkedin, twitter, website, cal_username, email, location) VALUES
('lea-martin',
 'Léa Martin',
 'Designeuse produit — interfaces sobres, décisions nettes.',
 'Je dessine des interfaces sobres pour des équipes qui prennent des décisions rapides. Dix ans à ciseler des produits SaaS, à cadrer des systèmes de design, et à défendre l''utilisateur là où ça compte : dans la salle où l''on tranche.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6gHuqRXyMQser0KzvPIMw2L6EtYW15caFUVyuRkSeKTfo_NrEAM-VRq-KMzq6agx4LKN3LZ9IZ7NUraU-wbpcv94etLyE7jXcvor4s-clkIo2aQV9VhwJwjIyNjOdzrrjxPSQbDel4qKEA0M88G0OZtKYxIiY9M7VgmyzxYJBPOI6JwJtWeQ8R_MYJqi-jFe6Jg2Sr-ZviF-Bkqj2q1IxyhH-ZudRLvzHwnZmKFJ-TVvUBOL3D7hi8DbOoY7BKgVOV26c89gtdk',
 'https://linkedin.com/in/lea-martin',
 'https://twitter.com/leamartin',
 'https://leamartin.design',
 'lea-martin',
 'hello@leamartin.design',
 'Paris — remote friendly');

INSERT INTO public.projects (slug, title, subtitle, cover, gallery, status, sensitivity, published, company, client, role, team, period, problem, decisions, result, tags, sort_order) VALUES
('arcane-banking','Arcane Banking','Refonte d''une néo-banque privée',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYI49vo5G1SO75LXBEGY82Dhj7HiHhdNDwVtgBc2Mrj_3_u35E863fGSPWxK4TXPUjn7s96yOJV2hkd7w5m0aKTi4N0m5FPPYaxAYM2lgkolPt0bmG9adbBSp1LUCEFH7x8EspWl1c9u4tDXTP1cN3YvLAtXbN0tcg3KBLTmgHs9gClzHSw2Vl3wzHMwov_ezu8SIpUx8Swgx8QxzijAV0nBGS4BvHRMNFcCfsuQv-LMOwkmHqLW51DqE9mxxynpJcorp8vpI505w',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuBYI49vo5G1SO75LXBEGY82Dhj7HiHhdNDwVtgBc2Mrj_3_u35E863fGSPWxK4TXPUjn7s96yOJV2hkd7w5m0aKTi4N0m5FPPYaxAYM2lgkolPt0bmG9adbBSp1LUCEFH7x8EspWl1c9u4tDXTP1cN3YvLAtXbN0tcg3KBLTmgHs9gClzHSw2Vl3wzHMwov_ezu8SIpUx8Swgx8QxzijAV0nBGS4BvHRMNFcCfsuQv-LMOwkmHqLW51DqE9mxxynpJcorp8vpI505w"]'::jsonb,
 'public','publique',true,'Arcane SA','Direction Produit','Lead Product Designer','3 designers, 6 ingénieurs','2023 — 2024',
 'Les clients privés fuyaient l''application mobile faute de clarté sur leurs actifs consolidés.',
 'Un tableau de bord unique avec hiérarchie stricte, suppression des micro-interactions décoratives, focalisation sur trois décisions clés par écran.',
 '+38% de rétention à 30 jours, NPS passé de 34 à 61, temps moyen d''exécution d''un virement divisé par deux.',
 '{"designType":["Product Design","UX"],"sector":["Fintech"],"tools":["Figma","ProtoPie"],"keywords":["Refonte","Mobile","Systèmes"]}'::jsonb, 1),
('polymath','Polymath','Outil éditorial pour rédactions indépendantes',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5pUyGiat_7KVutMx3Y4Mti88Ek2kQdJyslg_zmuU9PVZ0OmNjHpt5ApUZ_Lq1qfqbM3LhZ0uXPgLUkEh0c94BxBH2oPKBYv93DzvRu3VnzURfkBNZcTzcXXSUTNgfQYzW_JQ_aKC75wr-5yB8SB90HKArpH1_Oey9qs9uU76GHQ2VhLCOSHqCEGpja5Y545mw5C-ms2baSdz0x5OWHnJpwkRnHN1mdWKxFjGtZs2nrBoFBerM0hwGt8u3_txEwiw01pWjnr1UrVk',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuC5pUyGiat_7KVutMx3Y4Mti88Ek2kQdJyslg_zmuU9PVZ0OmNjHpt5ApUZ_Lq1qfqbM3LhZ0uXPgLUkEh0c94BxBH2oPKBYv93DzvRu3VnzURfkBNZcTzcXXSUTNgfQYzW_JQ_aKC75wr-5yB8SB90HKArpH1_Oey9qs9uU76GHQ2VhLCOSHqCEGpja5Y545mw5C-ms2baSdz0x5OWHnJpwkRnHN1mdWKxFjGtZs2nrBoFBerM0hwGt8u3_txEwiw01pWjnr1UrVk"]'::jsonb,
 'public','publique',true,'Polymath Press','Fondateurs','Product Designer','Solo + 2 ingénieurs','2022',
 'Les rédactions collaboratives perdaient l''historique de leurs décisions éditoriales entre relectures.',
 'Timeline verticale unique, système de notes contextuelles, séparation stricte de la relecture et de l''écriture.',
 'Adopté par 12 rédactions en 6 mois, réduction de 40% du temps de relecture.',
 '{"designType":["Product Design"],"sector":["Média"],"tools":["Figma"],"keywords":["Édito","Collaboration"]}'::jsonb, 2),
('helio-medical','Helio Medical','Dossier patient pour cliniques privées',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV9N420sohvgyQtludP08Un16PedhaZUZyRO8gYZHdTvkdA4fP0eA-k3bJ4qTAUVdeiwkXrJR7juSrPzxHZCJBcHlVpMxlPgqZ2026JM5iNrJqSMiN_SWf4NprVnonrUp_x2GagaObKxgW0twLv8gBuJRBZ9MljLmaxkG4k5S362W-ycQm3Up62Uhil-VvGKankVwyeCb0hQVcgOOkZs1KF3tH6697obqjLtkfMbqlrGJERwntScBTm3Lt3EgQYVyWqX6DS9Kj7kU',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuCV9N420sohvgyQtludP08Un16PedhaZUZyRO8gYZHdTvkdA4fP0eA-k3bJ4qTAUVdeiwkXrJR7juSrPzxHZCJBcHlVpMxlPgqZ2026JM5iNrJqSMiN_SWf4NprVnonrUp_x2GagaObKxgW0twLv8gBuJRBZ9MljLmaxkG4k5S362W-ycQm3Up62Uhil-VvGKankVwyeCb0hQVcgOOkZs1KF3tH6697obqjLtkfMbqlrGJERwntScBTm3Lt3EgQYVyWqX6DS9Kj7kU"]'::jsonb,
 'confidential','confidentielle',true,'Helio Group','Direction médicale','Lead UX','2 designers, 4 ingénieurs, 2 médecins','2023',
 'Le dossier patient forçait les praticiens à saisir les mêmes informations dans trois onglets distincts.',
 'Un flux linéaire de consultation, saisie vocale intégrée, tri par urgence clinique et non alphabétique.',
 'Temps de consultation réduit de 22%, adoption 95% en 3 mois.',
 '{"designType":["UX","Product Design"],"sector":["Santé"],"tools":["Figma","Miro"],"keywords":["Dossier","Praticiens"]}'::jsonb, 3),
('orbit-logistics','Orbit Logistics','Console de suivi pour flotte européenne',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOeo7_YHZ1NfBC-6VZk6CQY-raY7dBwWYWgF3k05ycXiRRcszzi9ZXHoGmWw9QvdQIFBB4O0fzLCU9YNf3zitn14hctN8VB3QDJjCIq2PK7D720KfKTiC4OymlIpf8nLnVf8VLODhEZKvv-DiyoCKzNL4ffyS6lPPFXdFILVYjL2rmB6d89mD2FDtnyMAX84QPvE1qC5IWobEgDnWnd30S9fB3fu1LNO7ztPpu61DFQWhUq3aWnN9lC5J40Rf5mW2Qm4s1lSUSUNs',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuDOeo7_YHZ1NfBC-6VZk6CQY-raY7dBwWYWgF3k05ycXiRRcszzi9ZXHoGmWw9QvdQIFBB4O0fzLCU9YNf3zitn14hctN8VB3QDJjCIq2PK7D720KfKTiC4OymlIpf8nLnVf8VLODhEZKvv-DiyoCKzNL4ffyS6lPPFXdFILVYjL2rmB6d89mD2FDtnyMAX84QPvE1qC5IWobEgDnWnd30S9fB3fu1LNO7ztPpu61DFQWhUq3aWnN9lC5J40Rf5mW2Qm4s1lSUSUNs"]'::jsonb,
 'confidential','confidentielle',true,'Orbit Cargo','COO','Product Designer senior','1 designer, 5 ingénieurs','2024',
 'Les dispatchers naviguaient entre six systèmes pour tracer un incident.',
 'Console unifiée temps-réel, hiérarchie par risque, escalade contextuelle.',
 'Résolution moyenne des incidents divisée par trois.',
 '{"designType":["Product Design"],"sector":["Logistique"],"tools":["Figma"],"keywords":["Ops","Temps réel"]}'::jsonb, 4),
('atelier-nord','Atelier Nord','Identité et site pour un studio d''architecture',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrhyDGvkR_nazVN-YvZJz0tbEOFVpukKYNHnPBkDEeaFEPtd5oXZMb1D2ne6qwglVD_fSDR9Hb2DGKfUBX6tO7vewtxvhLy-tE-YisQUGt7UYET1kjdXP6ywzgTXKcI_j7Ayx72LgLQMzsuBeGODR8gE9ZKDFQV7uqHFvlpta4zlbBGlGLWuRgefj6l24-382ojcbVzEJynZ9YDpBSwheUg_Ut_uOMh-arBkB9TgJMfPYyujgw7ckZnQnxTUH1pvWS6JCTK4H5FmA',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuDrhyDGvkR_nazVN-YvZJz0tbEOFVpukKYNHnPBkDEeaFEPtd5oXZMb1D2ne6qwglVD_fSDR9Hb2DGKfUBX6tO7vewtxvhLy-tE-YisQUGt7UYET1kjdXP6ywzgTXKcI_j7Ayx72LgLQMzsuBeGODR8gE9ZKDFQV7uqHFvlpta4zlbBGlGLWuRgefj6l24-382ojcbVzEJynZ9YDpBSwheUg_Ut_uOMh-arBkB9TgJMfPYyujgw7ckZnQnxTUH1pvWS6JCTK4H5FmA"]'::jsonb,
 'draft','publique',false,'Atelier Nord','Associés fondateurs','Direction artistique','Solo','2024',
 'L''atelier n''avait aucune présence numérique pour ses réponses à concours.',
 'Wordmark structurel, grille éditoriale stricte, palette réduite à trois valeurs.',
 'En cours de finalisation.',
 '{"designType":["Brand","Web"],"sector":["Architecture"],"tools":["Figma","Framer"],"keywords":["Identité"]}'::jsonb, 5),
('vestige','Vestige','Marketplace de mobilier vintage',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjd1GTxziYN3fqQ21VyrvJGj1xpewZ7CPTpe7fZ1AILPaJ3bW9FtMwflALH8gRVk7S2AiGARCg9aYbQ2SuAwj093KufcmK6eSSKO_k4aE7626k5B-iZ-OgRZUVlFoXMeT4yhsl4Y70En0De3GkvUdEmPDxzv9fWsU2qfIgMhcZ1FrOJ03w0ppaVB0KbfWWzDJZA-1a0qsMQixrmIe3BlpMt6RwRIkBMXEqGLvh_CTcG3-HYHgOQrwxe_II6Rr6dZWm2wjEck-BZoI',
 '["https://lh3.googleusercontent.com/aida-public/AB6AXuAjd1GTxziYN3fqQ21VyrvJGj1xpewZ7CPTpe7fZ1AILPaJ3bW9FtMwflALH8gRVk7S2AiGARCg9aYbQ2SuAwj093KufcmK6eSSKO_k4aE7626k5B-iZ-OgRZUVlFoXMeT4yhsl4Y70En0De3GkvUdEmPDxzv9fWsU2qfIgMhcZ1FrOJ03w0ppaVB0KbfWWzDJZA-1a0qsMQixrmIe3BlpMt6RwRIkBMXEqGLvh_CTcG3-HYHgOQrwxe_II6Rr6dZWm2wjEck-BZoI"]'::jsonb,
 'deleted','publique',false,'Vestige SAS','CEO','Product Designer','2 designers, 3 ingénieurs','2021',
 'Marketplace confidentiel, projet archivé.','Archivé.','Archivé.',
 '{"designType":["Product Design"],"sector":["Retail"],"tools":["Figma"],"keywords":["Marketplace"]}'::jsonb, 6);

INSERT INTO public.access_requests (full_name, company, email, project_titles, message, status, rejection_reason, created_at) VALUES
('Marc Dubois','Kairos Ventures','marc.dubois@kairos.vc','["Helio Medical","Orbit Logistics"]'::jsonb,
 'Bonjour Léa, nous étudions un investissement dans une clinique privée et souhaiterions comprendre votre travail sur Helio.',
 'pending', NULL, '2026-06-28T10:12:00Z'),
('Amélie Rousseau','Studio Poème','amelie@studiopoeme.fr','["Orbit Logistics"]'::jsonb,
 'Curieuse de voir vos systèmes temps-réel — nous refondons une console similaire.',
 'approved', NULL, '2026-06-20T14:03:00Z'),
('Thomas Bergier','Freelance','tom@bergier.io','["Helio Medical"]'::jsonb,
 'Peux-tu partager plus de détails ?',
 'rejected','Demande hors périmètre — pas de contexte professionnel identifié.','2026-06-14T09:31:00Z');

INSERT INTO public.contact_messages (full_name, email, message, status, created_at) VALUES
('Sarah Nguyen','sarah@northlab.io',
 'Bonjour Léa, nous cherchons un lead designer pour refondre notre console interne. Auriez-vous une disponibilité en septembre pour un premier échange ? Nous sommes basés à Berlin mais totalement remote-friendly.',
 'nouveau','2026-07-01T08:22:00Z'),
('Julien Perez','j.perez@atelier-nord.fr',
 'Merci pour la mise à jour d''hier — nous validons la V2 en interne, retour d''ici la fin de semaine.',
 'traite','2026-06-25T17:45:00Z'),
('Elena Costa','elena.costa@vestige.co',
 'Ancien projet — pour archives uniquement.',
 'archive','2026-05-11T11:00:00Z');
