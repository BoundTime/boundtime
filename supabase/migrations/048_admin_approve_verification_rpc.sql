-- RPC: Admin bestätigt Verifizierung – setzt verified + verification_tier (umgeht profiles-RLS)
create or replace function public.approve_verification(p_verification_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_admin_id uuid := auth.uid();
  v_user_id uuid;
  v_is_admin boolean;
begin
  if v_admin_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select exists (select 1 from public.profiles where id = v_admin_id and is_admin = true) into v_is_admin;
  if not v_is_admin then
    raise exception 'Keine Admin-Berechtigung';
  end if;
  select user_id into v_user_id from public.verifications where id = p_verification_id and status = 'pending';
  if v_user_id is null then
    raise exception 'Verifizierung nicht gefunden oder nicht mehr ausstehend';
  end if;
  update public.verifications set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = v_admin_id,
    note = null
  where id = p_verification_id;
  update public.profiles set
    verified = true,
    verification_tier = 'gold'
  where id = v_user_id;
end;
$$;
