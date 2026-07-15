create type notification_type as enum ('access_request_received', 'access_request_resolved');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  type notification_type not null,
  access_request_id uuid references public.access_requests(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'Notifications generees par le cycle de vie des demandes d''acces (nouvelle demande -> admins, validation/refus -> visiteur). Alimentee exclusivement par le trigger access_requests_notify (SECURITY DEFINER), jamais ecrite directement par un client.';

create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select
  using (user_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- SECURITY DEFINER : l'INSERT doit notifier tous les admins (pas seulement l'auteur de la
-- ligne access_requests, qui est le visiteur lui-meme et n'a pas la policy d'insert sur
-- notifications pour un user_id qui n'est pas le sien).
create or replace function public.create_access_request_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.notifications (user_id, type, access_request_id, project_id)
    select up.id, 'access_request_received', new.id, new.project_id
    from public.user_profiles up
    where up.role = 'admin';
  elsif TG_OP = 'UPDATE' and old.status = 'pending' and new.status in ('approved', 'rejected') then
    insert into public.notifications (user_id, type, access_request_id, project_id)
    values (new.user_id, 'access_request_resolved', new.id, new.project_id);
  end if;
  return new;
end;
$$;

create trigger access_requests_notify
after insert or update on public.access_requests
for each row execute function public.create_access_request_notifications();
