-- Minimaler Nachweis verwendeter IDs, auch nach Löschung des Ereignisses.
lock table public.feedings in share row exclusive mode;
create table private.feeding_create_receipts (
  id uuid primary key,
  created_by uuid not null
);
revoke all on private.feeding_create_receipts from public, anon, authenticated;
insert into private.feeding_create_receipts select id, created_by from public.feedings;

create function private.record_feeding_create() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.feeding_create_receipts(id, created_by) values (new.id, new.created_by);
  return new;
end;
$$;
revoke all on function private.record_feeding_create() from public, anon, authenticated;
create trigger record_feeding_create after insert on public.feedings
for each row execute function private.record_feeding_create();

create function public.feeding_create_known(entry_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_family_member() and exists (
    select 1 from private.feeding_create_receipts
    where id = entry_id and created_by = (select auth.uid())
  );
$$;
revoke all on function public.feeding_create_known(uuid) from public, anon;
grant execute on function public.feeding_create_known(uuid) to authenticated;
