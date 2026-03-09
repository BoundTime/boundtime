-- Behebt "function gen_salt(unknown) does not exist":
-- pgcrypto liegt bei Supabase im Schema "extensions". RPCs mit search_path = public
-- finden gen_salt/crypt dort nicht. Lösung: explizit extensions.gen_salt und extensions.crypt
-- aufrufen, inkl. Typ-Cast 'bf'::text gegen "unknown".

create or replace function public.check_restriction_password(p_user_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
  v_pwd text := nullif(trim(coalesce(p_password, '')), '');
begin
  if p_user_id is null or v_pwd is null then
    return false;
  end if;
  select restriction_password_hash into v_hash
  from public.profiles where id = p_user_id and restriction_enabled = true;
  if v_hash is null then
    return false;
  end if;
  return v_hash = extensions.crypt(v_pwd, v_hash);
end;
$$;

create or replace function public.set_restriction_password(
  p_password text,
  p_recovery_email text default null,
  p_enabled boolean default false,
  p_current_password text default null
)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  v_user_id uuid := auth.uid();
  v_current_enabled boolean;
  v_current_hash text;
  v_ok boolean;
  v_pwd_trim text := nullif(trim(coalesce(p_password, '')), '');
  v_has_hash boolean;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select restriction_enabled, restriction_password_hash
  into v_current_enabled, v_current_hash
  from public.profiles where id = v_user_id;

  v_has_hash := (v_current_hash is not null and trim(v_current_hash) <> '');

  if v_current_enabled and v_has_hash then
    if p_current_password is null or trim(p_current_password) = '' then
      raise exception 'Aktuelles Passwort erforderlich um Einstellungen zu ändern';
    end if;
    select check_restriction_password(v_user_id, p_current_password) into v_ok;
    if not v_ok then
      raise exception 'Aktuelles Passwort ist falsch';
    end if;
  end if;

  if p_enabled then
    if not v_has_hash and (v_pwd_trim is null or v_pwd_trim = '') then
      raise exception 'Zum Aktivieren der Zugriffsbeschränkung muss ein Passwort gesetzt werden.';
    end if;
  end if;

  update public.profiles set
    restriction_password_hash = case when v_pwd_trim is not null then extensions.crypt(v_pwd_trim, extensions.gen_salt('bf'::text)) else restriction_password_hash end,
    restriction_recovery_email = case when p_recovery_email is not null then nullif(trim(p_recovery_email), '') else restriction_recovery_email end,
    restriction_enabled = p_enabled
  where id = v_user_id;
end;
$$;

create or replace function public.set_restriction_password_hash_only(p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
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
    return;
  end if;

  update public.profiles
  set restriction_password_hash = extensions.crypt(v_pwd_trim, extensions.gen_salt('bf'::text))
  where id = v_user_id;
end;
$$;
