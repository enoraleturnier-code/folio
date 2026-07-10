-- Folio+ — Migration v4.3
-- Retrait budget_range de contacts et budget_ranges de admin_settings
-- 25 juin 2026

ALTER TABLE public.contacts
  DROP COLUMN IF EXISTS budget_range;

ALTER TABLE public.admin_settings
  DROP COLUMN IF EXISTS budget_ranges;
