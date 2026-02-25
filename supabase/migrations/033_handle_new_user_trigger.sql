-- Trigger: Profil automatisch anlegen, wenn ein neuer Nutzer in auth.users eingetragen wird.
-- Erforderlich für E-Mail-Bestätigung: Der Client hat nach signUp keine Session,
-- daher scheitert die RLS-Policy "profiles_insert_own" (authenticated required).
-- Die Profildaten (nick, gender, role, date_of_birth) werden via user_metadata beim signUp übergeben.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nick, gender, role, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nick', 'User'),
    coalesce(new.raw_user_meta_data->>'gender', 'Divers'),
    coalesce(new.raw_user_meta_data->>'role', 'Switcher'),
    case
      when new.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data->>'date_of_birth')::date
      else null
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
