-- Independent game data. The installation is repeatable and never resets progress.
create table if not exists public.game_state (
  id boolean primary key default true check (id),
  schema_version integer not null default 1,
  revision bigint not null default 0 check (revision >= 0),
  xp_total bigint not null default 0 check (xp_total >= 0),
  xp_balance bigint not null default 0 check (xp_balance >= 0 and xp_balance <= xp_total),
  updated_at timestamptz not null default now()
);
insert into public.game_state(id) values (true) on conflict do nothing;
create table if not exists public.game_unlocks (
  state_id boolean not null default true references public.game_state(id),
  skill_id text not null, price integer not null check (price >= 0),
  acquired_at timestamptz not null default now(), primary key (state_id, skill_id)
);
create table if not exists public.game_stats (
  state_id boolean not null default true references public.game_state(id),
  game_id text not null, rounds bigint not null default 0 check (rounds >= 0),
  best_bonus integer not null default 0 check (best_bonus between 0 and 5), primary key (state_id, game_id)
);
create table if not exists public.game_operations (
  id uuid primary key, actor_id uuid not null,
  state_id boolean not null default true references public.game_state(id),
  kind text not null, rules_version integer not null, client_schema integer not null,
  payload jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);
alter table public.game_state enable row level security;
alter table public.game_unlocks enable row level security;
alter table public.game_stats enable row level security;
alter table public.game_operations enable row level security;
revoke all on public.game_state, public.game_unlocks, public.game_stats, public.game_operations from public, anon, authenticated;
grant select on public.game_state, public.game_unlocks, public.game_stats to authenticated;
drop policy if exists game_read on public.game_state;
create policy game_read on public.game_state for select to authenticated using ((select public.is_family_member()));
drop policy if exists game_read on public.game_unlocks;
create policy game_read on public.game_unlocks for select to authenticated using ((select public.is_family_member()));
drop policy if exists game_read on public.game_stats;
create policy game_read on public.game_stats for select to authenticated using ((select public.is_family_member()));

create or replace function public.game_snapshot() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_family_member() then raise exception 'Kein Spielzugriff' using errcode = '42501'; end if;
  select to_jsonb(s) || jsonb_build_object('rules_version', 1,
    'unlocks', coalesce((select jsonb_agg(u.skill_id order by u.skill_id) from public.game_unlocks u where u.state_id=s.id), '[]'::jsonb),
    'stats', coalesce((select jsonb_agg(to_jsonb(t) order by t.game_id) from public.game_stats t where t.state_id=s.id), '[]'::jsonb))
  into result from public.game_state s where s.id;
  if result is null then raise exception 'Spielstand fehlt. Keine automatische Neuanlage.'; end if;
  return result;
end $$;

-- Keep this version's catalogue available when later rules are introduced.
create or replace function private.game_skill_v1(skill text) returns jsonb
language sql immutable set search_path = '' as $$
  select case skill
    when 'hands_discovered' then '{"cost":20}'::jsonb
    when 'targeted_grasp' then '{"cost":40,"requires":"hands_discovered"}'::jsonb
    when 'self_pacifier' then '{"cost":60,"requires":"targeted_grasp"}'::jsonb
    when 'eye_contact' then '{"cost":20}'::jsonb
    when 'social_smile' then '{"cost":40,"requires":"eye_contact"}'::jsonb
  end
$$;

