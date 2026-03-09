-- Beim Reaktivieren (Passwort existiert bereits) aktuelles Passwort zur Bestätigung verlangen.
-- Hash wird nur geändert, wenn explizit ein neues Passwort übergeben wird (p_password nicht leer).

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

  -- Aktuelles Passwort verlangen, wenn ein Hash existiert und (Cuckymode ist aktiv ODER wird aktiviert)
  if v_has_hash and (v_current_enabled or p_enabled) then
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
