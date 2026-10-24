-- Additive presentation only. No changes to memberships, Auth, events or legacy RPCs.
-- Configure both rows privately, using existing identities, before publishing the client.
create table private.caregiver_profiles (
  id text primary key check (id in ('caregiver_a', 'caregiver_b')),
  -- Independent presentation: revoking a membership must not depend on profile rows.
  person text not null unique,
  display_name text not null check (length(display_name) between 1 and 100),
  badge text not null check (badge in ('violet', 'turquoise')),
  celebration text not null check (celebration in ('watercolor', 'stars'))
);
revoke all on private.caregiver_profiles from public, anon, authenticated;

create function public.family_caregivers()
returns table (id text, person text, display_name text, badge text, celebration text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.person, p.display_name, p.badge, p.celebration
  from private.caregiver_profiles p
  where (select public.is_family_member())
  order by p.id;
$$;
revoke all on function public.family_caregivers() from public, anon;
grant execute on function public.family_caregivers() to authenticated;
