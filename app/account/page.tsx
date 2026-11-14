import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AccountForm } from "@/components/account-form";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/auth/server";
import { signOut } from "./actions";
import styles from "@/app/sign-in/auth.module.css";

export const metadata: Metadata = { title: "Your account | APM Study" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=/account");

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand"><BookOpen size={24} aria-hidden="true" /><strong>APM PFQ <span>Study Hub</span></strong></Link>
        <Link href="/" className="detail-back"><ArrowLeft size={16} aria-hidden="true" /> Back to roadmap</Link>
      </header>
      <article className={`detail-content ${styles.content}`}>
        <h1>Your account</h1>
        <p className={styles.intro}>Your verified email keeps your saved place connected across devices. You do not need a public username or display name.</p>
        <section className={styles.accountSection} aria-labelledby="current-email-title">
          <h2 id="current-email-title">Signed-in email</h2>
          <p className={styles.currentEmail}>{viewer.email ?? "Your verified email is unavailable."}</p>
        </section>
        <section className={styles.accountSection} aria-labelledby="change-email-title">
          <h2 id="change-email-title">Change your email</h2>
          <p>You may be asked to sign in again before a change can be requested.</p>
          <AccountForm />
        </section>
        <section className={styles.accountSection} aria-labelledby="account-data-title">
          <h2 id="account-data-title">Your information</h2>
          <p>To request a copy or deletion of your information, use the <Link href="/privacy#requests">privacy request options</Link>. Requests are handled with an identity check before information is released or changed.</p>
        </section>
        <section className={styles.accountSection} aria-labelledby="sign-out-title">
          <h2 id="sign-out-title">Sign out on this device</h2>
          <p>Signing out keeps your saved place. Sign in with the same email to restore it.</p>
          <form action={signOut}><button className={styles.secondary} type="submit">Sign out</button></form>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
