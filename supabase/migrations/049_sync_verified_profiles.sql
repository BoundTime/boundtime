-- Einmalige Reparatur: verifications.status = 'approved' aber profiles.verified = false
update public.profiles p
set verified = true, verification_tier = 'gold'
from public.verifications v
where v.user_id = p.id and v.status = 'approved' and p.verified = false;
