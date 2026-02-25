# Trigger in Supabase manuell ausführen

Der Fehler "Database error saving new user" bedeutet: Beim Anlegen eines Nutzers kann das Profil nicht erstellt werden.  
Der Datenbank-Trigger muss in Supabase ausgeführt werden.

## Schritte

1. **Supabase Dashboard** öffnen: https://supabase.com/dashboard
2. Dein Projekt **BoundTime** auswählen
3. Links auf **SQL Editor** klicken
4. **New query** wählen
5. Den folgenden SQL-Code **komplett** einfügen:

```sql
-- Trigger: Profil automatisch anlegen bei neuer Registrierung
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nick, gender, role, date_of_birth)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nick'), ''), 'user_' || left(new.id::text, 8)),
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
```

6. Auf **Run** (oder Strg+Enter) klicken
7. Es sollte "Success" erscheinen

## Danach

- Registrierung erneut testen
- Der Fehler sollte verschwinden
