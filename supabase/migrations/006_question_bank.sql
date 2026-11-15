-- Question metadata is public; gated content and all answer keys stay private.
begin;
create table if not exists public.practice_questions (
  id text primary key check (id ~ '^PFQ-[0-9]{4,6}$'),
  module_id uuid not null references public.study_modules(id) on delete cascade,
  title text not null check (length(title) between 1 and 160),
  difficulty text not null check (difficulty in ('Easy','Medium','Hard','Very hard')),
  syllabus_refs text[] not null check (cardinality(syllabus_refs)>0),
  content_version integer not null check (content_version>0),
  published boolean not null default false
);
alter table public.practice_questions enable row level security;
revoke all on public.practice_questions from public,anon,authenticated;
grant select on public.practice_questions to anon,authenticated;
drop policy if exists "Published practice metadata" on public.practice_questions;
create policy "Published practice metadata" on public.practice_questions for select to anon,authenticated
using (published and exists(select 1 from public.study_modules m where m.id=module_id and m.published));

create table if not exists public.practice_question_lessons (
  question_id text not null references public.practice_questions(id) on delete cascade,
  lesson_id text not null references public.study_lessons(id) on delete cascade,
  primary key(question_id,lesson_id)
);
alter table public.practice_question_lessons enable row level security;
revoke all on public.practice_question_lessons from public,anon,authenticated;
grant select on public.practice_question_lessons to anon,authenticated;
drop policy if exists "Published question prerequisites" on public.practice_question_lessons;
create policy "Published question prerequisites" on public.practice_question_lessons for select to anon,authenticated
using (exists(select 1 from public.practice_questions q where q.id=question_id));

create table if not exists apm_private.practice_question_content (
  question_id text primary key references public.practice_questions(id) on delete cascade,
  content_version integer not null check(content_version>0),
  stem text not null check(length(stem)>0),
  choices jsonb not null check(jsonb_typeof(choices)='array' and jsonb_array_length(choices)=4),
  correct_option_id text not null,
  explanation text not null check(length(explanation)>0)
);
alter table apm_private.practice_question_content enable row level security;
revoke all on apm_private.practice_question_content from public,anon,authenticated;

create table if not exists public.question_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.practice_questions(id) on delete cascade,
  content_version integer not null,
  selected_option_id text not null,
  correct boolean not null,
  feedback jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists question_attempts_owner_question_idx on public.question_attempts(user_id,question_id,created_at desc,id desc);
alter table public.question_attempts enable row level security;
revoke all on public.question_attempts from public,anon,authenticated;
grant select on public.question_attempts to authenticated;
drop policy if exists "Learners read own question attempts" on public.question_attempts;
create policy "Learners read own question attempts" on public.question_attempts for select to authenticated
using ((select auth.uid())=user_id);

-- Every entry point rechecks publication and every required lesson, including on retries.
create or replace function apm_private.can_practise(p_question_id text)
returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null
    and exists(select 1 from public.practice_questions q join public.study_modules m on m.id=q.module_id
      where q.id=p_question_id and q.published and m.published)
    and exists(select 1 from public.practice_question_lessons r where r.question_id=p_question_id)
    and not exists(
      select 1 from public.practice_question_lessons r
      left join public.study_lessons l on l.id=r.lesson_id
      left join public.study_modules m on m.id=l.module_id
      where r.question_id=p_question_id and
      (l.id is null or not l.published or not m.published or not exists(
        select 1 from public.lesson_completions c where c.lesson_id=r.lesson_id and c.user_id=(select auth.uid())
      ))
    );
$$;
revoke all on function apm_private.can_practise(text) from public,anon,authenticated;

