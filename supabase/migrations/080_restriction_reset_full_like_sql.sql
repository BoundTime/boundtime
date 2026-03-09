-- Vollständiger Cuckymode-Reset per Token (wie SQL-Script: restriction_enabled, hash, recovery_email zurücksetzen)

create or replace function public.consume_restriction_reset_token(p_token text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_row record;
begin
  if p_token is null or trim(p_token) = '' then
    raise exception 'Ungültiger Token';
  end if;
  select user_id, expires_at into v_row
  from public.restriction_password_reset_tokens
  where token = trim(p_token);
  if not found then
    raise exception 'Token ungültig oder bereits verwendet';
  end if;
  if v_row.expires_at < now() then
    delete from public.restriction_password_reset_tokens where token = trim(p_token);
    raise exception 'Token abgelaufen';
  end if;
  v_user_id := v_row.user_id;
  -- Vollständiger Reset wie SQL-Script: Cuckymode ausschalten, Hash und Recovery-E-Mail löschen
  update public.profiles
  set
    restriction_enabled = false,
    restriction_password_hash = null,
    restriction_recovery_email = null
  where id = v_user_id;
  delete from public.restriction_password_reset_tokens where token = trim(p_token);
end;
$$;
