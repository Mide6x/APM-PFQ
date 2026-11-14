# Privacy and security operations

Controller: APM Study. Privacy contact: adewoleolumide05@gmail.com.

The public notice is `/privacy`. Footer links lead to the storage inventory and rights requests. Requests open the visitor's email composer; the site does not submit or store request forms. Phase 3 adds magic-link sign-in, private saved place and verified email-change requests. Phase 4 adds explicit lesson completions and checkpoint attempts; names are not collected. This document and notice do not establish GDPR compliance without the operational steps below.

## Handle rights requests

1. Record the receipt date and requested right in a private, access-controlled request log, outside Git and application analytics. Requests can arrive without using the site's links.
2. Acknowledge the request and respond normally within one calendar month. Explain any lawful extension and the reason within the applicable deadline. Do not demand that someone creates an account or explains why they want access.
3. Verify identity proportionately before releasing, correcting or deleting information. Start with the email/correspondence already held. Never request an OTP, password or an unsolicited identity scan; use additional evidence only where reasonably necessary.
4. Search the records actually held, including relevant correspondence and operational records. Do not disclose another person's data. Explain any lawful restrictions or exemptions. Provide a usable copy and describe the purpose, recipients and retention where applicable.
5. Apply approved corrections or deletions in each relevant system. When accounts exist, changing an email must use Supabase's verified email-change flow; account export/deletion must derive the owner from a verified server session, never an email supplied in a form.
6. Review closed requests and remove request correspondence after 12 months unless a documented legal requirement or dispute justifies longer retention. Include attachments, request-log entries and mailbox Trash in the review; confirm provider backup retention separately. The app does not automate this mailbox cleanup.

## Before public deployment or learner sign-in

- Confirm the legal controller identity behind APM Study and publish any further required contact information.
- Netlify hosts `apmprep.netlify.app`. Record the project/database regions, log retention and backup retention. Update `/privacy` before public account registration. Minimise logs; never log emails, sign-in links/callback queries, session tokens, names or answers. Restrict log access. Redact callback query strings in hosting/proxy access logs; Next.js development request logging skips `/auth/callback`.
- Review Supabase and Google/Gmail processor terms, the suitability of the chosen accounts, subprocessors and international-transfer safeguards. Do not assume that enabling RLS determines data location or completes these contractual obligations.
- Enable MFA for operator accounts, restrict project/dashboard access, use HTTPS and configure the production host's HTTPS/HSTS settings. Keep database URLs, passwords, management tokens and privileged API keys out of Git and the app runtime.
- The public Auth settings check on 2026-11-14 reported `disable_signup=false` and `mailer_autoconfirm=false`. The provider permits email-confirmed API sign-up. Keep public registration restricted until the production magic-link configuration is verified. Changing provider settings requires authenticated dashboard/management access, not the publishable key. See `supabase/PHASE3_SETUP.md` for the exact template, migration and CAPTCHA steps.
- Before offering magic-link sign-in, configure production SMTP, the `{{ .ConfirmationURL }}` email template, link expiry/single-use verification, rate limits, resend cooldown and CAPTCHA. Validate return destinations as local paths. Verify sessions on the server. Reauthenticate sensitive changes. Apply `Secure`, appropriate `SameSite` and scoped cookie attributes through the supported Supabase SSR integration; document the actual session cookie names/lifetimes before launch.
- Enable RLS on every learner-owned table and test read/write ownership with two accounts, plus anonymous reads and writes. A public catalogue read or an empty unpublished query does not prove account isolation. Do not expose private profiles, emails, locked question stems, answer keys or explanations through public views or browser payloads.
- Keep personalised responses out of shared caches. Provide verified account correction/export/deletion controls with progress/attempt cleanup when accounts are implemented. Publish and enforce a retention schedule for those records before collecting them.

## Current storage and checks

