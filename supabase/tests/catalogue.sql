-- Run with psql -v ON_ERROR_STOP=1 -f supabase/tests/catalogue.sql
-- Use a disposable database with Supabase's anon/authenticated roles only.
begin;
\ir ../schema.sql

create temporary table original_module as
select id from public.study_modules where slug = 'understanding-projects';
update public.study_modules set title = 'Locally edited title'
where slug = 'understanding-projects';
insert into public.study_modules (slug, title, category, summary)
values ('private-test-module', 'Private test', 'Test', 'Must stay private');

\ir ../schema.sql

do $$
begin
  assert (select count(*) = 6 from public.study_modules), 'Seed must not duplicate rows';
  assert (select id = (select id from original_module) and title = 'Locally edited title'
    from public.study_modules where slug = 'understanding-projects'),
    'Rerunning the seed must preserve IDs and edits';
end $$;

set local role anon;
do $$
begin
  assert (select count(*) = 5 from public.study_modules), 'Guests must see published rows';
  assert not exists (select from public.study_modules where slug = 'private-test-module'),
    'Guests must not see unpublished rows, even by slug';
  assert not has_table_privilege(current_user, 'public.study_modules', 'INSERT,UPDATE,DELETE'),
    'Guests must not write catalogue rows';
end $$;

set local role authenticated;
do $$
begin
  assert (select count(*) = 5 from public.study_modules), 'Learners must see published rows';
  assert not exists (select from public.study_modules where slug = 'private-test-module'),
    'Learners must not see unpublished rows, even by slug';
  assert not has_table_privilege(current_user, 'public.study_modules', 'INSERT,UPDATE,DELETE'),
    'Learners must not write catalogue rows';
end $$;

reset role;
rollback;
\echo 'PASS: published-only reads, no public writes, repeatable seed, preserved IDs and edits'
