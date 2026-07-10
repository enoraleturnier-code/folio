-- Seed the missing designer_profiles row for the admin account (Léa Martin),
-- idempotent so it can be replayed safely.
insert into public.designer_profiles (user_id, slug, bio, photo_url, website_url, linkedin_url, twitter_url)
select
  'b2c7b021-0699-4cf0-b5bb-88c7074fb67c',
  'lea-martin',
  'Je dessine des interfaces sobres pour des équipes qui prennent des décisions rapides. Dix ans à ciseler des produits SaaS, à cadrer des systèmes de design, et à défendre l''utilisateur là où ça compte : dans la salle où l''on tranche.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6gHuqRXyMQser0KzvPIMw2L6EtYW15caFUVyuRkSeKTfo_NrEAM-VRq-KMzq6agx4LKN3LZ9IZ7NUraU-wbpcv94etLyE7jXcvor4s-clkIo2aQV9VhwJwjIyNjOdzrrjxPSQbDel4qKEA0M88G0OZtKYxIiY9M7VgmyzxYJBPOI6JwJtWeQ8R_MYJqi-jFe6Jg2Sr-ZviF-Bkqj2q1IxyhH-ZudRLvzHwnZmKFJ-TVvUBOL3D7hi8DbOoY7BKgVOV26c89gtdk',
  'https://leamartin.design',
  'https://linkedin.com/in/lea-martin',
  'https://twitter.com/leamartin'
where not exists (
  select 1 from public.designer_profiles where user_id = 'b2c7b021-0699-4cf0-b5bb-88c7074fb67c'
);

-- Public view exposing only the non-sensitive columns needed to render a
-- designer's public identity (e.g. "Contacter {full_name}" links) without
-- granting broad SELECT on user_profiles, which holds PII (email, role,
-- rejection_reason, etc.) restricted to the row owner / admin by RLS.
create or replace view public.designer_public_profile as
select
  dp.slug,
  up.full_name,
  dp.bio,
  dp.photo_url,
  dp.website_url,
  dp.linkedin_url,
  dp.twitter_url
from public.designer_profiles dp
join public.user_profiles up on up.id = dp.user_id;

grant select on public.designer_public_profile to anon, authenticated;
