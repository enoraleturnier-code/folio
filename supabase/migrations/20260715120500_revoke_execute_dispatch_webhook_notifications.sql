-- Suite de 20260715120000 : dispatch_webhook() et
-- create_access_request_notifications() avaient un GRANT EXECUTE explicite a
-- anon/authenticated (privileges par defaut Supabase sur les nouvelles
-- fonctions du schema public), pas juste herite de PUBLIC comme
-- handle_new_user()/prevent_role_self_update(). Le REVOKE FROM PUBLIC de la
-- migration precedente ne les couvrait donc pas -- verifie via
-- has_function_privilege() apres coup, toujours true pour ces deux-la.
revoke execute on function public.dispatch_webhook() from anon, authenticated, public;
revoke execute on function public.create_access_request_notifications() from anon, authenticated, public;
