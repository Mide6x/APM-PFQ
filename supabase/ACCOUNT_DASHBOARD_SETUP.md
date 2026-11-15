# Account dashboard and lesson streaks

Apply `migrations/007_account_activity.sql` after Phase 5. It adds a caller-privilege, owner-scoped activity summary and restricts completion inserts to `user_id`/`lesson_id` so the database supplies the completion time. It does not delete or change existing completion/attempt records. The app needs no new credential. Public runtime keys cannot apply this SQL: use the authorised project SQL editor/management connection. Review the target first; verify real signed-in completion after the change.

The user selected **calendar-day lesson streaks**, replacing the earlier proposed rolling-24-hour rule:

- Dates use Europe/London and its daylight-saving rules, not the device clock.
- First-time lesson completion earns a day. Multiple new lessons on one date count once; repeating a completed lesson cannot earn another day.
- Signing in, visits, checkpoints and bank attempts do not earn streak days. This reuses requested learning progress, not analytics or a new activity tracker.
- Completing a new lesson on ten consecutive UK dates gives 10. Yesterday’s run stays active while today remains available to earn its next day. Missing a full date ends it; show “No active streak” until a new completion starts at 1.
- The on-screen value expires using server time and refreshes on returning to the tab. The existing 15 required lessons limit how many new-completion days are currently available. More authored lessons can extend that inventory later.

`supabase/tests/account_activity.sql` runs only in a disposable local/staging database. It verifies ten consecutive dates, same-day deduplication, gaps, expiry/restart, 23/25-hour UK daylight-saving dates, lesson-only qualification, forged-timestamp denial and ownership. Migration 007 was applied twice locally and previous grading/question/ownership SQL tests passed afterwards. Historical completion timestamps are retained; new browser inserts cannot choose them. Real hosted policy configuration, historical data integrity and two-account/device checks need operator verification.

Dashboard metrics deliberately separate lesson completion, current-set solved questions, latest current-set checkpoint scores and all-time saved attempt counts. They do not predict exam readiness. Settings retains verified email change, information requests, cookie settings and device sign-out. Protected responses remain private/no-store and noindex.

Hosted check, 2026-11-15: `get_account_activity` exists and denies anonymous execution with permission error 42501. No new runtime credential is needed. Public-key checks cannot inspect the stored function definition or column grants. If an earlier rolling-24-hour draft was applied, rerun the latest migration 007 for the selected calendar-day rule, then verify the real signed-in dashboard.
