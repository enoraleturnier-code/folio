insert into public.access_requests (user_id, project_id, status, rejection_reason, rejected_at, message, request_session_id, consent_given_at)
select
  '469dd567-bbf1-40e7-8c0b-c14dc7107f9e',
  '1a520f08-d68c-4cda-b215-5e78a6af8436',
  'rejected',
  'Le contexte fourni ne correspond pas au périmètre de ce projet confidentiel.',
  now(),
  'Je travaille sur un projet similaire et j''aimerais voir votre approche.',
  gen_random_uuid(),
  now()
where not exists (
  select 1 from public.access_requests
  where user_id = '469dd567-bbf1-40e7-8c0b-c14dc7107f9e'
    and project_id = '1a520f08-d68c-4cda-b215-5e78a6af8436'
);
