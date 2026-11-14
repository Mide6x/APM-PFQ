-- Disposable local/staging database only, with schema + migrations 002 and 003 applied.
-- Tests two learner identities through Postgres roles, not the email delivery service.
begin;
insert into auth.users (id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');
insert into public.study_modules (id,slug,title,category,summary,published)
values ('20000000-0000-0000-0000-000000000001','private-progress-test','Private test','Test','Private',false);

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
insert into public.learner_progress (user_id,module_id)
select auth.uid(),id from public.study_modules where slug='understanding-projects'
on conflict (user_id) do update set module_id=excluded.module_id;
insert into public.learner_progress (user_id,module_id)
select auth.uid(),id from public.study_modules where slug='project-roles'
on conflict (user_id) do update set module_id=excluded.module_id;
do $$ begin
  assert (select count(*)=1 from public.learner_progress), 'Repeated save must produce one row';
  assert (select m.slug='project-roles' from public.learner_progress p join public.study_modules m on m.id=p.module_id), 'Latest place must survive another read';
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
do $$ begin
  assert not exists(select from public.learner_progress), 'Second learner must not read first learner data';
end $$;
insert into public.learner_progress (user_id,module_id)
select auth.uid(),id from public.study_modules where slug='business-case';
do $$
declare changed integer;
begin
  update public.learner_progress set module_id=(select id from public.study_modules where slug='project-roles')
    where user_id='10000000-0000-0000-0000-000000000001';
  get diagnostics changed=row_count;
  assert changed=0, 'Second learner must not update another learner';
  begin
    update public.learner_progress set user_id='10000000-0000-0000-0000-000000000001';
    raise exception 'Owner spoofing was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.learner_progress set module_id='20000000-0000-0000-0000-000000000001';
    raise exception 'Saving an unpublished module was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
do $$ begin
  assert (select count(*)=1 from public.learner_progress), 'First learner must still see only one own row';
  assert (select m.slug='project-roles' from public.learner_progress p join public.study_modules m on m.id=p.module_id), 'Other learner must not change saved place';
end $$;

set local role anon;
do $$ begin
  begin
    perform * from public.learner_progress;
    raise exception 'Anonymous progress read was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
\echo 'PASS: ownership, repeated save, latest-place read, spoof prevention and guest denial'
