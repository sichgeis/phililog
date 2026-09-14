alter table public.feedings drop constraint feeding_mood_after;
alter table public.feedings add constraint feeding_mood_after check (
 mood_after is null or (kind in ('breast', 'bottle', 'diaper') and mood_after in ('fussy', 'sleepy', 'calm', 'alert', 'angry', 'asleep'))
);