create or replace function public.game_apply(operation_id uuid, actor_id uuid, operation_kind text, operation_payload jsonb, rules integer, client_schema integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.game_state; prior public.game_operations;
  result jsonb; skill jsonb; price integer; bonus integer; xp integer; game text; chosen_skill text;
begin
  if auth.uid() is null or actor_id is distinct from auth.uid() or not public.is_family_member() then raise exception 'Kein Spielzugriff' using errcode = '42501'; end if;
  if operation_id is null or operation_kind is null or operation_payload is null or rules is null or client_schema is null then raise exception 'Unvollständiger Spielvorgang' using errcode='22023'; end if;
  select * into s from public.game_state where id for update;
  if not found then raise exception 'Spielstand fehlt. Keine automatische Neuanlage.'; end if;
  select * into prior from public.game_operations o where o.id=operation_id;
  if found then
    if prior.actor_id is distinct from actor_id or prior.kind is distinct from operation_kind or prior.payload is distinct from operation_payload or prior.rules_version is distinct from rules or prior.client_schema is distinct from client_schema then
      raise exception 'Vorgangs-ID wurde bereits anders verwendet' using errcode='22023';
    end if;
    return prior.result;
  end if;
  -- Future migrations must explicitly extend compatible write paths; unknown schemas fail closed.
  if s.schema_version <> 1 or client_schema <> 1 or rules <> 1 then raise exception 'Bitte die App aktualisieren. Unbekannte Spielversion.' using errcode='22023'; end if;
  if operation_kind='round' then
    if jsonb_typeof(operation_payload) <> 'object' or not (operation_payload ?& array['game','completed','bonus']) or operation_payload - array['game','completed','bonus'] <> '{}'::jsonb
       or operation_payload->'completed' is distinct from '5'::jsonb or jsonb_typeof(operation_payload->'bonus') <> 'number'
       or (operation_payload->>'bonus') !~ '^[0-5]$' then raise exception 'Ungültiger Rundenabschluss' using errcode='22023'; end if;
    game := operation_payload->>'game'; bonus := (operation_payload->>'bonus')::integer;
    if game is null or game not in ('pacifier','baby_talk','grasp') then raise exception 'Unbekanntes Spiel' using errcode='22023'; end if;
    if game='grasp' and not exists(select 1 from public.game_unlocks u where u.skill_id='self_pacifier') then raise exception 'Greifspiel noch nicht verfügbar' using errcode='22023'; end if;
    xp := 10 + bonus;
    update public.game_state set xp_total=xp_total+xp, xp_balance=xp_balance+xp, revision=revision+1, updated_at=now() where id;
    insert into public.game_stats(game_id,rounds,best_bonus) values(game,1,bonus)
      on conflict(state_id,game_id) do update set rounds=public.game_stats.rounds+1, best_bonus=greatest(public.game_stats.best_bonus, excluded.best_bonus);
    result := jsonb_build_object('status','saved','xp',xp);
  elsif operation_kind='buy' then
    if jsonb_typeof(operation_payload) <> 'object' or not (operation_payload ? 'skill') or operation_payload - 'skill' <> '{}'::jsonb then raise exception 'Ungültiger Kauf' using errcode='22023'; end if;
    chosen_skill := operation_payload->>'skill'; skill := private.game_skill_v1(chosen_skill);
    if skill is null then raise exception 'Unbekannte Fähigkeit' using errcode='22023'; end if;
    price := (skill->>'cost')::integer;
    if exists(select 1 from public.game_unlocks u where u.skill_id=chosen_skill) then result := '{"status":"already_owned"}'::jsonb;
    elsif skill ? 'requires' and not exists(select 1 from public.game_unlocks u where u.skill_id=skill->>'requires') then result := '{"status":"missing_prerequisite"}'::jsonb;
    elsif s.xp_balance < price then result := '{"status":"insufficient_xp"}'::jsonb;
    else
      insert into public.game_unlocks(skill_id,price) values(chosen_skill,price);
      update public.game_state set xp_balance=xp_balance-price, revision=revision+1, updated_at=now() where id;
      result := '{"status":"purchased"}'::jsonb;
    end if;
  else raise exception 'Unbekannter Spielvorgang' using errcode='22023';
  end if;
  insert into public.game_operations(id,actor_id,kind,rules_version,client_schema,payload,result) values(operation_id,actor_id,operation_kind,rules,client_schema,operation_payload,result);
  return result;
end $$;
revoke all on function private.game_skill_v1(text) from public, anon, authenticated;
revoke all on function public.game_snapshot() from public, anon, authenticated;
revoke all on function public.game_apply(uuid,uuid,text,jsonb,integer,integer) from public, anon, authenticated;
grant execute on function public.game_snapshot() to authenticated;
grant execute on function public.game_apply(uuid,uuid,text,jsonb,integer,integer) to authenticated;
notify pgrst, 'reload schema';
