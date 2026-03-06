-- Paar: Tendenz pro Person (Devot / Dominant / Switcher) statt einer gemeinsamen Rolle
alter table public.profiles
  add column if not exists couple_first_tendency text
    check (couple_first_tendency is null or couple_first_tendency in ('devot', 'dominant', 'switcher')),
  add column if not exists couple_partner_tendency text
    check (couple_partner_tendency is null or couple_partner_tendency in ('devot', 'dominant', 'switcher'));

comment on column public.profiles.couple_first_tendency is 'Paar: Tendenz erste Person (devot, dominant, switcher)';
comment on column public.profiles.couple_partner_tendency is 'Paar: Tendenz zweite Person (devot, dominant, switcher)';
