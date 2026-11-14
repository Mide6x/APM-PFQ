# APM PFQ Study Hub — phased build plan

Build the **APM PFQ Study Hub** in `Mide6x/APM-PFQ` as a study companion for my physical guide. The two main screens are **Roadmap** and **Questions**. Roadmap takes me through the book in order. Questions is a LeetCode-style bank where I can see what is available, what I have solved and what lessons unlock the rest.

**Implement Phase 1 only on the first run.** When I ask for the next phase, confirm the previous phase’s state, complete the requested phase and stop. At each checkpoint report the changed files, the working learner flow, checks run and any setup still required.

## Current checkpoint

This revised plan supersedes the earlier phase definitions. Updating this document does not implement or restart a phase.

- Phase 1 local verification is recorded below. The user has now run the hosted Supabase scripts. The project URL and publishable key remain in ignored `.env.local`, and the live API returns all 15 published canonical topics in guide order. Hosted catalogue setup is no longer pending.
- Revised Phase 2 is working against the hosted catalogue: roadmap-first layout, explicit stops 1–15, per-stop return anchors and previous/next navigation. The subsequent colour correction removes purple in favour of green, yellow and neutral tones.
- Live public checks return no unpublished modules and reject the Auth admin-users endpoint with HTTP 401. These checks do not inspect every hosted policy or prove future learner ownership. No hosted schema/policy/Auth-setting changes have been made by the agent; the user reports enabling RLS. Current SQL/management access remains unavailable, but is not needed for normal catalogue reads.
- Phase 3 is implemented locally with magic-link sign-in (latest user preference), verified private sessions, saved place and account email-change requests. The user has confirmed production Turnstile and magic-link sign-in work. Hosted two-account isolation, two-device progress checks and production email-delivery limits remain to be verified. Phases 4–7 have not started. Historical results below remain as records of earlier checks.

## Build on the current repo

