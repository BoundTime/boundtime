-- Online-Status: last_seen_at in profiles

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- RPC: Eigener last_seen_at aktualisieren
create or replace function public.update_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_seen_at = now()
  where id = auth.uid();
end;
$$;
grant execute on function public.update_last_seen() to authenticated;
