-- Latest result per version, plus all-version attempt counts, without sending answer snapshots.
begin;
create or replace function public.get_checkpoint_performance()
returns table(lesson_id text, content_version integer, score integer, total integer, created_at timestamptz, attempt_count bigint)
language sql stable security invoker set search_path = '' as $$
  select ranked.lesson_id, ranked.content_version, ranked.score, ranked.total, ranked.created_at, ranked.attempt_count
  from (
    select a.lesson_id, a.content_version, a.score, a.total, a.created_at,
      count(*) over (partition by a.lesson_id) as attempt_count,
      row_number() over (partition by a.lesson_id, a.content_version order by a.created_at desc, a.id desc) as position
    from public.checkpoint_attempts a
    where a.user_id = (select auth.uid())
  ) ranked where ranked.position = 1;
$$;
revoke all on function public.get_checkpoint_performance() from public, anon, authenticated;
grant execute on function public.get_checkpoint_performance() to authenticated;
commit;