- Authentication cookies use the `apm-auth` name and numbered chunks, HttpOnly, SameSite=Lax, path `/`, Secure in production, with a seven-day browser lifetime renewed on refresh. PKCE verifier/flow cookies under the `apm-auth-…-code-verifier` pattern last at most ten minutes. The `apm-sign-in-retry-at` cookie contains a timestamp only and expires after 60 seconds. Device sign-out clears all of these app-owned cookies; it does not clear other applications' cookies or remove saved place.
- The app uses no local/session storage. Topic search is page memory only. No analytics, advertising or tracking pixel code is installed. Turnstile is loaded only on configured sign-in pages for essential abuse prevention; keep pre-clearance disabled and document provider storage changes if that setting is changed. The first-visit notice and `/cookies` control essential sign-in cookies only. No analytics/marketing consent is requested for nonexistent tracking.
- Email-change requests require a server-verified user and a recent email authentication method in the verified token, not a user-wide last-login timestamp. Set Supabase secure email change so both relevant addresses must confirm. Personalised pages/actions are private and no-store; public catalogue reads remain read-only and independent of identity.
- Development Next.js uses the session cookie `__next_hmr_refresh_hash__` for reloads. It is listed separately in the notice. Next fonts are served locally; there is no browser Google Fonts request.
- Optional analytics must remain absent/off until its later phase supplies consent controls, an exact storage inventory and withdrawal/network checks. Keep account IDs and personal data out of analytics, and do not join analytics to progress records.
- Browser security headers block framing and plugin objects, restrict form destinations and browser device permissions, suppress referrers and prevent MIME sniffing. The CSP does not yet provide a nonce-based script policy; evaluate that alongside the authenticated rendering/caching design rather than claim complete XSS protection.
- Development uses `.next-dev` and production uses `.next`. `npm run dev` binds to loopback only, explicitly on port 3000, preventing LAN exposure and accidental fallback to a second port. Do not deliberately run two dev servers against this checkout's output directory.
- On 2026-11-14 the hosted API returned 15 published canonical topics, returned zero unpublished rows to the public key, and rejected the Auth admin-users endpoint with HTTP 401. No hosted policies or Auth settings were changed by these checks. A public-key check cannot inspect the complete policy configuration.
- PostCSS was updated through an npm override from 8.4.31 to 8.5.33. The production dependency audit then reported zero known vulnerabilities. Audit results are time-sensitive; repeat before deployment.
- Compatible TypeScript ESLint 8.72.x tooling is selected explicitly because npm's automatic audit fix selected ESLint-9-incompatible tooling. Its minimatch dependency is scoped to the patched 11.x line; other packages' minimatch versions are unchanged. Recheck these overrides when upgrading the framework/toolchain.
- The final install audit on 2026-11-14 reports zero known vulnerabilities across production and development packages. Lint, typecheck, regression tests and the production build pass with the overrides. This is a point-in-time dependency check, not a guarantee against undiscovered issues.

## Reference guidance

- [ICO subject access requests](https://ico.org.uk/for-the-public/getting-copies-of-your-information-subject-access-request/)
- [ICO storage and cookies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase production security](https://supabase.com/docs/guides/security/production-checklist)

## Cookie-choice behaviour

`apm-cookie-choice` stores a versioned allow/block selection for 90 days, without an account ID. It is readable by the page, SameSite=Lax, path / and Secure in production. It is retained after rejection solely to respect the browser choice. New sign-in requests and callback exchanges require allow; declining locally signs out and clears app auth cookies, stops middleware refresh and prevents verified account access. Existing account data is kept. Choosing allow later enables sign-in, without automatically creating a session. Preferences apply per browser, not across devices. Browser-level cookie blocking can prevent remembering a choice or signing in.

The user confirmed live magic-link sign-in works on 2026-11-14. Cookie controls were requested ahead of the analytics phase; no analytics provider/events were added. Real iPadOS/Pencil testing and full hosted two-account isolation remain separate manual checks.

## Phase 4 records

`lesson_completions` stores the verified account ID, lesson ID and first completion time (one row per learner/lesson). `checkpoint_attempts` stores the verified account ID, content version, selected option IDs, score, total, feedback snapshot and time. Guests receive grading but no persisted attempt. Checkpoint grades are computed by a restricted Postgres function; browser clients cannot write their own scores. These are requested learning features, not engagement analytics. Public database reads cannot read answer keys; learners can read only their own completions and graded attempts. Account deletion cascades these records; verify provider backup/log retention separately. A local two-learner RLS and deletion-cascade test is included. Hosted account-isolation and the legal/controller/provider decisions already listed remain manual checks.
