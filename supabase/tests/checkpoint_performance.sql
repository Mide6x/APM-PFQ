-- Disposable database only, after 005 and the v2 seed. Fixtures roll back.
begin;
insert into auth.users(id) values('70000000-0000-0000-0000-000000000001'),('70000000-0000-0000-0000-000000000002');
insert into public.checkpoint_attempts(id,user_id,lesson_id,content_version,answers,score,total,feedback,created_at) values
('71000000-0000-4000-8000-000000000001','70000000-0000-0000-0000-000000000001','project-environment',1,'{}',3,3,'[]','2026-11-01'),
('71000000-0000-4000-8000-000000000002','70000000-0000-0000-0000-000000000001','project-environment',2,'{}',5,5,'[]','2026-11-02'),
('71000000-0000-4000-8000-000000000003','70000000-0000-0000-0000-000000000001','project-environment',2,'{}',2,5,'[]','2026-11-03'),
('71000000-0000-4000-8000-000000000004','70000000-0000-0000-0000-000000000001','business-case',2,'{}',0,5,'[]','2026-11-03'),
('71000000-0000-4000-8000-000000000005','70000000-0000-0000-0000-000000000002','project-environment',2,'{}',4,5,'[]','2026-11-04');
set local role authenticated;
select set_config('request.jwt.claim.sub','70000000-0000-0000-0000-000000000001',true);
do $$ begin
  assert (select count(*)=3 from public.get_checkpoint_performance()), 'One row per owned lesson/version';
  assert (select score=2 and total=5 and attempt_count=3 from public.get_checkpoint_performance() where lesson_id='project-environment' and content_version=2), 'Latest, not best, with all retries counted';
  assert (select score=3 and total=3 from public.get_checkpoint_performance() where lesson_id='project-environment' and content_version=1), 'Earlier result retains its version and denominator';
  assert (select score=0 from public.get_checkpoint_performance() where lesson_id='business-case'), 'Zero is a real result';
end $$;
select set_config('request.jwt.claim.sub','70000000-0000-0000-0000-000000000002',true);
do $$ begin
  assert (select count(*)=1 from public.get_checkpoint_performance()), 'Second learner sees only own summary';
  assert (select score=4 and attempt_count=1 from public.get_checkpoint_performance()), 'No cross-account counts';
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin assert not exists(select from public.get_checkpoint_performance()), 'Missing verified identity returns no summary'; end $$;
set local role anon;
do $$ begin
  begin perform * from public.get_checkpoint_performance(); raise exception 'Guest summary allowed';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: current/earlier versions, latest not best, retry counts, zeros and summary ownership' as result;
