# Phase 4: lessons, completion and checkpoints

The code uses the existing project, catalogue IDs/slugs, auth and cookie-choice controls. No privileged key or connection string belongs in the app.

## Existing hosted project or staging

Review and run these in the project's SQL editor, in order:

1. [`migrations/004_lessons_and_checkpoints.sql`](migrations/004_lessons_and_checkpoints.sql)
2. [`seed_phase4.sql`](seed_phase4.sql)

Both are repeatable and were applied twice in disposable PostgreSQL. The seed joins the existing catalogue by guide section and does not update its IDs, slugs, text or publication choices. Lesson publication choices are preserved on rerun. For a fresh database, apply `schema.sql`, migrations 002 and 003, then the two files above.

The hosted public API has already been verified to return all 15 expected version-1 lesson IDs, deny anonymous reads of completions/attempts, block the private answer schema, and correctly grade all 15 guest checkpoints without saving records. Those checks do not inspect all hosted policies or certify live account isolation. Do not blindly rerun scripts over an unexpected schema; inspect it first.

## Content and grading

- `content/lessons.json` contains 15 original lessons in guide order. `content/COVERAGE.md` separates guide references, the 59 syllabus outcomes and gaps in checkpoint practice.
- `content/checkpoints.json` is a server-only authoring source for 45 checkpoint questions. It is never sent wholesale to the browser. Stems and four stable choices are projected before submission; keys/explanations are returned only after a complete valid submission.
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
6. Decline sign-in cookies: private state must disappear, public lessons and guest practice remain usable, and previous stored progress must not be deleted.

No new app environment variable is required. The `/questions` bank, imports for that bank and timed mocks are later phases.
