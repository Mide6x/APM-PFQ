# Security

Report a suspected vulnerability privately to adewoleolumide05@gmail.com. Do not post credentials, sign-in links, session cookies or personal data in public issues.

## Application controls

- Supabase identities are verified server-side; progress ownership comes from the verified user, never a submitted user ID. Database RLS is the final access boundary.
- Magic links use PKCE and validated local return paths. Sessions use HttpOnly, SameSite=Lax cookies, Secure on production HTTPS. Personalised routes and auth responses are private/no-store.
- Sign-in responses do not disclose account existence. Supabase rate limits and production CAPTCHA provide abuse protection; the browser cooldown alone is not a security boundary.
- Email changes require recent verified email authentication and must be confirmed through Supabase's secure email-change flow.
- Production responses include HSTS, framing restrictions, no-sniff, no-referrer and a restrictive base/object/form policy. This is a partial CSP, not a complete script-injection defence.

## Required deployment controls

Before public registration, configure HTTPS, production CAPTCHA and email delivery, short link expiry, exact callback-host allowlists and secure email-change confirmation on both addresses. Check two real accounts cannot access each other's progress. Verify unpublished modules and private progress are inaccessible using the public API. Local tests do not inspect every hosted policy.

Keep `.env.local`, database credentials, personal exports and privileged keys outside Git and the app runtime. The app uses a publishable/anon key; it is intentionally public and grants only the access allowed by database policies. Never substitute a secret/service-role key.

Redact `/auth/callback` query strings and all credentials from hosting/proxy logs. Restrict dashboard access, enable MFA for GitHub/Supabase/hosting administrators, use least-privilege access, protect the main branch, maintain backups and review dependency alerts. Provider settings require the owner's dashboard access and are not configured by source changes.

Run lint, typecheck, the Node tests, build and `npm audit` before releases. Review new dependencies and keep the lockfile current. A clean scan is not proof that no vulnerability exists.
