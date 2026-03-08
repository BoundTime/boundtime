-- Bei p_enabled = true muss ein Passwort gesetzt sein (Hash vorhanden oder p_password angegeben)
create or replace function public.set_restriction_password(
  p_password text,
  p_recovery_email text default null,
  p_enabled boolean default false,
  p_current_password text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_current_enabled boolean;
  v_current_hash text;
  v_ok boolean;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select restriction_enabled, restriction_password_hash
  into v_current_enabled, v_current_hash
  from public.profiles where id = v_user_id;

  if v_current_enabled then
    if p_current_password is null or trim(p_current_password) = '' then
      raise exception 'Aktuelles Passwort erforderlich um Einstellungen zu ändern';
    end if;
    select check_restriction_password(v_user_id, p_current_password) into v_ok;
    if not v_ok then
      raise exception 'Aktuelles Passwort ist falsch';
    end if;
  end if;

  if p_enabled then
    if (v_current_hash is null or trim(v_current_hash) = '')
       and (p_password is null or trim(coalesce(p_password, '')) = '') then
      raise exception 'Zum Aktivieren der Zugriffsbeschränkung muss ein Passwort gesetzt werden.';
    end if;
  end if;

  update public.profiles set
    restriction_password_hash = case when trim(coalesce(p_password, '')) <> '' then crypt(p_password, gen_salt('bf')) else restriction_password_hash end,
    restriction_recovery_email = case when p_recovery_email is not null then nullif(trim(p_recovery_email), '') else restriction_recovery_email end,
    restriction_enabled = p_enabled
  where id = v_user_id;
end;
$$;
