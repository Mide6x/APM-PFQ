# APM PFQ Study Hub

A Next.js App Router study companion for the APM Project Fundamentals Qualification. The guide-ordered roadmap, magic-link sign-in and private saved place use Supabase; no separate backend is needed. Lesson content, completion, quizzes and the Questions bank are later phases.

## Run locally

1. Install Node.js 20.9 or later.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon/publishable key. `.env.local` is ignored by git.
4. Review [`supabase/schema.sql`](supabase/schema.sql) and [`002_study_roadmap.sql`](supabase/migrations/002_study_roadmap.sql) against the target database and verify them locally or in staging before applying them in the Supabase SQL editor, in that order. The schema creates the read-only catalogue; the migration upgrades it to 15 guide-ordered topics. For an existing starter database, apply only the migration. Both scripts are repeatable.
5. Add or update records in `public.study_modules` and set `published = true` to publish them.
6. Start the app with `npm run dev`.

Development output lives in `.next-dev`; `npm run build` and `npm start` use `.next`. A production build can run without replacing the dev server's Webpack chunks. `npm run dev` binds only to the local machine on port 3000 so it is not exposed on the LAN and a duplicate default launch cannot silently fall back to another port and share the dev output. Restart a previously running dev server after pulling this configuration change; do not deliberately run multiple dev servers from this checkout.

The app can also run without Supabase configured: the roadmap shows a setup state rather than invented modules. Query errors and an empty published catalogue have their own states.

## Learner flow

Open `/` for the study roadmap, with stable stops 1–15 and guide references. Search filters topics without renumbering them. Open any published stop, move between published topics with Previous stop/Next stop, or use Back to roadmap at the top or bottom to return to that stop. Links such as `/#stop-11` also restore the location from a deep-linked module. Lessons remain placeholders until their content phase.

`/sign-in` sends a one-time magic link. Open it in the same browser that requested it; `/auth/callback` exchanges the PKCE code and verifies the user before returning to the requested page. Signed-in learners can Save my place on a module and Continue studying on the roadmap, including from a second device. `/account` supports verified email-change requests and sign-out on this device. It does not collect a display name.

`/privacy` explains the actual session cookies, providers and data rights. Footer links include Cookie settings and email-based access/correction/deletion requests. Privacy requests prepare an email draft; they are not automatically submitted. See [privacy operations](PRIVACY_OPERATIONS.md) for the manual request-handling process.

Follow [Phase 3 hosted setup](supabase/PHASE3_SETUP.md) before offering production sign-in: apply migration 003, keep link-based email templates and allowed callback URLs, configure production SMTP and enable Turnstile in Supabase. Production sign-in requests are unavailable without the public CAPTCHA site key; local development is loopback-only. The catalogue remains open to guests.

## Environment

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-public-turnstile-site-key
```

Only the public anon/publishable key is used. Supabase access is isolated in `lib/supabase.ts` and marked server-only. Row-level security lets visitors read published modules but not unpublished rows. Never put a service-role key in `.env.local` for this app or commit credentials.

Use the project's publishable key (or legacy `anon` key) as the value of the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable. See the [Supabase API key guide](https://supabase.com/docs/guides/getting-started/api-keys). Database passwords, connection strings and secret/service-role keys do not belong in the app environment. The Turnstile secret belongs in the Supabase dashboard. Restart development and rebuild production after changing public environment variables. Personalised routes use verified sessions and private, no-store responses.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `node --experimental-strip-types --test tests/roadmap.test.mjs` (Node 22.18+; stable numbering, search order, navigation boundaries and legacy targets)
- `node --experimental-strip-types --test tests/next-config.test.mjs` (dev/production output isolation)
- `node --experimental-strip-types --test tests/auth.test.mjs tests/magic-link.test.mjs` (return paths, verified callback success/failure, recent email authentication and cookie boundaries)

For database checks, use a disposable PostgreSQL database with `anon` and `authenticated` roles (Supabase creates these roles automatically):

```sh
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/catalogue.sql
```

The test applies the schema twice inside a rolled-back transaction, checks preserved IDs and edits, and verifies published-only reads and denied public writes for both roles. Never point it at production.

Run `supabase/tests/roadmap.sql` in a separate, empty disposable database using the same `psql` arguments. This test commits fixtures while applying the migration twice. It checks the 15 guide references and pages, preservation of original IDs, URLs, custom text and publication choices, and published-only roadmap reads.

After migration 003, run `supabase/tests/learner_progress.sql` in a disposable local/staging database with Supabase Auth's `auth.users`, `auth.uid()` and roles. It checks two learner identities, repeated saves, ownership spoofing, unpublished modules and guest denial. It does not test actual SMTP delivery or two physical devices; those hosted checks are listed in the setup guide.

Guide section numbers (`2.1.1`–`2.3.4`) and pages describe physical reading order; they are not syllabus reference IDs. The catalogue query orders numbered topics by `guide_section`. Search keeps those numbers and relative order. Existing `understanding-projects`, `the-project-life-cycle` and `risk-and-issue-management` URLs are retained; the broad `planning-for-success` and `working-with-people` URLs redirect to their roadmap groups. Unnumbered custom rows remain stored and accessible at their published detail URLs.

Netlify builds read the public Turnstile site key from `netlify.toml`. Keep the matching secret in Supabase Auth CAPTCHA settings. The widget must allow `apmprep.netlify.app`; see the hosted setup guide for callback URLs and validation.
