-- record_profile_view als DEFINER, damit der INSERT nicht von RLS blockiert wird.
-- Die Funktion prüft weiterhin auth.uid() und target_profile_id.

alter function public.record_profile_view(uuid) security definer;
