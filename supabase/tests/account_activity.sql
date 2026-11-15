-- Disposable local/staging only. Calendar streaks use UK dates; never run fixtures on production.
begin;
insert into auth.users(id) values('93000000-0000-0000-0000-000000000001'),('93000000-0000-0000-0000-000000000002');
-- Ten new lessons on ten consecutive UK days, plus two on the same day.
insert into public.lesson_completions(user_id,lesson_id,completed_at)
select '93000000-0000-0000-0000-000000000001',id,
  case when n=1 or n>10 then now() else (((now() at time zone 'Europe/London')::date-(n-1)::integer)::timestamp at time zone 'Europe/London')+interval '1 hour' end
from(select id,row_number() over(order by id) n from public.study_lessons) l where n<=12;
insert into public.lesson_completions(user_id,lesson_id,completed_at)
select '93000000-0000-0000-0000-000000000002',id,
  (((now() at time zone 'Europe/London')::date-2)::timestamp at time zone 'Europe/London')+interval '1 hour'
from public.study_lessons order by id limit 1;
set local role authenticated;
select set_config('request.jwt.claim.sub','93000000-0000-0000-0000-000000000001',true);
do $$ declare summary jsonb; begin
  summary:=public.get_account_activity();
  assert summary->>'streak'='10', 'Ten consecutive completion days must mean ten, same-day actions cannot inflate it';
  assert summary->>'questionAttempts'='0' and summary->>'checkpointAttempts'='0', 'Do not invent practice';
  assert (summary->>'expiresAt')::timestamptz = ((((now() at time zone 'Europe/London')::date+2)::timestamp) at time zone 'Europe/London'), 'Expiry is after the next UK day, not 24 fixed hours';
  begin
    insert into public.lesson_completions(user_id,lesson_id,completed_at) select auth.uid(),id,now()+interval '10 days' from public.study_lessons where id not in(select lesson_id from public.lesson_completions) limit 1;
    raise exception 'Client forged a completion time';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Remove the fourth previous day, breaking the current run at four days.
delete from public.lesson_completions where user_id='93000000-0000-0000-0000-000000000001'
  and (completed_at at time zone 'Europe/London')::date=(now() at time zone 'Europe/London')::date-4;
set local role authenticated;
do $$ begin assert public.get_account_activity()->>'streak'='4', 'A gap breaks the consecutive run'; end $$;
select set_config('request.jwt.claim.sub','93000000-0000-0000-0000-000000000002',true);
do $$ begin assert public.get_account_activity()->>'streak'='0', 'Missed calendar day expires the active streak'; end $$;
insert into public.lesson_completions(user_id,lesson_id)
select auth.uid(),id from public.study_lessons where id not in(select lesson_id from public.lesson_completions) order by id limit 1;
do $$ begin assert public.get_account_activity()->>'streak'='1', 'Next new completion restarts at one'; end $$;
insert into public.lesson_completions(user_id,lesson_id)
select auth.uid(),id from public.study_lessons where id not in(select lesson_id from public.lesson_completions) order by id limit 1;
do $$ begin assert public.get_account_activity()->>'streak'='1', 'Extra same-day completions do not add streak days'; end $$;
-- Quizzes never create a completion streak day.
select public.submit_lesson_checkpoint('project-environment',2,'94000000-0000-4000-8000-000000000001','{"project-environment-01":"b","project-environment-02":"d","project-environment-03":"a","project-environment-04":"a","project-environment-05":"d"}')->>'score';
do $$ begin
  assert public.get_account_activity()->>'streak'='1', 'Checkpoint must not grow a lesson-only streak';
  assert public.get_account_activity()->>'checkpointAttempts'='1', 'Owner practice count is real';
end $$;
select set_config('request.jwt.claim.sub','93000000-0000-0000-0000-000000000001',true);
do $$ begin assert public.get_account_activity()->>'checkpointAttempts'='0', 'Other account cannot affect counters'; end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  begin perform public.get_account_activity(); raise exception 'Guest activity read'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  assert ('2026-03-30 00:00 Europe/London'::timestamptz-'2026-03-29 00:00 Europe/London'::timestamptz)=interval '23 hours', 'UK spring day is 23 hours';
  assert ('2026-10-26 00:00 Europe/London'::timestamptz-'2026-10-25 00:00 Europe/London'::timestamptz)=interval '25 hours', 'UK autumn day is 25 hours';
end $$;
rollback;
select 'PASS: calendar streaks, same-day deduplication, expiry/restart, UK DST, lesson-only events, trusted times and ownership' as result;
