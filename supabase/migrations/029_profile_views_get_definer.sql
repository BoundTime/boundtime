-- get_my_profile_views als DEFINER, damit die Abfrage nicht von RLS blockiert wird.
-- record_profile_view ebenfalls als DEFINER, damit der INSERT nicht von RLS blockiert wird.
-- Beide nutzen weiterhin auth.uid() (Aufrufer) für die Logik.

alter function public.get_my_profile_views() security definer;
alter function public.record_profile_view(uuid) security definer;
