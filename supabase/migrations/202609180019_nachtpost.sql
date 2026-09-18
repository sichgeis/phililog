-- Independent adventure checkpoint; legacy baby-game tables/RPCs are untouched.
create table if not exists public.adventure_state (
 id boolean primary key default true check(id),
 revision bigint not null default 0 check(revision>=0),
 payload jsonb,
 updated_at timestamptz not null default now()
);
insert into public.adventure_state(id) values(true) on conflict do nothing;
create table if not exists private.adventure_receipts (
 id uuid primary key,actor_id uuid not null,base_revision bigint not null,payload_hash text not null,result jsonb not null,created_at timestamptz not null default now()
);
alter table public.adventure_state enable row level security;
revoke all on public.adventure_state from public,anon,authenticated;
revoke all on private.adventure_receipts from public,anon,authenticated;
create or replace function public.adventure_load() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not public.is_family_member() then raise exception 'Kein Abenteuerzugriff' using errcode='42501';end if;
 select jsonb_build_object('revision',s.revision,'payload',s.payload) into result from public.adventure_state s where id;
 if result is null then raise exception 'Abenteuerstand fehlt';end if;
 return result;
end $$;
create or replace function public.adventure_save(operation_id uuid,actor_id uuid,base_revision bigint,checkpoint jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.adventure_state;prior private.adventure_receipts;result jsonb;hash text;k text;
begin
 if auth.uid() is null or actor_id is distinct from auth.uid() or not public.is_family_member() then raise exception 'Kein Abenteuerzugriff' using errcode='42501';end if;
 if operation_id is null or base_revision is null or checkpoint is null then raise exception 'Unvollständiger Speicherauftrag' using errcode='22023';end if;
 hash:=encode(sha256(convert_to(checkpoint::text,'UTF8')),'hex');
 select * into s from public.adventure_state where id for update;
 if not found then raise exception 'Abenteuerstand fehlt';end if;
 select * into prior from private.adventure_receipts where id=operation_id;
 if found then
  if prior.actor_id is distinct from actor_id or prior.base_revision is distinct from base_revision or prior.payload_hash is distinct from hash then raise exception 'Speicher-ID bereits anders verwendet' using errcode='22023';end if;
  return prior.result;
 end if;
 if s.revision<>base_revision then return jsonb_build_object('status','conflict','revision',s.revision);end if;
 if jsonb_typeof(checkpoint)<>'object' or octet_length(checkpoint::text)>100000 or checkpoint->'schema' is distinct from '1'::jsonb or (s.payload is not null and s.payload->'schema' is distinct from '1'::jsonb) then raise exception 'Unbekanntes Abenteuerformat' using errcode='22023';end if;
 foreach k in array array['tools','skills','cleared','visited','letters','quests','seals'] loop
  if jsonb_typeof(checkpoint->k) is distinct from 'array' then raise exception 'Ungültige Fortschrittsliste' using errcode='22023';end if;
  if jsonb_array_length(checkpoint->k)>1000 then raise exception 'Fortschrittsliste zu groß' using errcode='22023';end if;
 end loop;
 if jsonb_typeof(checkpoint->'room') is distinct from 'string' or length(checkpoint->>'room')>64 or jsonb_typeof(checkpoint->'sparks') is distinct from 'number' or (checkpoint->>'sparks') !~ '^[0-9]{1,7}$' or jsonb_typeof(checkpoint->'playSeconds') is distinct from 'number' then raise exception 'Ungültiger Abenteuerstand' using errcode='22023';end if;
 update public.adventure_state set payload=checkpoint,revision=revision+1,updated_at=now() where id;
 result:=jsonb_build_object('status','saved','revision',s.revision+1);
 insert into private.adventure_receipts(id,actor_id,base_revision,payload_hash,result) values(operation_id,actor_id,base_revision,hash,result);
 return result;
end $$;
revoke all on function public.adventure_load() from public,anon,authenticated;
revoke all on function public.adventure_save(uuid,uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.adventure_load() to authenticated;
grant execute on function public.adventure_save(uuid,uuid,bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
