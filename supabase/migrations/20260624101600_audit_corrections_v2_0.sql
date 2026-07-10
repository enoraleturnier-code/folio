-- Folio+ — Script SQL RLS & Corrections v2.0
-- Date : 24 juin 2026
-- ============================================================

-- BLOC 1 — FONCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, email, full_name, consent_given_at, role, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    'pending',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() = OLD.id
     AND (SELECT role FROM public.user_profiles WHERE id = auth.uid()) != 'admin'
  THEN
    RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre rôle.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_update ON public.user_profiles;

CREATE TRIGGER trg_prevent_role_self_update
  BEFORE UPDATE OF role ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_self_update();

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_profiles
  WHERE id = auth.uid();
$$;

-- BLOC 2 — CORRECTIONS SCHÉMA

ALTER TABLE public.user_profiles
  ALTER COLUMN consent_given_at SET DEFAULT now();

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DROP VIEW IF EXISTS public.projects_catalog_view;

CREATE VIEW public.projects_catalog_view
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.title,
  p.short_desc,
  p.thumbnail_url,
  p.status,
  p.sensitivity_level,
  p.secteur_activite,
  p.company_name,
  p.role,
  p.start_date,
  p.end_date,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  ARRAY_AGG(DISTINCT tr.name) FILTER (WHERE tr.name IS NOT NULL) AS tools,
  ARRAY_AGG(DISTINCT kr.name) FILTER (WHERE kr.name IS NOT NULL) AS keywords,
  ARRAY_AGG(DISTINCT ptr.name) FILTER (WHERE ptr.name IS NOT NULL) AS types
FROM public.projects p
LEFT JOIN public.project_tools pt ON pt.project_id = p.id
LEFT JOIN public.tools_ref tr ON tr.id = pt.tool_id
LEFT JOIN public.project_keywords pk ON pk.project_id = p.id
LEFT JOIN public.keywords_ref kr ON kr.id = pk.keyword_id
LEFT JOIN public.project_types ptyp ON ptyp.project_id = p.id
LEFT JOIN public.project_types_ref ptr ON ptr.id = ptyp.type_id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- BLOC 3 — INDEX

CREATE INDEX IF NOT EXISTS idx_access_requests_user_id    ON public.access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_project_id ON public.access_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id           ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_tool_id      ON public.project_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_project_keywords_keyword_id ON public.project_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_project_types_type_id      ON public.project_types(type_id);
CREATE INDEX IF NOT EXISTS idx_projects_status            ON public.projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_secteur           ON public.projects(secteur_activite) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at        ON public.projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_access_requests_status     ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_contacts_status            ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_designer_profiles_slug     ON public.designer_profiles(slug);

-- BLOC 4 — REVOKE FONCTIONS SECURITY DEFINER

REVOKE EXECUTE ON FUNCTION public.get_my_role()               FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()           FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_self_update()  FROM anon, authenticated;

-- BLOC 5 — POLICIES RLS

ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools_ref         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords_ref      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types_ref ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tools     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_keywords  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types     ENABLE ROW LEVEL SECURITY;

-- projects
DROP POLICY IF EXISTS "projects_select_public_anon"  ON public.projects;
DROP POLICY IF EXISTS "projects_select_validated"     ON public.projects;
DROP POLICY IF EXISTS "projects_select_admin"         ON public.projects;
DROP POLICY IF EXISTS "projects_select_unified"       ON public.projects;
DROP POLICY IF EXISTS "projects_insert_admin"         ON public.projects;
DROP POLICY IF EXISTS "projects_update_admin"         ON public.projects;

CREATE POLICY "projects_select_unified"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (
    get_my_role() = 'admin'
    OR (
      deleted_at IS NULL
      AND (
        (
          status = 'public'
          AND (
            (SELECT auth.uid()) IS NULL
            OR get_my_role() IN ('pending', 'rejected')
          )
        )
        OR (
          status IN ('public', 'confidential')
          AND get_my_role() = 'validated_visitor'
        )
      )
    )
  );

CREATE POLICY "projects_insert_admin"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "projects_update_admin"
  ON public.projects FOR UPDATE
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own"          ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_admin"        ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select"              ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own"          ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_trigger_only" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own"          ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_admin"        ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_admin"        ON public.user_profiles;

CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR get_my_role() = 'admin'
  );

CREATE POLICY "user_profiles_insert_trigger_only"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING    (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "user_profiles_update_admin"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "user_profiles_delete_admin"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- access_requests
DROP POLICY IF EXISTS "access_requests_select_own"      ON public.access_requests;
DROP POLICY IF EXISTS "access_requests_select_admin"    ON public.access_requests;
DROP POLICY IF EXISTS "access_requests_select"          ON public.access_requests;
DROP POLICY IF EXISTS "access_requests_insert_pending"  ON public.access_requests;
DROP POLICY IF EXISTS "access_requests_update_admin"    ON public.access_requests;

CREATE POLICY "access_requests_select"
  ON public.access_requests FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR get_my_role() = 'admin'
  );

