-- Study timestamps must come from the database, not a browser-supplied completion time.
begin;
revoke insert on public.lesson_completions from authenticated;
grant insert(user_id,lesson_id) on public.lesson_completions to authenticated;

create or replace function public.get_account_activity()
returns jsonb language sql stable security invoker set search_path='' as $$
  with events as (
    select completed_at as event_at from public.lesson_completions
    where user_id=(select auth.uid()) and completed_at<=now()
  ), days as (
    select distinct (event_at at time zone 'Europe/London')::date as study_day from events
  ), runs as (
    select study_day,study_day-(row_number() over(order by study_day))::integer as run_id from days
  ), current_run as (
    select max(study_day) as last_day,count(*) as day_count from runs
    where run_id=(select run_id from runs order by study_day desc limit 1)
  )
  select jsonb_build_object(
    'serverNow',now(),
    'lastActivity',(select max(event_at) from events),
    'expiresAt',(last_day+2)::timestamp at time zone 'Europe/London',
    'streak',case when last_day>=(now() at time zone 'Europe/London')::date-1
      then day_count::integer else 0 end,
    'questionAttempts',(select count(*) from public.question_attempts where user_id=(select auth.uid())),
    'questionCorrect',(select count(*) from public.question_attempts where user_id=(select auth.uid()) and correct),
    'checkpointAttempts',(select count(*) from public.checkpoint_attempts where user_id=(select auth.uid()))
  ) from current_run;
$$;
revoke all on function public.get_account_activity() from public,anon,authenticated;
grant execute on function public.get_account_activity() to authenticated;
commit;