-- One JSON result avoids the API row limit truncating a future 1,000+ metadata catalogue.
create or replace function public.get_question_catalogue()
returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'title',q.title,'topic',m.title,'guide_section',m.guide_section,'module_slug',m.slug,
    'difficulty',q.difficulty,'syllabus_refs',q.syllabus_refs,'content_version',q.content_version,
    'required_lessons',(select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'title',lm.title,'slug',lm.slug) order by lm.guide_section),'[]'::jsonb)
      from public.practice_question_lessons r join public.study_lessons l on l.id=r.lesson_id
      join public.study_modules lm on lm.id=l.module_id where r.question_id=q.id),
    'status',case when not apm_private.can_practise(q.id) then 'Locked'
      when exists(select 1 from public.question_attempts a where a.question_id=q.id and a.user_id=(select auth.uid()) and a.content_version=q.content_version and a.correct) then 'Solved'
      when exists(select 1 from public.question_attempts a where a.question_id=q.id and a.user_id=(select auth.uid()) and a.content_version=q.content_version) then 'Attempted'
      else 'Ready' end
  ) order by m.guide_section,q.id),'[]'::jsonb)
  from public.practice_questions q join public.study_modules m on m.id=q.module_id
  where q.published and m.published and not exists(
    select 1 from public.practice_question_lessons r join public.study_lessons l on l.id=r.lesson_id
    join public.study_modules lm on lm.id=l.module_id
    where r.question_id=q.id and (not l.published or not lm.published)
  );
$$;
revoke all on function public.get_question_catalogue() from public,anon,authenticated;
grant execute on function public.get_question_catalogue() to anon,authenticated;

create or replace function public.get_practice_question(p_question_id text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
  if not apm_private.can_practise(p_question_id) then raise exception 'Question locked'; end if;
  select jsonb_build_object('id',q.question_id,'version',q.content_version,'stem',q.stem,'choices',q.choices)
    into result from apm_private.practice_question_content q join public.practice_questions m on m.id=q.question_id
    where q.question_id=p_question_id and q.content_version=m.content_version;
  if result is null then raise exception 'Question unavailable'; end if;
  return result;
end;
$$;
revoke all on function public.get_practice_question(text) from public,anon,authenticated;
grant execute on function public.get_practice_question(text) to authenticated;

create or replace function public.submit_practice_question(p_question_id text,p_version integer,p_attempt_id uuid,p_option_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  actor uuid := auth.uid();
  question apm_private.practice_question_content%rowtype;
  previous public.question_attempts%rowtype;
  result jsonb;
begin
  if not apm_private.can_practise(p_question_id) or p_attempt_id is null then raise exception 'Question locked'; end if;
  select * into previous from public.question_attempts where id=p_attempt_id;
  if found then
    if previous.user_id<>actor or previous.question_id<>p_question_id then raise exception 'Invalid attempt'; end if;
    return previous.feedback;
  end if;
  select c.* into question from apm_private.practice_question_content c join public.practice_questions q on q.id=c.question_id
    where c.question_id=p_question_id and c.content_version=q.content_version and q.content_version=p_version;
  if not found then raise exception 'Question updated; reload'; end if;
  if p_option_id is null or length(p_option_id)>40 or not exists(
    select 1 from jsonb_array_elements(question.choices) c where c->>'id'=p_option_id
  ) then raise exception 'Invalid choice'; end if;
  result:=jsonb_build_object('correct',p_option_id=question.correct_option_id,'selectedOptionId',p_option_id,
    'correctOptionId',question.correct_option_id,'explanation',question.explanation);
  insert into public.question_attempts(id,user_id,question_id,content_version,selected_option_id,correct,feedback)
    values(p_attempt_id,actor,p_question_id,p_version,p_option_id,p_option_id=question.correct_option_id,result)
    on conflict(id) do nothing;
  select * into previous from public.question_attempts where id=p_attempt_id;
  if previous.user_id<>actor or previous.question_id<>p_question_id then raise exception 'Invalid attempt'; end if;
  return previous.feedback;
end;
$$;
revoke all on function public.submit_practice_question(text,integer,uuid,text) from public,anon,authenticated;
grant execute on function public.submit_practice_question(text,integer,uuid,text) to authenticated;
commit;
