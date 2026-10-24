-- Administrative, separately approved rollout step AFTER migration 023.
-- Supply existing member UUIDs privately as psql variables; never commit real UUIDs.
-- Assign A to the existing violet/watercolor profile, B to turquoise/stars.
-- Does not alter users, memberships, sessions or events. An existing configuration aborts.
begin;
create temporary table caregiver_rollout_input (
  id text primary key,
  user_id uuid not null unique,
  badge text not null,
  celebration text not null
) on commit drop;
insert into caregiver_rollout_input values
  ('caregiver_a', :'caregiver_a_user_id'::uuid, 'violet', 'watercolor'),
  ('caregiver_b', :'caregiver_b_user_id'::uuid, 'turquoise', 'stars');
do $$ begin
  if exists (select 1 from private.caregiver_profiles) then
    raise exception 'Presentation already configured; review existing mapping privately';
  end if;
  if (select count(*) from caregiver_rollout_input i join private.members m using (user_id)) <> 2 then
    raise exception 'Both UUIDs must identify existing authorized members';
  end if;
end $$;
insert into private.caregiver_profiles(id,person,display_name,badge,celebration)
select i.id,m.person,m.person,i.badge,i.celebration
from caregiver_rollout_input i join private.members m using (user_id);
commit;
