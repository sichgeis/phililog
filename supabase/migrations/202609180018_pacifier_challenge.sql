-- Additive V2. V1 RPCs and every historical receipt remain available unchanged.
create table if not exists public.game_scores (
  state_id boolean not null default true references public.game_state(id),
  rules_version integer not null check (rules_version=2),
  tempo text not null check (tempo in ('steady','alternating')),
  assists integer not null check (assists between 0 and 3),
  rounds bigint not null check (rounds > 0),
  best_score integer not null check (best_score between 0 and 3900),
  primary key(state_id,rules_version,tempo,assists)
);
alter table public.game_scores enable row level security;
revoke all on public.game_scores from public,anon,authenticated;
grant select on public.game_scores to authenticated;
drop policy if exists game_read on public.game_scores;
create policy game_read on public.game_scores for select to authenticated using ((select public.is_family_member()));

create or replace function public.game_snapshot_v2() returns jsonb
language sql stable security definer set search_path='' as $$
  select public.game_snapshot() || jsonb_build_object('rules_version',2,'scores',
    coalesce((select jsonb_agg(to_jsonb(s) order by s.tempo,s.assists) from public.game_scores s),'[]'::jsonb))
$$;

create or replace function public.game_apply_v2(operation_id uuid, actor_id uuid, operation_kind text, operation_payload jsonb, rules integer, client_schema integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  s public.game_state; prior public.game_operations; result jsonb;
  tempo_value text; assist_value integer; item jsonb; offset_value integer;
  idx integer := 0; travel integer; normal_window integer;
  hits integer := 0; precise integer := 0; combo integer := 0; best_combo integer := 0;
  points integer := 0; base integer; xp integer; rescued boolean := false; medal text;
begin
  if auth.uid() is null or actor_id is distinct from auth.uid() or not public.is_family_member() then raise exception 'Kein Spielzugriff' using errcode='42501'; end if;
  if operation_id is null or operation_kind is null or operation_payload is null or rules is null or client_schema is null then raise exception 'Unvollständiger Spielvorgang' using errcode='22023'; end if;
  select * into s from public.game_state where id for update;
  if not found then raise exception 'Spielstand fehlt. Keine automatische Neuanlage.'; end if;
  select * into prior from public.game_operations o where o.id=operation_id;
  if found then
    if prior.actor_id is distinct from actor_id or prior.kind is distinct from operation_kind or prior.payload is distinct from operation_payload or prior.rules_version is distinct from rules or prior.client_schema is distinct from client_schema then raise exception 'Vorgangs-ID wurde bereits anders verwendet' using errcode='22023'; end if;
    return prior.result;
  end if;
  if s.schema_version<>1 or client_schema<>1 or rules<>2 then raise exception 'Bitte die App aktualisieren. Unbekannte Spielversion.' using errcode='22023'; end if;
  if operation_kind<>'round' or jsonb_typeof(operation_payload)<>'object'
    or not(operation_payload ?& array['game','tempo','assists','offsets'])
    or operation_payload - array['game','tempo','assists','offsets'] <> '{}'::jsonb
    or operation_payload->>'game' is distinct from 'pacifier'
    or jsonb_typeof(operation_payload->'tempo') is distinct from 'string'
    or operation_payload->>'tempo' not in ('steady','alternating')
    or jsonb_typeof(operation_payload->'assists') is distinct from 'number'
    or (operation_payload->>'assists') !~ '^[0-3]$'
    or jsonb_typeof(operation_payload->'offsets') is distinct from 'array'
    then raise exception 'Ungültige Schnullerrunde' using errcode='22023'; end if;
  if jsonb_array_length(operation_payload->'offsets')<>12 then raise exception 'Zwölf Gelegenheiten erforderlich' using errcode='22023'; end if;
  tempo_value := operation_payload->>'tempo'; assist_value := (operation_payload->>'assists')::integer;
  if (assist_value & 1)>0 and not exists(select 1 from public.game_unlocks where skill_id='hands_discovered')
    or (assist_value & 2)>0 and not exists(select 1 from public.game_unlocks where skill_id='targeted_grasp')
    then raise exception 'Hilfe noch nicht freigeschaltet' using errcode='22023'; end if;
  normal_window := case when (assist_value & 1)>0 then 375 else 250 end;
  for item in select value from jsonb_array_elements(operation_payload->'offsets') loop
    travel := case when tempo_value='steady' then 2200 when idx%2=0 then 2400 else 1600 end;
    offset_value := null;
    if item <> 'null'::jsonb then
      if jsonb_typeof(item)<>'number' or item::text !~ '^-?[0-9]{1,4}$' then raise exception 'Ungültige Timingabweichung' using errcode='22023'; end if;
      offset_value := item::text::integer;
      if abs(offset_value)>travel/2 then raise exception 'Timingabweichung außerhalb der Gelegenheit' using errcode='22023'; end if;
    end if;
    base := 0;
    if abs(offset_value)<=90 then base := 200; precise := precise+1;
    elsif abs(offset_value)<=normal_window then base := 100;
    elsif (assist_value & 2)>0 and not rescued then base := 100; rescued := true;
    end if;
    if base>0 then
      points := points + (base * case when combo>=6 then 2 when combo>=3 then 1.5 else 1 end)::integer;
      hits := hits+1; combo := combo+1; best_combo := greatest(best_combo,combo);
    else combo := 0;
    end if;
    idx := idx+1;
  end loop;
  xp := 10 + (hits+precise)*5/24;
  medal := case when hits>=11 and precise>=8 then 'Gold' when hits>=10 and precise>=4 then 'Silber' when hits>=8 then 'Bronze' else null end;
  update public.game_state set xp_total=xp_total+xp,xp_balance=xp_balance+xp,revision=revision+1,updated_at=now() where id;
  insert into public.game_scores(rules_version,tempo,assists,rounds,best_score) values(2,tempo_value,assist_value,1,points)
    on conflict(state_id,rules_version,tempo,assists) do update set rounds=public.game_scores.rounds+1,best_score=greatest(public.game_scores.best_score,excluded.best_score);
  result := jsonb_build_object('status','saved','xp',xp,'score',points,'hits',hits,'perfect',precise,'bestCombo',best_combo,'medal',medal);
  insert into public.game_operations(id,actor_id,kind,rules_version,client_schema,payload,result) values(operation_id,actor_id,operation_kind,rules,client_schema,operation_payload,result);
  return result;
end $$;
revoke all on function public.game_snapshot_v2() from public,anon,authenticated;
revoke all on function public.game_apply_v2(uuid,uuid,text,jsonb,integer,integer) from public,anon,authenticated;
grant execute on function public.game_snapshot_v2() to authenticated;
grant execute on function public.game_apply_v2(uuid,uuid,text,jsonb,integer,integer) to authenticated;
notify pgrst,'reload schema';
