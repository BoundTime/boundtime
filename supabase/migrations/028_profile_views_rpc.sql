-- RPCs für Profilbesucher: Aufzeichnen und Abruf mit Auth-Kontext

-- Aufruf vom Besucher: zeichnet Besuch auf (auth.uid() = viewer_id)
create or replace function public.record_profile_view(target_profile_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() = target_profile_id then
    return;
  end if;
  insert into public.profile_views (viewer_id, profile_id, viewed_at)
  values (auth.uid(), target_profile_id, now())
  on conflict (viewer_id, profile_id) do update set viewed_at = now();
end;
$$;

-- Aufruf vom Profilinhaber: liefert Besucher (profile_id = auth.uid())
create or replace function public.get_my_profile_views()
returns table (viewer_id uuid, viewed_at timestamptz)
language sql
security invoker
stable
set search_path = public
as $$
  select pv.viewer_id, pv.viewed_at
  from public.profile_views pv
  where pv.profile_id = auth.uid()
  order by pv.viewed_at desc
  limit 20;
$$;

grant execute on function public.record_profile_view(uuid) to authenticated;
grant execute on function public.get_my_profile_views() to authenticated;
