-- Only SQL-editor/administrative access can manage the two family memberships.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  person text not null unique check (person in ('Julia', 'Christian'))
);
revoke all on private.members from public, anon, authenticated;

create function public.is_family_member() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from private.members where user_id = (select auth.uid())); $$;
revoke all on function public.is_family_member() from public, anon;
grant execute on function public.is_family_member() to authenticated;

create table public.feedings (
  id uuid primary key,
  kind text not null check (kind in ('bottle', 'breast')),
  occurred_at timestamptz not null check (isfinite(occurred_at)),
  started_at timestamptz check (isfinite(started_at) and started_at <= occurred_at),
  duration_minutes integer check (duration_minutes > 0),
  amount_ml integer,
  side text check (side in ('left', 'right', 'both')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint feeding_details check (
    (kind = 'bottle' and amount_ml is not null and amount_ml > 0 and amount_ml % 5 = 0 and side is null and started_at is null)
    or (kind = 'breast' and amount_ml is null)
  )
);
create index feedings_chronology on public.feedings (occurred_at desc, id desc);
alter table public.feedings enable row level security;
revoke all on public.feedings from public, anon, authenticated;
grant select, delete on public.feedings to authenticated;
grant insert (id, kind, occurred_at, started_at, duration_minutes, amount_ml, side, created_by) on public.feedings to authenticated;
grant update (kind, occurred_at, started_at, duration_minutes, amount_ml, side) on public.feedings to authenticated;
create policy family_read on public.feedings for select to authenticated using ((select public.is_family_member()));
create policy family_create on public.feedings for insert to authenticated with check ((select public.is_family_member()) and created_by = (select auth.uid()));
create policy family_update on public.feedings for update to authenticated using ((select public.is_family_member())) with check ((select public.is_family_member()));
create policy family_delete on public.feedings for delete to authenticated using ((select public.is_family_member()));

create function private.stamp_feeding() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.id := old.id;
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  new.version := old.version + 1;
  return new;
end;
$$;
create trigger stamp_feeding before update on public.feedings for each row execute function private.stamp_feeding();
