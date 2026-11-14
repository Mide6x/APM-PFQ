-- Disposable local/staging only, after 004 and seed_phase4.sql. No real learner data.
begin;
insert into auth.users(id) values('40000000-0000-0000-0000-000000000001'),('40000000-0000-0000-0000-000000000002');
do $$ begin
  assert (select count(*)=15 from public.study_lessons), 'Need all 15 published lessons';
  assert (select count(*)=45 from apm_private.checkpoint_questions), 'Need 45 original questions';
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000001',true);
insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'project-environment') on conflict(user_id,lesson_id) do nothing;
insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'project-environment') on conflict(user_id,lesson_id) do nothing;
do $$
declare result jsonb;
begin
  assert (select count(*)=1 from public.lesson_completions), 'Repeated completion must be idempotent';
  result:=public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000001','{"project-environment-01":"b","project-environment-02":"d","project-environment-03":"a"}');
  assert result->>'score'='3' and result->>'total'='3' and result->>'saved'='true', 'Trusted grading must save correct score';
  result:=public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000001','{"project-environment-01":"a","project-environment-02":"a","project-environment-03":"b"}');
  assert result->>'score'='3', 'Duplicate submission must not replace original result';
  result:=public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000002','{"project-environment-01":"a","project-environment-02":"a","project-environment-03":"b"}');
  assert result->>'score'='0', 'A fresh attempt must grade its own choices';
  assert (select count(*)=2 from public.checkpoint_attempts), 'Attempts must retain history';
  assert (select count(*)=1 from public.lesson_completions), 'Checkpoint scores cannot change completion';
  begin
    insert into public.checkpoint_attempts(id,user_id,lesson_id,content_version,answers,score,total,feedback)
    values('50000000-0000-4000-8000-000000000099',auth.uid(),'project-environment',1,'{}',3,3,'[]');
    raise exception 'Forged score write was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform * from apm_private.checkpoint_questions;
    raise exception 'Private answer keys were readable';
  exception when insufficient_privilege then null; end;
  begin
    update public.checkpoint_attempts set score=3;
    raise exception 'Stored score update was allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000002',true);
do $$ begin
  assert not exists(select from public.lesson_completions), 'Second learner sees another completion';
  assert not exists(select from public.checkpoint_attempts), 'Second learner sees another attempt';
  begin
    insert into public.lesson_completions(user_id,lesson_id) values('40000000-0000-0000-0000-000000000001','business-case');
    raise exception 'Completion owner spoof was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000001','{}');
    raise exception 'Other learner reused an owned attempt';
  exception when raise_exception then
    if sqlerrm<>'Invalid attempt' then raise; end if;
  end;
  begin
    perform public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000003','{"project-environment-01":"z","project-environment-02":"d","project-environment-03":"a"}');
    raise exception 'Invalid option was allowed';
  exception when raise_exception then if sqlerrm<>'Invalid choice' then raise; end if; end;
  begin
    perform public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000003','{"project-environment-01":"b"}');
    raise exception 'Incomplete answers were allowed';
  exception when raise_exception then if sqlerrm<>'Answer every checkpoint question' then raise; end if; end;
  begin
    perform public.submit_lesson_checkpoint('project-environment',2,'50000000-0000-4000-8000-000000000003','{}');
    raise exception 'Wrong content version was allowed';
  exception when raise_exception then if sqlerrm<>'Checkpoint updated; reload' then raise; end if; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$
declare result jsonb;
begin
  result:=public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000004','{"project-environment-01":"b","project-environment-02":"d","project-environment-03":"a"}');
  assert result->>'score'='3' and result->>'saved'='false', 'Guest grading must not invent a saved attempt';
  begin perform * from public.lesson_completions; raise exception 'Guest completion read'; exception when insufficient_privilege then null; end;
  begin perform * from public.checkpoint_attempts; raise exception 'Guest attempt read'; exception when insufficient_privilege then null; end;
  begin perform * from apm_private.checkpoint_questions; raise exception 'Guest answer read'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin assert (select count(*)=2 from public.checkpoint_attempts where user_id='40000000-0000-0000-0000-000000000001'), 'Guest attempt must not be stored'; end $$;
update public.study_modules set published=false where guide_section='2.1.1';
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000002',true);
do $$ begin
  assert not exists(select from public.study_lessons where id='project-environment'), 'Unpublished module must hide lessons';
  begin
    insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'project-environment');
    raise exception 'Unpublished completion allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_lesson_checkpoint('project-environment',1,'50000000-0000-4000-8000-000000000004','{}');
    raise exception 'Unpublished checkpoint allowed';
  exception when raise_exception then if sqlerrm<>'Checkpoint unavailable' then raise; end if; end;
end $$;
reset role;
delete from auth.users where id='40000000-0000-0000-0000-000000000001';
do $$ begin
  assert not exists(select from public.lesson_completions where user_id='40000000-0000-0000-0000-000000000001'), 'Account deletion must remove completions';
  assert not exists(select from public.checkpoint_attempts where user_id='40000000-0000-0000-0000-000000000001'), 'Account deletion must remove attempts';
end $$;
rollback;
\echo 'PASS: grading, score privacy, ownership, duplicate handling, history, guests, publication and account-delete cascade'
