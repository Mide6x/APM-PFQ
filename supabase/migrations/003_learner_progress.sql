-- Apply after schema.sql and 002_study_roadmap.sql. Safe to rerun.
begin;

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  module_id uuid not null references public.study_modules(id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;
revoke all on public.learner_progress from anon, authenticated;
grant select, insert, update on public.learner_progress to authenticated;

drop policy if exists "Learners read their own place" on public.learner_progress;
create policy "Learners read their own place" on public.learner_progress
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Learners save their own place" on public.learner_progress;
create policy "Learners save their own place" on public.learner_progress
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.study_modules where id = module_id and published)
  );

drop policy if exists "Learners update their own place" on public.learner_progress;
create policy "Learners update their own place" on public.learner_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.study_modules where id = module_id and published)
  );

commit;
