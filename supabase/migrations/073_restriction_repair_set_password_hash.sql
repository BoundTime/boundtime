-- Reparatur: Hash setzen, wenn Beschränkung aktiv ist aber noch kein Passwort (restriction_password_hash) existiert.
-- Unabhängig von Migration 072 – funktioniert auch wenn die alte RPC noch "Aktuelles Passwort" verlangt.

create or replace function public.set_restriction_password_hash_only(p_password text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_enabled boolean;
  v_hash text;
  v_pwd_trim text := nullif(trim(coalesce(p_password, '')), '');
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  if v_pwd_trim is null then
    raise exception 'Passwort darf nicht leer sein';
  end if;
  select restriction_enabled, restriction_password_hash
  into v_enabled, v_hash
  from public.profiles where id = v_user_id;

  if not v_enabled then
    raise exception 'Reparatur nur wenn Zugriffsbeschränkung bereits aktiv ist';
  end if;
  if v_hash is not null and trim(v_hash) <> '' then
    return; -- Hash bereits gesetzt, nichts tun
  end if;

  update public.profiles
  set restriction_password_hash = crypt(v_pwd_trim, gen_salt('bf'))
  where id = v_user_id;
end;
$$;

grant execute on function public.set_restriction_password_hash_only(text) to authenticated;
