-- Webhook 1 : INSERT user_profiles -> email "Bienvenue"
create trigger trg_webhook_welcome_email
after insert on public.user_profiles
for each row execute function public.dispatch_webhook('webhook-welcome-email');

-- Webhook 2 : INSERT access_requests -> email visiteur "Demande en cours" + email admin "Nouvelle demande"
create trigger trg_webhook_access_request_created
after insert on public.access_requests
for each row execute function public.dispatch_webhook('webhook-access-request-created');

-- Webhook 3 : UPDATE access_requests (pending -> approved/rejected) -> email visiteur "Acces accorde" / "Refuse + raison"
create trigger trg_webhook_access_request_updated
after update on public.access_requests
for each row
when (old.status = 'pending' and new.status in ('approved', 'rejected'))
execute function public.dispatch_webhook('webhook-access-request-updated');

-- Webhook 4 : INSERT contacts -> email confirmation visiteur + notification admin
create trigger trg_webhook_contact_created
after insert on public.contacts
for each row execute function public.dispatch_webhook('webhook-contact-created');
