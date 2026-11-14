-- Disposable database ONLY. This test commits fixtures while exercising the migration.
\ir ../schema.sql
create temporary table original_modules as select * from public.study_modules;
update public.study_modules set title = 'My environment notes', category = 'My category',
  summary = 'My summary', sort_order = 99 where slug = 'understanding-projects';
update public.study_modules set published = false where slug = 'the-project-life-cycle';
insert into public.study_modules (slug, title, category, summary, published)
values ('my-extra-topic', 'My extra topic', 'Custom', 'Keep this row', true);

\ir ../migrations/002_study_roadmap.sql
\ir ../migrations/002_study_roadmap.sql

do $$
begin
  assert (select count(*) = 15 from public.study_modules where guide_section is not null),
    'Exactly 15 canonical topics required';
  assert (select array_agg(guide_section order by guide_section) = array[
    '2.1.1','2.1.2','2.1.3','2.1.4','2.1.5','2.1.6',
    '2.2.1','2.2.2','2.2.3','2.2.4','2.2.5','2.3.1','2.3.2','2.3.3','2.3.4']
    from public.study_modules where guide_section is not null), 'Guide order must match contents';
  assert (select array_agg(guide_page order by guide_section) =
    array[8,12,18,23,27,32,37,40,45,51,56,66,69,77,80]
    from public.study_modules where guide_section is not null), 'Guide pages must match contents';
  assert (select count(*) = 5 from original_modules o join public.study_modules m
    on m.id = o.id and m.slug = o.slug), 'Preserve all starter IDs and URLs';
  assert (select title = 'My environment notes' and category = 'My category'
    and summary = 'My summary' and sort_order = 99 from public.study_modules
    where slug = 'understanding-projects'), 'Preserve user-edited content';
  assert (select not published from public.study_modules where slug = 'the-project-life-cycle'),
    'Preserve publication choices';
  assert (select count(*) = 2 from public.study_modules
    where slug in ('planning-for-success','working-with-people') and guide_section is null),
    'Keep broad legacy rows outside canonical roadmap';
  assert (select title = 'My extra topic' and guide_section is null and published
    from public.study_modules where slug = 'my-extra-topic'), 'Preserve extra catalogue rows';
  assert (select title = 'Project life cycles' and guide_section = '2.1.5'
    from public.study_modules where slug = 'the-project-life-cycle'), 'Upgrade unedited starter text';
end $$;

set role anon;
do $$
begin
  assert (select count(*) = 14 from public.study_modules where guide_section is not null),
    'Public roadmap must respect publication';
  assert not exists (select from public.study_modules where slug = 'the-project-life-cycle'),
    'Unpublished topic must remain private';
end $$;
reset role;
\echo 'PASS: 15 ordered milestones, pages, repeatability, preserved edits/IDs/URLs/publication, RLS'
