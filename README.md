# APM PFQ Study Hub

A responsive Next.js App Router starter for the APM Project Fundamentals Qualification. The study library is read from Supabase on the server; no separate backend is needed. The dashboard does not claim to track learner progress—progress and accounts are not implemented yet.

## Run locally

1. Install Node.js 20.9 or later.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon/publishable key. `.env.local` is ignored by git.
4. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the read-only public catalogue and inserts five starter modules.
5. Add or update records in `public.study_modules` and set `published = true` to publish them.
6. Start the app with `npm run dev`.

The app can also run without Supabase configured: the dashboard shows a setup state rather than invented modules. Query errors and an empty published catalogue have their own states.

## Environment

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Only the public anon/publishable key is used. Supabase access is isolated in `lib/supabase.ts` and marked server-only. Row-level security lets visitors read published modules but not unpublished rows. Never put a service-role key in `.env.local` for this app or commit credentials.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
