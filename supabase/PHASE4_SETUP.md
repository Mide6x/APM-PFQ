# Phase 4: lessons, completion and checkpoints

The code uses the existing project, catalogue IDs/slugs, auth and cookie-choice controls. No privileged key or connection string belongs in the app.

## Existing hosted project or staging

Review and run these in the project's SQL editor, in order:

1. [`migrations/004_lessons_and_checkpoints.sql`](migrations/004_lessons_and_checkpoints.sql)
2. [`migrations/005_checkpoint_performance.sql`](migrations/005_checkpoint_performance.sql)
3. [`seed_phase4.sql`](seed_phase4.sql)

All are repeatable and were applied twice in disposable PostgreSQL. The seed joins the existing catalogue by guide section and does not update its IDs, slugs, text or publication choices. Lesson publication choices are preserved on rerun. For a fresh database, apply `schema.sql`, migrations 002 and 003, then the three files above.

The hosted public API was verified after the user's SQL update on 2026-11-14: all 15 expected lessons use version 2, and the summary function exists and denies anonymous access. All 15 guest checkpoints correctly graded five questions each (75 total) without saving attempts. Anonymous reads of completions/attempts are denied and the private answer schema is inaccessible. No new credential or hosted setup is currently required. These public-key checks cannot inspect every hosted policy or verify real signed-in account isolation; those checks remain below.

Version 2 expands each checkpoint from three to five questions. The seed updates grading content and metadata without deleting saved attempts, their original feedback snapshots, completions or catalogue edits. Earlier three-question results are labelled separately and excluded from current-set percentages/coverage. Re-running the seed preserves publication choices. Verify the scripts in staging before applying to the hosted project.

## Content and grading

- `content/lessons.json` contains 15 original lessons in guide order. `content/COVERAGE.md` separates guide references, the 59 syllabus outcomes and gaps in checkpoint practice.
- `content/checkpoints.json` is a server-only authoring source for 75 checkpoint questions. It is never sent wholesale to the browser. Stems and four stable choices are projected before submission; keys/explanations are returned only after a complete valid submission.
- Run `node scripts/generate-phase4-seed.mjs` after authoring changes. It validates guide order, reference mappings, duplicate IDs/stems, choices and explanations, then generates SQL and the coverage report. Run with `--check` to verify checked-in outputs match.
- Increment lesson/question content versions together before changing question IDs, option meaning or grading. Attempts retain a result/feedback snapshot. Old attempts are not regraded.
- `apm_private.checkpoint_questions` has no anonymous/authenticated table or schema privileges. Only `public.submit_lesson_checkpoint` can grade against it. Its fixed search path and explicit publication/ownership checks protect the privileged operation.
- `checkpoint_attempts` permits learners to read their own results, but no direct score inserts/updates/deletes. The grading function derives the owner from the authenticated database context. Repeated attempt IDs return the original result; another owner cannot reuse them.
- Guests may practise, including with sign-in cookies declined, without an attempt record. Signed-in submissions are saved. Completion is explicit and independent of quiz score; checkpoints do not gate the later question bank.

## Persistence and access checks

Run [`tests/lessons_and_checkpoints.sql`](tests/lessons_and_checkpoints.sql) only in a disposable local/staging database. It rolls back its two-learner fixtures and checks grading, immutable repeated attempts, score-forgery denial, answer-key privacy, ownership, guest behaviour, publication and account-deletion cascades.

On the real deployment, sign in with two separate learner accounts:

1. Mark Stop 1 complete twice; confirm one completion record and the same completion after reload.
2. Check the roadmap shows Stop 1 completed in green and Stop 2 as the yellow next incomplete stop. Search must retain original stop numbers.
3. Take a checkpoint, refresh, and check the latest saved score. Retry to create a separate attempt; a low score must not undo completion.
4. Sign in with the same email in another browser/device and confirm completion/latest result restore.
5. Check the second account sees only its own completion and attempts, including direct database API reads/writes.
6. On the roadmap, check the latest current-set result, all-version attempt count and overall percentage. Retry with a lower score: the summary must use the latest result, while coverage stays unchanged. An unattempted stop must show a dash, not 0%. Earlier three-question results must remain labelled separately.
7. Decline sign-in cookies: private state must disappear, public lessons and guest practice remain usable, and previous stored progress must not be deleted.

No new app environment variable is required. The `/questions` bank, imports for that bank and timed mocks are later phases.

Run `tests/checkpoint_performance.sql` in a disposable database after 005 and the seed. It checks latest-not-best selection, current/earlier versions, retry counts, zero scores and two-account isolation. The aggregate RPC uses caller privileges and existing RLS, is unavailable to anonymous users, and returns no answers or feedback. No extra cookies or analytics are introduced.
