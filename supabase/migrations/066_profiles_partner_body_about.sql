-- Bei Paarprofil: Körper- und Über-mich-Angaben der zweiten Person (für Anzeige links Frau / rechts Mann)
alter table public.profiles
  add column if not exists partner_height_cm int check (partner_height_cm is null or (partner_height_cm >= 100 and partner_height_cm <= 250)),
  add column if not exists partner_weight_kg int check (partner_weight_kg is null or (partner_weight_kg >= 30 and partner_weight_kg <= 300)),
  add column if not exists partner_body_type text check (partner_body_type is null or partner_body_type in ('schlank', 'sportlich', 'kräftig', 'mollig', 'keine Angabe')),
  add column if not exists partner_about_me text check (partner_about_me is null or char_length(partner_about_me) <= 500);

comment on column public.profiles.partner_height_cm is 'Nur bei Paar: Größe zweite Person (cm)';
comment on column public.profiles.partner_weight_kg is 'Nur bei Paar: Gewicht zweite Person (kg)';
comment on column public.profiles.partner_body_type is 'Nur bei Paar: Figur zweite Person';
comment on column public.profiles.partner_about_me is 'Nur bei Paar: Über mich zweite Person';
