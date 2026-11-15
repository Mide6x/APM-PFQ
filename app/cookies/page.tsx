import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CookieChoices } from "@/components/cookie-choices";
import { SiteFooter } from "@/components/site-footer";
import {
  COOKIE_CHOICE_NAME,
  parseCookieChoice,
} from "@/lib/cookie-preferences";
import { safeReturnPath } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Cookie settings", alternates: { canonical: "/cookies" } };
export const dynamic = "force-dynamic";

export default async function CookieSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  const choice = parseCookieChoice(
    (await cookies()).get(COOKIE_CHOICE_NAME)?.value,
  );
  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand">
          <BookOpen size={24} aria-hidden="true" />
          <strong>
            APM PFQ <span>Study Hub</span>
          </strong>
        </Link>
        <Link href="/" className="detail-back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to roadmap
        </Link>
      </header>
      <article className="detail-content">
        <h1>Cookie settings</h1>
        <p>
          Your choice applies to this browser on this device. You can change it
          here at any time.
        </p>
        <p role="status">
          <strong>Current choice:</strong>{" "}
          {choice === "allow"
            ? "Sign-in cookies allowed."
            : choice === "block"
              ? "Browsing without sign-in cookies."
              : "No choice saved yet."}
        </p>
        <h2>Essential sign-in and security cookies</h2>
        <p>
          These keep you signed in, protect sign-in requests and let you restore
          your study position. Allowing them makes sign-in available; it does not
          sign you in automatically.
        </p>
        <p>
          Choosing to browse without them signs out this device and removes its
          sign-in cookies. Sign-in and synced progress stay unavailable until
          you allow them again. Your account and study progress are kept, and
          public study pages remain open.
        </p>
        <CookieChoices />
        <h2>Remembering your choice</h2>
        <p>
          We store only your selection in <code>apm-cookie-choice</code> for 90
          days. This essential preference cookie has no account identifier. It
          remains even when you decline sign-in cookies so we can respect your
          choice.
        </p>
        <h2>Remembering the quiz panel</h2>
        <p>When you open or collapse Quiz performance, <code>apm-checkpoint-panel</code> remembers that choice for 90 days. It contains only “open” or “closed”, with no account identifier. This requested interface preference works when sign-in cookies are declined.</p>
        <p>Your study streak is calculated from lesson completions already saved to your account. It does not use an analytics cookie, track visits or count sign-ins.</p>
        <h2>Optional cookies</h2>
        <p>
          Analytics, marketing and other optional tracking are not installed.
          There are no optional cookies to enable or disable, and allowing
          sign-in cookies does not give permission for future tracking.
        </p>
        <p>
          <Link href="/privacy#cookies">
            Read the full cookie inventory and privacy notice
          </Link>
          .
        </p>
        {choice === "allow" && (
          <Link
            className="text-link"
            href={`/sign-in?next=${encodeURIComponent(next)}`}
          >
            Continue to sign in
          </Link>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
