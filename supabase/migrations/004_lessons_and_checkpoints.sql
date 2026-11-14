-- Apply after 003. Then apply supabase/seed_phase4.sql. Repeatable; no catalogue rows are changed.
begin;
create schema if not exists apm_private;
revoke all on schema apm_private from public, anon, authenticated;

create table if not exists public.study_lessons (
  id text primary key check (length(id) between 1 and 80),
  module_id uuid not null references public.study_modules(id) on delete cascade,
  content_version integer not null check (content_version > 0),
  syllabus_refs text[] not null,
  published boolean not null default false
);
alter table public.study_lessons enable row level security;
revoke all on public.study_lessons from public, anon, authenticated;
grant select on public.study_lessons to anon, authenticated;
drop policy if exists "Published lesson metadata" on public.study_lessons;
create policy "Published lesson metadata" on public.study_lessons for select to anon, authenticated
using (published and exists (select 1 from public.study_modules m where m.id=module_id and m.published));

create table if not exists public.lesson_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references public.study_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id,lesson_id)
);
alter table public.lesson_completions enable row level security;
revoke all on public.lesson_completions from public, anon, authenticated;
grant select, insert on public.lesson_completions to authenticated;
drop policy if exists "Learners read own completions" on public.lesson_completions;
create policy "Learners read own completions" on public.lesson_completions for select to authenticated
using ((select auth.uid())=user_id);
drop policy if exists "Learners complete published lessons" on public.lesson_completions;
create policy "Learners complete published lessons" on public.lesson_completions for insert to authenticated
with check ((select auth.uid())=user_id and exists (select 1 from public.study_lessons l where l.id=lesson_id));

create table if not exists apm_private.checkpoint_questions (
  id text primary key,
  lesson_id text not null references public.study_lessons(id) on delete cascade,
  content_version integer not null check (content_version > 0),
  syllabus_ref text not null,
  stem text not null,
  choices jsonb not null check (jsonb_typeof(choices)='array' and jsonb_array_length(choices)=4),
  correct_option_id text not null,
  explanation text not null check (length(explanation)>0),
  published boolean not null default true
);
alter table apm_private.checkpoint_questions enable row level security;
revoke all on apm_private.checkpoint_questions from public, anon, authenticated;

create table if not exists public.checkpoint_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references public.study_lessons(id) on delete cascade,
  content_version integer not null,
  answers jsonb not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  feedback jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists checkpoint_attempts_owner_lesson_idx
on public.checkpoint_attempts(user_id,lesson_id,created_at desc);
alter table public.checkpoint_attempts enable row level security;
revoke all on public.checkpoint_attempts from public, anon, authenticated;
grant select on public.checkpoint_attempts to authenticated;
drop policy if exists "Learners read own checkpoints" on public.checkpoint_attempts;
create policy "Learners read own checkpoints" on public.checkpoint_attempts for select to authenticated
using ((select auth.uid())=user_id);

-- The caller supplies choices, never a score or correct answer. Guests can practise without a record.
create or replace function public.submit_lesson_checkpoint(
  p_lesson_id text, p_version integer, p_attempt_id uuid, p_answers jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  lesson public.study_lessons%rowtype;
  previous public.checkpoint_attempts%rowtype;
  question apm_private.checkpoint_questions%rowtype;
  selected text;
  expected integer;
  received integer;
  marks integer := 0;
  feedback jsonb := '[]'::jsonb;
begin
  select l.* into lesson from public.study_lessons l join public.study_modules m on m.id=l.module_id
    where l.id=p_lesson_id and l.published and m.published;
  if not found or p_attempt_id is null then raise exception 'Checkpoint unavailable'; end if;
  if actor is not null then
    select * into previous from public.checkpoint_attempts where id=p_attempt_id;
    if found then
      if previous.user_id<>actor or previous.lesson_id<>p_lesson_id then raise exception 'Invalid attempt'; end if;
      return jsonb_build_object('score',previous.score,'total',previous.total,'feedback',previous.feedback,'saved',true);
    end if;
  end if;
  if p_version is distinct from lesson.content_version then raise exception 'Checkpoint updated; reload'; end if;
  if p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>8192 then
    raise exception 'Invalid answers';
  end if;
  select count(*) into expected from apm_private.checkpoint_questions
    where lesson_id=p_lesson_id and content_version=p_version and published;
  select count(*) into received from jsonb_object_keys(p_answers);
  if expected=0 or received<>expected then raise exception 'Answer every checkpoint question'; end if;
  for question in select * from apm_private.checkpoint_questions
    where lesson_id=p_lesson_id and content_version=p_version and published order by id
  loop
    selected := p_answers->>question.id;
    if jsonb_typeof(p_answers->question.id) is distinct from 'string' or not exists (
      select 1 from jsonb_array_elements(question.choices) c where c->>'id'=selected
    ) then raise exception 'Invalid choice'; end if;
    if selected=question.correct_option_id then marks:=marks+1; end if;
    feedback:=feedback || jsonb_build_array(jsonb_build_object(
      'questionId',question.id,'stem',question.stem,'choices',question.choices,
      'selectedOptionId',selected,'correctOptionId',question.correct_option_id,'explanation',question.explanation
    ));
  end loop;
  if actor is not null then
    insert into public.checkpoint_attempts(id,user_id,lesson_id,content_version,answers,score,total,feedback)
      values(p_attempt_id,actor,p_lesson_id,p_version,p_answers,marks,expected,feedback)
      on conflict(id) do nothing;
    -- A concurrent duplicate returns the original result; it cannot replace answers or cross ownership.
    select * into previous from public.checkpoint_attempts where id=p_attempt_id;
    if previous.user_id<>actor or previous.lesson_id<>p_lesson_id then raise exception 'Invalid attempt'; end if;
    return jsonb_build_object('score',previous.score,'total',previous.total,'feedback',previous.feedback,'saved',true);
  end if;
  return jsonb_build_object('score',marks,'total',expected,'feedback',feedback,'saved',false);
end;
$$;
revoke all on function public.submit_lesson_checkpoint(text,integer,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_lesson_checkpoint(text,integer,uuid,jsonb) to anon,authenticated;
commit;
