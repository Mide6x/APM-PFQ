-- Run after schema.sql for a fresh setup, or against the existing starter catalogue.
-- Review and test locally/staging before hosted application. Safe to rerun.
begin;

alter table public.study_modules
  add column if not exists guide_section text,
  add column if not exists guide_page integer;
create unique index if not exists study_modules_guide_section_idx
  on public.study_modules (guide_section) where guide_section is not null;

-- These numbers refer to the physical guide, not syllabus reference IDs.
with topics (guide_section, guide_page, slug, title, category, summary, sort_order,
  starter_title, starter_category, starter_summary) as (values
  ('2.1.1', 8, 'understanding-projects', 'Project environment', 'Introducing projects', 'Consider the context around a project and the external factors that shape decisions.', 1, 'Understanding projects', 'Starting out', 'Explore what makes work a project, how it differs from business as usual, and why clear outcomes matter.'),
  ('2.1.2', 12, 'project-programme-and-portfolio-management', 'Project, programme and portfolio management', 'Introducing projects', 'Compare how projects, programmes and portfolios organise change.', 2, null, null, null),
  ('2.1.3', 18, 'project-roles', 'Project roles', 'Introducing projects', 'Identify responsibilities and how project roles work together.', 3, null, null, null),
  ('2.1.4', 23, 'business-case', 'Business case', 'Introducing projects', 'Explore the justification for investment and how it supports decisions.', 4, null, null, null),
  ('2.1.5', 27, 'the-project-life-cycle', 'Project life cycles', 'Introducing projects', 'Compare how projects move through stages from concept to closure.', 5, 'The project life cycle', 'Starting out', 'Follow a project from its first idea through delivery and review, with the key decisions along the way.'),
  ('2.1.6', 32, 'project-management-plan', 'Project management plan', 'Introducing projects', 'Bring the approach to delivery together in a shared plan.', 6, null, null, null),
  ('2.2.1', 37, 'stakeholder-engagement', 'Stakeholder engagement', 'Planning for success', 'Understand interests and plan meaningful stakeholder engagement.', 7, null, null, null),
  ('2.2.2', 40, 'communication', 'Communication', 'Planning for success', 'Choose clear messages, channels and feedback for project communication.', 8, null, null, null),
  ('2.2.3', 45, 'risk-and-issue-management', 'Risk and issue management', 'Planning for success', 'Learn the difference between a risk and an issue, and how teams identify, assess and respond to both.', 9, 'Risk and issue management', 'Delivery', 'Learn the difference between a risk and an issue, and how teams identify, assess and respond to both.'),
  ('2.2.4', 51, 'quality-management', 'Quality management', 'Planning for success', 'Define quality expectations and consider how to meet them.', 10, null, null, null),
  ('2.2.5', 56, 'scope-management', 'Scope management', 'Planning for success', 'Define deliverables and manage the boundaries of the project.', 11, null, null, null),
  ('2.3.1', 66, 'estimating', 'Estimating', 'Achieving results', 'Explore estimates and the uncertainty behind forecasts.', 12, null, null, null),
  ('2.3.2', 69, 'resource-scheduling-and-optimisation', 'Resource scheduling and optimisation', 'Achieving results', 'Connect activities, time and available resources in a workable schedule.', 13, null, null, null),
  ('2.3.3', 77, 'information-management-and-reporting', 'Information management and reporting', 'Achieving results', 'Organise project information and report what people need to know.', 14, null, null, null),
  ('2.3.4', 80, 'leadership-and-teamwork', 'Leadership and teamwork', 'Achieving results', 'Explore how leadership and teamwork support project delivery.', 15, null, null, null)
)
insert into public.study_modules as existing
  (guide_section, guide_page, slug, title, category, summary, sort_order, published)
select guide_section, guide_page, slug, title, category, summary, sort_order, true from topics
on conflict (slug) do update set
  guide_section = coalesce(existing.guide_section, excluded.guide_section),
  guide_page = coalesce(existing.guide_page, excluded.guide_page),
  title = case when existing.title = (select starter_title from topics where slug = excluded.slug)
    then excluded.title else existing.title end,
  category = case when existing.category = (select starter_category from topics where slug = excluded.slug)
    then excluded.category else existing.category end,
  summary = case when existing.summary = (select starter_summary from topics where slug = excluded.slug)
    then excluded.summary else existing.summary end;

-- Broad starter rows stay intact for existing URLs; only numbered topics form the roadmap.
commit;