CREATE POLICY "access_requests_insert_pending"
  ON public.access_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND get_my_role() = 'pending'
  );

CREATE POLICY "access_requests_update_admin"
  ON public.access_requests FOR UPDATE
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- contacts
DROP POLICY IF EXISTS "contacts_select_admin"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_anyone" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_admin"  ON public.contacts;

CREATE POLICY "contacts_select_admin"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

CREATE POLICY "contacts_insert_anyone"
  ON public.contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    type IN ('contact', 'rdv')
    AND name IS NOT NULL
    AND email IS NOT NULL
    AND consent_given_at IS NOT NULL
  );

CREATE POLICY "contacts_update_admin"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- designer_profiles
DROP POLICY IF EXISTS "designer_profiles_select_public" ON public.designer_profiles;
DROP POLICY IF EXISTS "designer_profiles_insert_admin"  ON public.designer_profiles;
DROP POLICY IF EXISTS "designer_profiles_update_admin"  ON public.designer_profiles;

CREATE POLICY "designer_profiles_select_public"
  ON public.designer_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "designer_profiles_insert_admin"
  ON public.designer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "designer_profiles_update_admin"
  ON public.designer_profiles FOR UPDATE
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- admin_settings
DROP POLICY IF EXISTS "admin_settings_all_admin" ON public.admin_settings;

CREATE POLICY "admin_settings_all_admin"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- tables de référence
DROP POLICY IF EXISTS "tools_ref_select_public"         ON public.tools_ref;
DROP POLICY IF EXISTS "tools_ref_admin"                 ON public.tools_ref;
DROP POLICY IF EXISTS "keywords_ref_select_public"      ON public.keywords_ref;
DROP POLICY IF EXISTS "keywords_ref_admin"              ON public.keywords_ref;
DROP POLICY IF EXISTS "project_types_ref_select_public" ON public.project_types_ref;
DROP POLICY IF EXISTS "project_types_ref_admin"         ON public.project_types_ref;

CREATE POLICY "tools_ref_select_public"         ON public.tools_ref         FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tools_ref_admin"                 ON public.tools_ref         FOR ALL    TO authenticated       USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "keywords_ref_select_public"      ON public.keywords_ref      FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "keywords_ref_admin"              ON public.keywords_ref      FOR ALL    TO authenticated       USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "project_types_ref_select_public" ON public.project_types_ref FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "project_types_ref_admin"         ON public.project_types_ref FOR ALL    TO authenticated       USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- tables de liaison
DROP POLICY IF EXISTS "project_tools_select_public" ON public.project_tools;
DROP POLICY IF EXISTS "project_tools_select_admin"  ON public.project_tools;
DROP POLICY IF EXISTS "project_tools_select"        ON public.project_tools;
DROP POLICY IF EXISTS "project_tools_admin"         ON public.project_tools;

CREATE POLICY "project_tools_select"
  ON public.project_tools FOR SELECT
  TO anon, authenticated
  USING (
    get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND p.deleted_at IS NULL
        AND (
          p.status = 'public'
          OR (p.status IN ('public','confidential') AND get_my_role() = 'validated_visitor')
        )
    )
  );

CREATE POLICY "project_tools_admin"
  ON public.project_tools FOR ALL
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "project_keywords_select_public" ON public.project_keywords;
DROP POLICY IF EXISTS "project_keywords_select_admin"  ON public.project_keywords;
DROP POLICY IF EXISTS "project_keywords_select"        ON public.project_keywords;
DROP POLICY IF EXISTS "project_keywords_admin"         ON public.project_keywords;

CREATE POLICY "project_keywords_select"
  ON public.project_keywords FOR SELECT
  TO anon, authenticated
  USING (
    get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND p.deleted_at IS NULL
        AND (
          p.status = 'public'
          OR (p.status IN ('public','confidential') AND get_my_role() = 'validated_visitor')
        )
    )
  );

CREATE POLICY "project_keywords_admin"
  ON public.project_keywords FOR ALL
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "project_types_select_public" ON public.project_types;
DROP POLICY IF EXISTS "project_types_select_admin"  ON public.project_types;
DROP POLICY IF EXISTS "project_types_select"        ON public.project_types;
DROP POLICY IF EXISTS "project_types_admin"         ON public.project_types;

CREATE POLICY "project_types_select"
  ON public.project_types FOR SELECT
  TO anon, authenticated
  USING (
    get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND p.deleted_at IS NULL
        AND (
          p.status = 'public'
          OR (p.status IN ('public','confidential') AND get_my_role() = 'validated_visitor')
        )
    )
  );

CREATE POLICY "project_types_admin"
  ON public.project_types FOR ALL
  TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
