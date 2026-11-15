-- DISPOSABLE LOCAL/STAGING DATABASE ONLY, after 006 and seed_phase5.sql. Rolls back test accounts.
begin;
insert into auth.users(id) values('90000000-0000-0000-0000-000000000001'),('90000000-0000-0000-0000-000000000002');
do $$ begin
  assert (select count(*)=30 from public.practice_questions), 'Need 30 starter questions';
  assert (select count(distinct module_id)=15 from public.practice_questions), 'Need every topic';
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare catalogue jsonb; begin
  catalogue:=public.get_question_catalogue();
  assert jsonb_array_length(catalogue)=30, 'Guest can browse every published question';
  assert not exists(select from jsonb_array_elements(catalogue) q where q->>'status'<>'Locked'), 'Guests always locked';
  assert not exists(select from jsonb_array_elements(catalogue) q where q ? 'stem' or q ? 'choices' or q ? 'correctOptionId' or q ? 'explanation'), 'Metadata must omit gated and grading content';
  begin perform public.get_practice_question('PFQ-0001'); raise exception 'Guest stem read'; exception when insufficient_privilege then null; end;
  begin perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000001','b'); raise exception 'Guest submitted'; exception when insufficient_privilege then null; end;
  begin perform * from apm_private.practice_question_content; raise exception 'Guest key read'; exception when insufficient_privilege then null; end;
  begin perform * from public.question_attempts; raise exception 'Guest attempt read'; exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000001',true);
do $$ begin
  begin perform public.get_practice_question('PFQ-0001'); raise exception 'Locked stem read'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
  begin perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000001','b'); raise exception 'Locked answer submitted'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
end $$;
insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'project-environment');
do $$ declare detail jsonb; result jsonb; begin
  assert (select q->>'status'='Ready' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'Completion unlocks primary question';
  assert (select q->>'status'='Locked' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0002'), 'All prerequisites required';
  begin perform public.get_practice_question('PFQ-0002'); raise exception 'Partial completion unlocked'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
  detail:=public.get_practice_question('PFQ-0001');
  assert detail ? 'stem' and jsonb_array_length(detail->'choices')=4 and not detail ? 'correctOptionId' and not detail ? 'explanation', 'Pre-submit projection excludes keys';
  begin perform * from apm_private.practice_question_content; raise exception 'Unlocked learner read key table'; exception when insufficient_privilege then null; end;
  result:=public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000001','a');
  assert result->>'correct'='false' and result->>'correctOptionId'='b' and length(result->>'explanation')>0, 'Trusted feedback after submission';
  assert (select q->>'status'='Attempted' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'Incorrect attempt status';
  result:=public.submit_practice_question('PFQ-0001',99,'91000000-0000-4000-8000-000000000001','b');
  assert result->>'selectedOptionId'='a' and result->>'correct'='false', 'Repeat attempt returns immutable original';
  perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000002','b');
  assert (select q->>'status'='Solved' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'Correct answer solved';
  perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000003','c');
  assert (select q->>'status'='Solved' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'Retry cannot erase solved status';
  assert (select count(*)=3 from public.question_attempts), 'Independent history retained';
  begin perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000099','bad'); raise exception 'Invalid option accepted'; exception when raise_exception then if sqlerrm<>'Invalid choice' then raise; end if; end;
  begin perform public.submit_practice_question('PFQ-0001',99,'91000000-0000-4000-8000-000000000099','b'); raise exception 'Invalid version accepted'; exception when raise_exception then if sqlerrm<>'Question updated; reload' then raise; end if; end;
  begin update public.question_attempts set correct=true; raise exception 'Forged grade accepted'; exception when insufficient_privilege then null; end;
  begin insert into public.question_attempts(id,user_id,question_id,content_version,selected_option_id,correct,feedback) values('91000000-0000-4000-8000-000000000099',auth.uid(),'PFQ-0001',1,'b',true,'{}'); raise exception 'Direct attempt insert'; exception when insufficient_privilege then null; end;
end $$;
insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'business-case');
do $$ begin assert (public.get_practice_question('PFQ-0002')->>'id'='PFQ-0002'), 'Second required lesson unlocks'; end $$;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000002',true);
do $$ begin
  assert not exists(select from public.question_attempts), 'No other learner history';
  assert (select q->>'status'='Locked' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'No other learner completion used';
end $$;
insert into public.lesson_completions(user_id,lesson_id) values(auth.uid(),'project-environment');
do $$ begin
  assert (select q->>'status'='Ready' from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'No other learner solved status';
  begin perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000001','b'); raise exception 'Cross-owner attempt reuse'; exception when raise_exception then if sqlerrm<>'Invalid attempt' then raise; end if; end;
end $$;
reset role;
update public.study_lessons set published=false where id='project-environment';
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000001',true);
do $$ begin
  assert not exists(select from jsonb_array_elements(public.get_question_catalogue()) q where q->>'id'='PFQ-0001'), 'Unpublished prerequisite hides question metadata';
  begin perform public.get_practice_question('PFQ-0001'); raise exception 'Unpublished prerequisite read'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
  begin perform public.submit_practice_question('PFQ-0001',1,'91000000-0000-4000-8000-000000000001','a'); raise exception 'Retry bypassed prerequisite'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
end $$;
reset role;
update public.study_lessons set published=true where id='project-environment';
update public.practice_questions set published=false where id='PFQ-0001';
set local role authenticated;
do $$ begin
  assert not exists(select from public.practice_questions where id='PFQ-0001'), 'Unpublished question hidden by RLS';
  begin perform public.get_practice_question('PFQ-0001'); raise exception 'Unpublished question read'; exception when raise_exception then if sqlerrm<>'Question locked' then raise; end if; end;
end $$;
reset role;
delete from auth.users where id='90000000-0000-0000-0000-000000000001';
do $$ begin assert not exists(select from public.question_attempts where user_id='90000000-0000-0000-0000-000000000001'), 'Deletion removes question history'; end $$;
rollback;
select 'PASS: metadata privacy, prerequisites, grading, replay, history, ownership, publication and deletion' as result;
