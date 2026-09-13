alter table public.feedings add column mood_after text;
alter table public.feedings add constraint feeding_mood_after check (
 mood_after is null or (kind in ('breast', 'bottle', 'diaper') and mood_after in ('fussy', 'sleepy', 'calm', 'alert'))
);
grant insert (mood_after), update (mood_after) on public.feedings to authenticated;
