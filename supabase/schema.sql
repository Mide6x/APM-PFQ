create table if not exists public.study_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  summary text not null,
  duration_minutes integer not null default 10 check (duration_minutes > 0),
  lesson_count integer not null default 1 check (lesson_count > 0),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_modules enable row level security;

drop policy if exists "Anyone can read published study modules" on public.study_modules;
create policy "Anyone can read published study modules"
  on public.study_modules
  for select
  to anon, authenticated
  using (published = true);

grant select on public.study_modules to anon, authenticated;

create index if not exists study_modules_published_order_idx
  on public.study_modules (sort_order)
  where published = true;

insert into public.study_modules
  (slug, title, category, summary, duration_minutes, lesson_count, sort_order, published)
values
  ('understanding-projects', 'Understanding projects', 'Starting out', 'Explore what makes work a project, how it differs from business as usual, and why clear outcomes matter.', 12, 4, 1, true),
  ('the-project-life-cycle', 'The project life cycle', 'Starting out', 'Follow a project from its first idea through delivery and review, with the key decisions along the way.', 16, 5, 2, true),
  ('planning-for-success', 'Planning for success', 'Planning', 'Bring scope, time, cost and quality together in a plan that gives a team a shared direction.', 18, 5, 3, true),
  ('working-with-people', 'Working with people', 'People & leadership', 'Understand roles, stakeholders and communication—and how good collaboration supports delivery.', 14, 4, 4, true),
  ('risk-and-issue-management', 'Risk and issue management', 'Delivery', 'Learn the difference between a risk and an issue, and how teams identify, assess and respond to both.', 15, 4, 5, true)
on conflict (slug) do nothing;

-- Add or update learning content from the Supabase dashboard or a trusted administrative process.
-- Do not expose a service-role key in the Next.js application.
