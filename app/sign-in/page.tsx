import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/auth/server";
import { safeReturnPath } from "@/lib/auth/validation";
import {
  COOKIE_CHOICE_NAME,
  parseCookieChoice,
} from "@/lib/cookie-preferences";
import styles from "./auth.module.css";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reauth?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const viewer = await getViewer();
  if (viewer && params.reauth !== "1") redirect(next);
  const cookieChoice = parseCookieChoice(
    (await cookies()).get(COOKIE_CHOICE_NAME)?.value,
  );

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const available =
    configured && (process.env.NODE_ENV !== "production" || Boolean(siteKey));

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
      <article className={`detail-content ${styles.content}`}>
        <h1>
          {params.reauth === "1" ? "Verify it’s you" : "Sign in to study"}
        </h1>
        <p className={styles.intro}>
          {params.reauth === "1"
            ? "Follow a fresh sign-in link before changing your account details."
            : "Use a one-time email link to save your place and pick up on another device. No password or public username needed."}
        </p>
        {params.error === "link" && (
          <p className={styles.error} role="alert">
            This sign-in link could not be verified. It may have expired,
            already been used, or opened in a different browser. Request a new
            link and open it in this browser.
          </p>
        )}
        {cookieChoice !== "allow" ? (
          <section
            className={styles.notice}
            aria-labelledby="cookie-permission-title"
          >
            <h2 id="cookie-permission-title">
              Sign-in cookies are{" "}
              {cookieChoice === "block" ? "turned off" : "not enabled yet"}
            </h2>
            <p>
              Sign-in and synced progress need essential cookies. You can allow
              them in Cookie settings, or keep browsing public topics without
              signing in.
            </p>
            <Link
              href={`/cookies?next=${encodeURIComponent(next)}`}
              className="text-link"
            >
              Change cookie settings
            </Link>
          </section>
        ) : available ? (
          <SignInForm next={next} siteKey={siteKey} />
        ) : (
          <section className={styles.notice} aria-labelledby="setup-title">
            <h2 id="setup-title">Sign-in is being set up</h2>
            <p>
              Email sign-in is not available here yet. You can still browse the
              roadmap and all published topics.
            </p>
            <Link href="/" className="text-link">
              Continue browsing <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          </section>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