- Read the repo instructions and apply the global `lean-code` skill at `~/.agents/skills/lean-code/SKILL.md`. Keep Next.js App Router, TypeScript, npm and Supabase. Use Next.js for server logic and Supabase for data and auth. Reuse the existing CSS, Lucide icons and reduced-motion support where they fit.
- The inspected `main` already has a searchable catalogue in `app/page.tsx` and `components/module-library.tsx`, module routes in `app/modules/[slug]/page.tsx`, server reads in `lib/supabase.ts`, and five seed rows in `supabase/schema.sql`. Keep useful URLs and the existing setup, empty, error and missing-module states. Replace the generic dashboard and card grid as the roadmap lands.
- Use the photographed guide for topic order and page references. Use the [current APM handbook](https://www.apm.org.uk/media/kcjbezhz/apm-project-fundamentals-qualification-handbook.pdf) for assessable scope and terminology. Keep guide section numbers and syllabus reference IDs distinct. Write original lessons, diagrams, examples and questions.
- Run `npm run lint`, `npm run typecheck` and `npm run build` for each phase. Test the actual browser flow at phone and desktop widths, including keyboard navigation. Add focused checks for ordering, access rules, grading and persistence as they land.

## Colour and UI guide

Use this **APM-inspired palette** as CSS custom properties in `app/globals.css`. The green thread comes from [APM’s brand guide](https://www.apm.org.uk/about-us/apm-brand/). The hex values below are for this app. Refer to the [APM PFQ page](https://www.apm.org.uk/qualifications-and-training/project-management-fundamentals/) for visual context and give the study hub its own identity.

Latest colour correction: the user requested removal of purple after the revised Phase 2 review. Use green for buttons, active navigation, links and focus rings; pale green for supporting panels; yellow for the recommended/current stop. The neutral values below replace the previous purple-tinted neutrals. Historical checkpoint references to purple describe earlier versions only.

| Colour | Hex | Where it goes |
|---|---|---|
| Green | `#246747` | Roadmap connector, primary buttons with white text, active navigation, links, focus rings, completed stops and success text |
| Pale green | `#E8F4EC` | Selected filters, supporting panels, completed-stop and correct-answer backgrounds |
| Yellow | `#F5CF52` | Current-stop marker and flagged mock questions, with dark text |
| Ink | `#1E2923` | Headings and body text |
| Muted ink | `#56625B` | Secondary text and metadata |
| Canvas | `#F7F9F7` | Page background |
| Paper | `#FFFFFF` | Lesson surfaces and question list |
| Border | `#D9E2DC` | Dividers and subtle outlines |

Use labels and icons alongside colour for completion, locks, difficulty and errors. Keep focus rings visible. Use `h1`–`h4` and paragraphs for content, with semantic controls and lists for interaction. Remove eyebrow copy, decorative badges and fake progress. Reserve numbers for useful information such as stop order and question IDs.

## Phase 1 — Verify the starter and configure Supabase

Inspect the checkout and run the existing checks. Smoke-test `/` and an existing module route. Set `NEXT_PUBLIC_SUPABASE_URL=https://cspgvmadmggrdsdesgfl.supabase.co` in ignored `.env.local`. Keep the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable name and use the project’s publishable or legacy anon key as the value. If the key is missing, set the URL and report what is needed to finish the connection. Keep database passwords, privileged keys and connection strings out of Git and the app runtime. Check the schema locally or in staging and confirm that public reads return published modules only. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

## Phase 2 — Build the full scrollable roadmap

Make `/` open directly on **Study roadmap**, with the path visible near the top. On desktop, use a centred reading column with a numbered rail on its left. On mobile, keep the rail and stack a compact, full-width stop beside it. Use a continuous green line and three clearly labelled group breaks. Keep stops **1–15** in one scrollable page. Put a short **Study planning** introduction above Stop 1 and **Self-assessment** after Stop 15.

Each stop shows its number, title, guide reference and a short description. Make the stop title and row affordance clearly clickable. Clicking **1 · Project environment** opens its dedicated module route. Put **Back to roadmap** at the top and bottom of the module and return to the same stop by anchor, including from deep links. Add **Previous stop** and **Next stop** where applicable. Every published lesson is browsable in any order. The roadmap recommends where to go next. Add **Continue studying** once saved progress is available.

Use these groups, stop numbers and printed page references.

| Stop | Guide section | Topic | Page |
|---|---|---|---:|
| | **2.1** | **Introducing projects** | |
| 1 | 2.1.1 | Project environment | 8 |
| 2 | 2.1.2 | Project, programme and portfolio management | 12 |
| 3 | 2.1.3 | Project roles | 18 |
| 4 | 2.1.4 | Business case | 23 |
| 5 | 2.1.5 | Project life cycles | 27 |
| 6 | 2.1.6 | Project management plan | 32 |
| | **2.2** | **Planning for success** | |
| 7 | 2.2.1 | Stakeholder engagement | 37 |
| 8 | 2.2.2 | Communication | 40 |
| 9 | 2.2.3 | Risk and issue management | 45 |
| 10 | 2.2.4 | Quality management | 51 |
| 11 | 2.2.5 | Scope management | 56 |
| | **2.3** | **Achieving results** | |
| 12 | 2.3.1 | Estimating | 66 |
| 13 | 2.3.2 | Resource scheduling and optimisation | 69 |
| 14 | 2.3.3 | Information management and reporting | 77 |
| 15 | 2.3.4 | Leadership and teamwork | 80 |

Use a repeatable migration for both existing seeded databases and fresh setups. Keep IDs and slugs where the old topic maps cleanly. Keep broad starter links such as `/modules/planning-for-success` and `/modules/working-with-people` useful by sending learners to the relevant group or topic. Preserve user-edited catalogue rows. Verify all 15 stops render in order, anchors restore the right location and old links still work.

## Phase 3 — Add magic-link sign-in and synced progress

Latest user instruction replaces email codes with magic links. Use Supabase Auth and its cookie-based integration. Ask for an email, send a single-use link and exchange its PKCE code on the server at `/auth/callback`. Return to a validated local lesson/question destination. Open the email link in the same browser that requested it. Keep published topics open to guests.

Use the verified Supabase user ID to own saved place and future progress. A separate sign-in with the same email on another device restores the same account. No passwords, public usernames, names or device fingerprinting are needed.

Keep link requests neutral, short-lived and rate-limited with a visible resend cooldown. Handle expired, reused and wrong-browser links without exposing provider details. Verify identity server-side, use private/no-store responses, HttpOnly cookies and RLS. Reauthenticate sensitive account changes. Keep links, callback queries, emails and tokens out of application/hosting logs and analytics. Production SMTP and CAPTCHA are still required before public registration; the built-in mail service restricts magic links too. Test two-account isolation, sign-out and two-browser sync. See [hosted setup](supabase/PHASE3_SETUP.md).

## Phase 4 — Make each stop a lesson and checkpoint quiz

Start with **Stop 1 · Project environment**, guide pages 8–9 and syllabus reference **1.6**. Explain why a project manager uses PESTLE, give an original worked example, then provide a short quiz with feedback. Use the same lesson structure for the remaining topics in guide order. Keep a coverage map from every lesson to its syllabus references.

After studying, the learner selects **Mark lesson complete**. A stop is complete once all its required lessons are marked complete. The end-of-stop checkpoint is available from inside that stop and records its own result. It provides practice without making a passing score a requirement for unlocking the bank. Returning to the roadmap shows the completed stop in green and highlights the next incomplete stop with a yellow marker and a text label.

Persist completion and checkpoint attempts in Supabase. Use one completion record per learner per lesson. If a guest marks a lesson complete, ask them to sign in and bring them back to that lesson. Verify completion survives reload, appears on a second signed-in device and behaves consistently if the learner submits twice.

## Phase 5 — Build the LeetCode-style Questions page

Use `/questions` for a compact, searchable list. On desktop show **Status, Question, Topic, Difficulty** and a useful action. On mobile, show the same information in a stacked row. Include a visible count and filters for topic, difficulty and status. Provide four clearly labelled difficulty levels **Easy, Medium, Hard, Very hard**. Use **Locked, Ready, Attempted, Solved** for status. Treat difficulty as a practice label. Keep all 15 topics visible in the topic filter, including topics whose questions are currently locked.

- **Locked** rows show the title, topic, difficulty and the specific lesson needed, with a **Go to lesson** link. A question mapped to more than one required lesson unlocks when all its required lessons are complete. Its stem and choices stay private until then.
- **Unlocked** rows open a question with four options and one correct choice. Submit for feedback, with a concise explanation and why the tempting alternatives are wrong. Allow a retry and preserve the learner’s attempt history.
- A guest can browse the list and see the sign-in or lesson requirement. A signed-in learner who completes a lesson should see its questions unlock on returning to the list, including after a fresh sign-in on another device.

Enforce prerequisites on Next.js server reads **and submissions**, backed by the verified learner’s Supabase progress. Verify that direct URLs and unauthorised Supabase reads cannot reveal locked stems or options, and that pre-submit browser responses omit answer keys and explanations. Start with one end-to-end topic, then expand. Create a repeatable import with stable IDs, lesson requirements, syllabus references, four unique choices, difficulty, explanations and publication state. Validate duplicates, invalid references and missing answers before publishing.

## Phase 6 — Add self-assessment and grow the bank

Use **Self-assessment** on the roadmap to link to `/questions`, review of missed questions and timed exam practice. Build mocks using **60 questions in 60 minutes**, one mark per correct answer, and a **36/60** practice pass line. Enable the full mock once the learner has completed all required lessons and the reviewed inventory supports the handbook’s exam coverage. Save question order, responses, flags and the deadline. Make reload and device changes resume the same attempt. Enforce expiry and grade once on the server. Show answers and topic breakdowns after finalisation. [APM PFQ handbook](https://www.apm.org.uk/media/kcjbezhz/apm-project-fundamentals-qualification-handbook.pdf)

Grow the bank in batches of roughly 50–100 original questions. Review for factual accuracy, syllabus alignment, one defensible answer, plausible distractors and near-duplicates. Track published counts and coverage across all 15 topics, syllabus references and difficulty levels. Finish when at least **1,000 distinct, reviewed questions** are usable through the app and the full mock works.

## Phase 7 — Add cookie choices and engagement analytics

Ship the consent controls before enabling analytics. Show **Accept analytics** and **Reject analytics** with equal visibility, and put **Cookie settings** in the footer so the decision can be changed. Keep optional engagement analytics off until accepted. Make website features, email sign-in and Supabase progress sync work with analytics declined.

Use this as the starting notice and keep it aligned with the actual implementation.

> We use essential cookies to keep you signed in and remember your cookie choice. With your permission, we also use optional analytics to understand how people use the roadmap, lessons and quizzes so we can improve them. You can change your choice in Cookie settings.

Measure a small set of events such as roadmap opens, lesson completions and quiz starts. Keep email, username, Supabase user IDs, answer text and individual scores out of engagement analytics. Use progress records to provide the learner’s requested features and avoid joining them to analytics. Document the actual provider, storage, purpose and retention in the notice. Verify with browser network checks that analytics does not load or send before opt-in, stops on withdrawal and stays off after reload when declined. [ICO guidance on cookies and analytics](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/?search=iss)

# Cookie-controls checkpoint — brought forward at the user's request

The user confirmed live sign-in works, then requested functional cookie choices before lessons. This implements essential-cookie choices only, not Phase 7 analytics. Phase 4 has not started.

## Changed files and working flow

- `app/cookies/{page.tsx,actions.ts}`, `components/cookie-choices.{tsx,module.css}`, `lib/cookie-preferences.ts`, `app/layout.tsx`, `components/site-footer.tsx`: first-visit notice with equally prominent Allow sign-in cookies / Browse without sign-in cookies, dedicated settings, footer entry and 90-day per-browser preference. The choice cookie contains no account identifier.
- `lib/auth/server.ts`, `app/account/actions.ts`: shared device sign-out clears app auth/PKCE/retry cookies even if the provider cannot be reached. Cookie-choice and unrelated cookies stay. Account and progress records are not deleted.
- `app/sign-in/{page.tsx,actions.ts}`, `app/auth/callback/route.ts`, `middleware.ts`: new requests/callbacks require an allow choice. Refusal removes the email form and Turnstile, blocks server auth clients/session refresh, and clears lingering auth cookies. Allowing later enables sign-in but never signs in automatically. The requested module is preserved through settings and sign-in. Previously authenticated sessions without a preference are not automatically destroyed; an explicit browse-without choice signs them out.
- `app/privacy/page.tsx`, `PRIVACY_OPERATIONS.md`, `README.md`: actual preference cookie, retention, withdrawal effects and optional-tracking status. No analytics/marketing provider, identifier or event was added, and allowing essential cookies does not authorise future tracking.
- `tests/cookie-{preferences,access}.test.mjs`, `tests/{magic-link,turnstile}.test.mjs`: preference validation/persistence, sign-out failure recovery, denied request/callback/access/refresh paths and retained unrelated cookies.

## Checks

- `npm run lint`, `npm run typecheck`, `npm run build`, all 22 Node tests and `git diff --check` pass.
- Isolated browser fixture through actual Next.js + Supabase SDK: first-visit notice, decline/reload persistence, no form/CAPTCHA while declined, change to allow, PKCE return to the selected module, save place, decline after sign-in, removed auth cookies, denied account access and retained database progress all pass. No real email was sent.
- Desktop 1280px/phone 390px notice and 320/507/820/1180px settings layouts pass without horizontal overflow and with >=44px choice controls. Tab moves from Allow to Browse without with a visible focus ring; Enter applies the choice. Screenshots reviewed. In the declined fixture browser, local/session storage is empty and resource timing shows no third-party requests.
- Existing user edits to `app/globals.css` were left untouched and are outside this change.

## Remaining/manual checks

No new credential or migration is needed. After deployment, verify withdrawal/re-enabling in the real signed-in browser and refresh. Real iPadOS Safari/Pencil and hosted two-account isolation remain unverified. Choice is per browser/device and retained 90 days; it does not sync to an account. Optional analytics remains unimplemented and must require its own informed choice if added later.

# Netlify scan correction

Netlify blocked the Turnstile deployment because its scanner marked the three public environment values as secrets. Verified the local Supabase runtime key is `sb_publishable_`, not privileged. `netlify.toml` now exempts only `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` by exact name. Scanning remains enabled, with no path exclusions. A focused configuration test guards these boundaries. This resolves a false positive, not a privileged-key leak; deployed delivery and real challenge verification still need checking after rebuild.

# Turnstile integration checkpoint

Continued on 2026-11-14 with the user's existing widget and production hostname `apmprep.netlify.app`. No new widget or secret was created, retrieved or stored in the app. Existing widget clearance settings were not changed.

- Configured the supplied public site key in ignored `.env.local` and `netlify.toml` (the user cleared `.env.example`) so Netlify builds receive it. Added the `login` action to the existing widget. Tokens are passed once through the Next.js action to Supabase Auth; Supabase owns Siteverify and the secret. Adding another Siteverify redemption would consume the token twice.
- Tightened token length to Cloudflare's 2048-character limit and added recoverable CAPTCHA rejection feedback while keeping account/delivery responses neutral. Added `tests/turnstile.test.mjs` for missing/oversize tokens, exactly-once forwarding, provider rejection, neutral delivery errors and resend cooldown.
- Increased touch targets for branding, controls and inline links on touch devices. Kept native semantic interactions, scrolling/pinch zoom, responsive reading columns and reduced-motion support. No drawing tools or pressure/tilt logic were added.
- Browser layout/target checks pass for roadmap, sign-in, module and privacy at 820×1180, 1180×820, 507×1024 and 375×900. All measured interactive targets are at least 44×44 CSS pixels and there is no horizontal overflow. This used Chromium viewport emulation; real iPadOS Safari and Apple Pencil hardware have not been tested.
- Lint, typecheck, production build and all 13 Node tests pass. Hosted Supabase rejects a deliberately invalid token with HTTP 400 `captcha_failed`, establishing that CAPTCHA verification is active. This does not prove the matching secret or a successful challenge.
- The real Cloudflare script loads locally, but the automated browser challenge fails; submit remains disabled. Fresh-token success and replay rejection remain pending on the production hostname. The old deployed sign-in page was confirmed to lack the public site key and show its setup state before this configuration was pushed.
- Keep the existing widget's allowed production hostname set to `apmprep.netlify.app`. Confirm the matching secret in Supabase Auth and Site URL/callback allowlists per `supabase/PHASE3_SETUP.md`. No Cloudflare/Supabase administrative access or Netlify token is available to inspect/change those dashboard settings. The generic Spin flow's secret retrieval was not performed: its guarded destination/approved Wrangler requirements are unavailable, and the existing secret destination is Supabase.

# Security review before GitHub push

Reviewed on 2026-11-14 using lean-code. No phase advancement.

- Fixed a return-path bypass where URL normalisation of `/a/..//external.example` produced a scheme-relative redirect. The validator now checks the normalised path too; boundary and callback regression checks pass.
- Added production HSTS, sanitised public catalogue error logging, expanded ignored private credential/export file patterns and documented application/deployment controls in `SECURITY.md`. Existing verified sessions, PKCE, HttpOnly cookies, RLS ownership and production CAPTCHA gate remain in place.
- `npm run lint`, `npm run typecheck`, `npm run build`, all 12 Node tests and `git diff --check` passed. `npm audit` reported zero known vulnerabilities in the installed dependency graph.
- Gitleaks 8.30.1 (official archive checksum verified) found no leaks in the outgoing file snapshot or all three existing commits. An additional exact-value check found no configured local key values in outgoing files. `.env.local` remains ignored and untracked. Scans do not prove absence of every possible secret or vulnerability.
- Hosted configuration has not been changed or independently certified. Production CAPTCHA/SMTP, real magic-link expiry/reuse, two-account hosted RLS isolation, hosting query-log redaction and administrator MFA/branch protections still need owner/deployment verification. No penetration test was performed.

# Phase 3 checkpoint — magic links and private saved place

Updated on 2026-11-14. This supersedes earlier OTP instructions and earlier “Phase 3 has not started” entries. User chose magic links; Phase 4 has not started.

## Changed files

- `app/sign-in/page.tsx`, `app/sign-in/actions.ts`, `components/sign-in-form.tsx`, `app/sign-in/auth.module.css`, `components/turnstile.tsx`: email-link requests, neutral responses, resend cooldown, error recovery and production CAPTCHA gate. Removed code entry and verification.
- `app/auth/callback/route.ts`, `lib/auth/{server,cookies,validation}.ts`, `middleware.ts`, `next.config.ts`: PKCE exchange, verified user, local return destinations, HttpOnly session cookies, private/no-store responses, callback log suppression and relative redirects that preserve the requesting hostname.
- `app/account/{page.tsx,actions.ts}`, `components/account-form.tsx`, `components/auth-navigation.tsx`: private account screen, recent authenticated-session check before email changes, confirmation flow and device sign-out.
- `lib/progress.ts`, `app/modules/[slug]/{page.tsx,actions.ts}`, `app/page.tsx`, `app/globals.css`: Save my place and actual Continue studying. These are saved location, not lesson completion.
- `supabase/migrations/003_learner_progress.sql`, `supabase/tests/learner_progress.sql`: idempotent per-learner saved place with owner RLS and published-module checks. `package.json`/lockfile add Supabase SSR integration.
- `tests/auth.test.mjs`, `tests/magic-link.test.mjs`: auth boundaries, cookie flags, callback success/failure, verified identity and redirect restrictions.
- `app/privacy/page.tsx`, `PRIVACY_OPERATIONS.md`, `.env.example`, `README.md`, `supabase/PHASE3_SETUP.md`, `supabase/templates/magic-link.html`: actual privacy/cookie inventory, provider setup and link template. The previous code-only template was replaced.

## Working learner flow and checks

Request a link, open it in the requesting browser, return to the selected module, Save my place, then Continue studying from the roadmap. Use the same email with a separately requested link on another browser/device to restore the account. Guests can browse all published topics. No lesson completion or quizzes are claimed.

- Latest revision passes `npm run lint`, `npm run typecheck`, `npm run build`, all 12 Node tests and `git diff --check`.
- Actual Next.js + Supabase SDK browser checks against an isolated local provider fixture pass: PKCE challenge/verifier exchange, verified session, return to the requested lesson, saving/restoring place, neutral request response, cooldown, absent code entry, invalid/wrong-browser callback feedback, local redirect restriction, 1280px/390px layout without overflow and keyboard Tab to submit. Screenshots reviewed. No real email was sent by this revision.
- Earlier Phase 3 local PostgreSQL checks applied migration 003 twice and verified two-owner isolation, repeated save, spoofed ownership, unpublished-module denial and guest denial. Earlier fixture checks cover account changes, local sign-out and session refresh. They do not certify the live provider's configuration.
- Hosted catalogue is populated. The hosted progress endpoint returns 401/42501 to the public key after the user applied scripts: guest access is denied. Hosted ownership policies have not been independently inspected with administrative credentials.

## Setup/manual checks still required

Keep default `{{ .ConfirmationURL }}` templates and allow the exact local/deployed callback origins as documented in `supabase/PHASE3_SETUP.md`. Verify a fresh real email link, expiry/reuse, secure email-change confirmations, two real accounts and two-device restore. The built-in email sender restricts magic links as well as OTPs; production SMTP remains a launch requirement. Production CAPTCHA site key is still missing and sign-in fails closed without it. Confirm hosting log-query redaction, provider/region/retention details and privacy operations before public registration. No hosted Auth settings were changed by the agent; the public key cannot change them.

# Follow-up checkpoint — runtime fix, green palette and privacy

The user requested runtime/colour corrections and brought privacy work forward. This does not mark the full sign-in or analytics phases complete.

## Runtime and colours

- Found stale and overlapping dev servers serving the starter or writing to the same generated output. Stopped the overlapping processes and moved the mixed dev output aside without deleting source files.
- Development now uses `.next-dev`; production build/start use `.next`. Updated `next.config.ts`, `.gitignore`, ESLint ignores and TypeScript generated-type includes together. Added regression checks for output isolation.
- `npm run dev` explicitly binds port 3000. A duplicate default launch was checked: it reports the occupied port instead of falling back to a second port and sharing chunks. Do not deliberately launch two dev servers from this checkout.
- Confirmed `http://localhost:3000/modules/project-programme-and-portfolio-management` renders Stop 2 without the reported Webpack error, including after a production build while the dev server remains running.
- Removed purple variables, backgrounds, links and focus indicators from the UI; the current palette table above supersedes historical colours. The refreshed roadmap shows the live hosted topics.

## Privacy and security changes

- Added `app/privacy/page.tsx` and scoped styling, with APM Study as controller and the user-supplied privacy email. Six native email actions cover access/copy, correction, deletion, portability, restriction/objection and privacy/consent questions. They prepare drafts; the site does not submit or store requests.
- Added `components/site-footer.tsx` to roadmap, modules and privacy page, with Privacy, Cookie settings and data-rights links.
- The notice describes the actual current app: no learner sign-in/profiles/progress, no application cookies or persistent browser storage, no analytics or marketing. It separately declares the development-only reload cookie, current providers, rights, retention and deployment details still to confirm. No fake consent toggle was added for nonexistent optional tracking.
- Added response headers for frame blocking, MIME-sniffing protection, referrer suppression, restricted device permissions, and CSP base/object/frame/form controls. Removed the framework-identification header. Regression tests check these settings.
- Updated the vulnerable PostCSS dependency from 8.4.31 to 8.5.33 using an npm override; production audit reports zero known vulnerabilities. Next.js remains 15.5.29, with no major-framework migration.
- Patched the development lint tooling as well. TypeScript ESLint 8.72.x remains compatible with ESLint 9, and a scoped minimatch 11.x override removes the remaining development-only finding. The final install audit reports zero known vulnerabilities across all 319 packages; lint, types, six tests and build pass with those versions.
- Added `PRIVACY_OPERATIONS.md` covering identity checks, one-month rights-request handling, the manual 12-month correspondence retention policy, deployment/provider details, future secure account changes, OTP setup and ownership tests. The notice alone is not a compliance certification.

## Checks and limits

- `npm run lint`, `npm run typecheck`, `npm run build`, and six focused roadmap/config/security tests pass.
- Exact reported module URL loads from the single fresh dev server; duplicate default dev launch refuses port 3000. Production and development output stay separate during a build.
- After the final dependency updates and concurrent production build, the exact reported `http://localhost:3000/modules/project-programme-and-portfolio-management` URL still renders Stop 2 with no Webpack error, visible privacy navigation and no phone-width overflow. The single loopback-only dev server is left running on port 3000.
- Privacy desktop/390px phone layout, section anchors, visible keyboard focus and all six correctly addressed/encoded email actions were checked. Independent screenshot/source design review passed. No test emails were sent.
- Production privacy response has the intended security headers, no `X-Powered-By` and no `Set-Cookie`. Browser resources are same-origin, with no analytics/advertising or Google Fonts request; local/session storage is unused by app code. The test browser has storage from other localhost apps, so those cookies are not attributed to this application.
- Hosted API now returns 15 canonical rows. Public unpublished selection returned zero rows; public Auth admin-user listing returned 401. No private user records were retrieved or printed.
- Self-service profile editing/export/deletion needs verified sign-in in Phase 3 and is not implemented. Current correction/deletion/access requests are handled by email with proportionate identity verification.
- Confirm hosting provider/region, log/backup retention, processor agreements and transfer safeguards before public account registration. Supabase public settings currently permit email-confirmed API sign-up; restrict this in the dashboard if registration is not intended yet. SMTP, CAPTCHA, OTP settings and two-account RLS isolation remain to be verified for the future auth flow.

# Revised Phase 2 checkpoint — roadmap UI complete locally

Continued on 2026-11-14 after checking the working tree and previous phase results. Preserved earlier uncommitted source, documentation and migration work. No Phase 3 implementation was started.

## Changed files

- `app/page.tsx`: opens directly on Study roadmap in a centred reading column, with compact Study planning above the path and Self-assessment after it.
- `components/module-library.tsx`: visible stop numbers 1–15 on the continuous green rail, stable `stop-N` targets, unchanged guide references and search order. Removed entrance animations that could shift return targets.
- `app/globals.css`: exact requested palette, compact full-width mobile stops, focus indicators, responsive navigation and existing reduced-motion support. Removed the desktop sidebar layout.
- `app/modules/[slug]/page.tsx`: top and bottom Back to roadmap links target the module's stop; previous/next links use the published catalogue. Full-page return links restore the stop even after filtering or opening a deep link. A catalogue failure does not hide a module that loaded successfully.
- `lib/roadmap.ts`: shared guide-to-stop numbering and published-list navigation helpers, with group boundaries defined once.
- `tests/roadmap.test.mjs`: four focused tests cover search/legacy targets, all 15 stable numbers, invalid guide references, filtered numbering and first/middle/last/missing navigation boundaries.
- `README.md` and `PHASES.md`: current learner flow, test instructions and checkpoint.

## Working learner flow

With a published catalogue, open `/`, search or scroll to any of the 15 stops, and open its module. Stop 1 is visible on the initial desktop and phone screen. Move between published stops with Previous stop/Next stop or use either Back to roadmap link to return to the matching numbered stop. Browser focus follows the return anchor. Search does not renumber stops. The broad legacy module URLs still lead to their group anchors.

Lessons remain preparation notices; sign-in, completion, Questions and Continue studying belong to later phases. Nothing implies saved progress or working quizzes.

## Checks passed

- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` and `node --experimental-strip-types --test tests/roadmap.test.mjs` (4 tests).
- Final production smoke: `/` and `/modules/understanding-projects` both return HTTP 200 and render graceful hosted-schema error states with usable roadmap navigation.
- Populated UI checks used the real Next.js routes and Supabase client against a temporary local REST fixture exported from the previously verified PostgreSQL catalogue. All 15 detail routes returned HTTP 200 with two matching stop return links and correct neighbour URLs. First/last navigation has no out-of-range link.
- All 15 hash targets brought their stop into view in the phone browser. A deep link to Stop 11 returned to `/#stop-11`, restored its position and focused it. Filtered search → keyboard Tab/Enter → module → bottom return restored all 15 stops and focused Stop 11. Desktop keyboard flow similarly returned to Stop 12.
- Both broad legacy URLs redirected to existing group anchors. A fixture with Stop 8 unpublished made Stop 7's next link skip directly to Stop 9. A catalogue-only failure left a separately loaded module readable without neighbour links.
- Setup, empty and error states retain the three group anchors. Setup was tested with temporary empty environment overrides; `.env.local` was preserved.
- Desktop 1280px and phone 390px visual checks passed; additional 320/375/414/768px checks showed 15 ordered stops and no horizontal overflow. Visible focus and compact module controls were checked. Independent screenshot/source design evaluation passed; a different-provider evaluator was unavailable, so root performed the interactive checks.
- No schema, dependency or lockfile changes in this revision. SQL migration tests from the earlier checkpoint were not repeated because those files are unchanged.

## Setup still required

The production build succeeds but the configured hosted project still reports `public.study_modules` missing from the API schema cache. The populated UI verification above used local fixtures; it does not establish hosted schema or row-level security state. Authenticated SQL access is still needed to inspect the actual schema and apply the already tested setup/migration, then rebuild and verify the live roadmap and publication rules. No hosted tables or policies were changed in this revision.

Next implementation phase: Phase 3 email-code sign-in and synced progress, after explicitly resolving or carrying forward this hosted setup requirement.

# Historical phase results — original plan

These entries preserve the work and checks performed against the original plan. Their completion statements and phase numbering do not certify compliance with the revised plan above. Setup status is superseded by the current checkpoint.

## Phase 1 — local verification, hosted connection pending

Verified on 2026-11-14 from clean `main` at `6f34bed` in `Mide6x/APM-PFQ`.

### Changes

- Set the supplied Supabase URL in ignored `.env.local`. The existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is retained and its value is blank because no project public key was supplied. No privileged credentials were added.
- Added `supabase/tests/catalogue.sql` and documented safe setup and database verification in README.
- No application, dependency, lockfile or schema changes were necessary. No hosted database changes were made.

### Passed

- `npm run lint`, `npm run typecheck`, `npm run build` and `git diff --check`.
- Package-lock v3 root dependencies match package.json. Locked Next.js 15.5.29, React 19.3.1, Supabase JS 2.119.0 and TypeScript 5.9.3.
- Applied the unchanged schema twice in a disposable local PostgreSQL database with `anon` and `authenticated` roles. Both roles see five published seed rows, cannot see an unpublished fixture even by slug, and have no insert/update/delete privileges. Rerunning the seed preserves IDs and edited titles. The test rolls back all changes.
- Production HTTP 200 and missing-credential setup states on `/` and `/modules/understanding-projects`.
- Browser checks at 1280px desktop and 390px phone widths: both routes render without horizontal overflow. Tab focus and Enter navigation back to `/#modules` work.
- `.env.local` is ignored and untracked.

### Remaining before hosted verification

- One missing app value: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, set to this project's publishable key (preferred) or legacy anon key, per the [Supabase guide](https://supabase.com/docs/guides/getting-started/api-keys).
- Inspect the hosted table definition, grants, policies and existing rows against `supabase/schema.sql` before applying anything. Local tests verify the supplied schema, not the hosted project's current state or any extra policies there.
- After the key is available, verify live public API reads, published detail content, unpublished/missing detail 404s and the populated catalogue flow. Rebuild the production app after changing credentials because `/` is prerendered.

### Environment notes

An existing dev server shared `.next` with the build and caused an initial smoke-test 500. It was stopped and the production build repeated successfully. Avoid running dev and production builds concurrently in this checkout. The clean build required network access for the existing Montserrat Google Font.

Phase 2 has not started. Before continuing, inspect the working tree and this result, and resolve or explicitly carry forward the missing hosted verification.

## Phase 2 — guide-ordered study roadmap

Continued on 2026-11-14 after inspecting the working tree and Phase 1 result. The earlier uncommitted README, phase log and SQL test changes were preserved.

### Changes

- Replaced the card grid and decorative hero with a connected green roadmap, purple headings/navigation and a yellow first-topic marker. Kept Montserrat, Lucide icons, reduced-motion support and visible keyboard focus.
- Added Study planning, the three guide groups, Self-assessment with the supplied guide pages, official resource links and an independent-companion attribution. Removed decorative uppercase labels and unsupported lesson/time counts. Practice and mocks remain labelled unavailable.
- Added guide section/page metadata and a repeatable migration in `supabase/migrations/002_study_roadmap.sql`. Fresh setup runs schema.sql then this migration; existing starter databases run the migration. No dependencies were added.
- Preserved starter IDs and URLs for the three clean topic mappings. Broad legacy URLs redirect to group anchors. Custom text, categories, summaries, publication choices, existing guide metadata and extra catalogue rows are retained. Only numbered topics form the roadmap; unnumbered published custom rows retain their detail URLs.
- Added focused search/legacy-target tests and disposable PostgreSQL migration checks. Updated README setup/check instructions.

### Passed

- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`, and both Node roadmap tests.
- Local PostgreSQL upgrade test: 15 canonical milestones with the exact guide order/pages; preserved IDs, slugs, edited content, extra rows and publication choices; unpublished topics remain private. Migration rerun succeeds without duplicate milestones.
- Separate fresh PostgreSQL setup: schema plus migration twice yields 15 canonical rows and two preserved broad legacy rows.
- Populated browser flow used an ephemeral local REST fixture exported from the fresh PostgreSQL catalogue, through the real Next.js/Supabase query code. All 15 detail links returned HTTP 200 with their matching guide reference. Both broad legacy routes redirected to valid group anchors; missing/unknown slugs returned 404.
- Search for `2.2` returns the original five numbered topics in order; unmatched search has an explicit empty result. Tab focus from search reaches the first matching topic and Enter opens its detail page.
- Desktop 1280px and phone 390px visual checks, plus 320/375/414/768px layout checks: no horizontal overflow and all 15 milestones retain reading order. Mobile search was widened after visual review. Independent screenshot/source design evaluation passed; its separate browser session was unavailable, so root performed interactive checks.
- Production app handles the hosted schema error without crashing, with all three legacy destination anchors still present.
- With empty credential overrides (without editing `.env.local`), both routes still render their setup states and the roadmap retains all three group anchors.

### Hosted status and limits

During this phase `.env.local` gained a project publishable key externally. It was preserved and its value was not printed or committed. The final production build reached the configured Supabase project, which returned a missing `public.study_modules` schema-cache error. Phase 1's missing-key note above is historical; the current blocker is hosted catalogue setup.

No hosted changes were made. An authorised dashboard/SQL connection is still needed to inspect the actual hosted schema/policies and apply the reviewed schema and roadmap migration. A publishable key cannot perform that DDL. Local migration/RLS verification and fixture browser checks do not establish the hosted database's current policies or contents. After hosted setup, rebuild and repeat live published/unpublished catalogue checks.

Phase 3 has not started. Before continuing, inspect the working tree and this result, and resolve or explicitly carry forward hosted setup.
