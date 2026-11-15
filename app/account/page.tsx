import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Flame, Target } from "lucide-react";
import { AccountForm } from "@/components/account-form";
import { SiteFooter } from "@/components/site-footer";
import { StudyStreak } from "@/components/study-streak";
import { getAccountDashboard } from "@/lib/account-dashboard";
import { getViewer } from "@/lib/auth/server";
import { signOut } from "./actions";
import authStyles from "@/app/sign-in/auth.module.css";
import styles from "@/components/account-dashboard.module.css";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const settings = (await searchParams).tab === "settings";
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(settings ? "/account?tab=settings" : "/account")}`);
  const dashboard = settings ? null : await getAccountDashboard();

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand">
          <BookOpen size={24} aria-hidden="true" />
          <strong>APM PFQ <span>Study Hub</span></strong>
        </Link>
        <Link href="/" className="detail-back"><ArrowLeft size={16} aria-hidden="true" />Back to roadmap</Link>
        <Link href="/questions" className="detail-back">Questions<ArrowRight size={16} aria-hidden="true" /></Link>
      </header>
      <article className={`detail-content ${styles.content}`}>
        <h1>Your account</h1>
        <nav className={styles.tabs} aria-label="Account sections">
          <Link href="/account" aria-current={!settings ? "page" : undefined}>Dashboard</Link>
          <Link href="/account?tab=settings" aria-current={settings ? "page" : undefined}>Settings</Link>
        </nav>

        {settings ? <div className={styles.settings}>
          <h2>Account settings</h2>
          <p className={styles.intro}>Manage your email, your information and this device’s sign-in.</p>
          <section className={authStyles.accountSection} aria-labelledby="current-email-title">
            <h3 id="current-email-title">Signed-in email</h3>
            <p className={authStyles.currentEmail}>{viewer.email ?? "Your verified email is unavailable."}</p>
          </section>
          <section className={authStyles.accountSection} aria-labelledby="change-email-title">
            <h3 id="change-email-title">Change your email</h3>
            <p>You may be asked to sign in again before a change can be requested.</p>
            <AccountForm />
          </section>
          <section className={authStyles.accountSection} aria-labelledby="account-data-title">
            <h3 id="account-data-title">Your information</h3>
            <p>To request a copy, correction or deletion of your information, use the <Link href="/privacy#requests">privacy request options</Link>. Requests are handled with an identity check before information is released or changed.</p>
            <p><Link href="/cookies">Manage cookie choices</Link>.</p>
          </section>
          <section className={authStyles.accountSection} aria-labelledby="sign-out-title">
            <h3 id="sign-out-title">Sign out on this device</h3>
            <p>Signing out keeps your saved progress. Sign in with the same email to restore it.</p>
            <form action={signOut}><button className={authStyles.secondary} type="submit">Sign out</button></form>
          </section>
        </div> : dashboard && <section aria-labelledby="dashboard-title">
          <h2 id="dashboard-title">Your dashboard</h2>
          <p className={styles.intro}>Your progress, practice and next topic in one place.</p>

          <section className={styles.study} aria-labelledby="study-title">
            <h3 id="study-title">Your study progress</h3>
            {dashboard.study.status === "ready" && dashboard.study.total > 0 ? <>
              <p className={styles.progressValue}>{dashboard.study.percent}% <span>completed</span></p>
              <progress className={styles.progress} value={dashboard.study.percent} max={100} aria-label="Study topics completed">{dashboard.study.percent}%</progress>
              <p className={styles.supporting}>{dashboard.study.completed} of {dashboard.study.total} topics complete.</p>
              {dashboard.study.next ? <Link className={styles.continue} href={`/modules/${dashboard.study.next.slug}`}>
                <span>Continue studying<strong>{dashboard.study.next.title}</strong></span><ArrowRight size={22} aria-hidden="true" />
              </Link> : <>
                <p>You’ve completed every available topic. Keep your understanding fresh with a lesson or some practice.</p>
                <Link className={styles.inlineLink} href="/#modules">Review your topics<ArrowRight size={17} aria-hidden="true" /></Link>
              </>}
            </> : <p role="status">{dashboard.study.status === "ready" ? "Your study progress will appear when lessons are available." : "We couldn’t load your study progress just now."} <Link href="/#modules">Open the roadmap</Link>.</p>}
          </section>

          <div className={styles.metrics}>
            <section className={styles.metric} aria-labelledby="streak-title">
              <h3 id="streak-title"><Flame size={21} aria-hidden="true" />Study streak</h3>
              {dashboard.activity.status === "ready" ? <StudyStreak streak={dashboard.activity.streak} serverNow={dashboard.activity.serverNow} expiresAt={dashboard.activity.expiresAt} /> : <p role="status">Your streak is unavailable just now.</p>}
            </section>
            <section className={styles.metric} aria-labelledby="questions-title">
              <h3 id="questions-title"><CheckCircle2 size={21} aria-hidden="true" />Questions solved</h3>
              {dashboard.questions.status === "ready" ? <>
                <p className={styles.metricValue}>{dashboard.questions.solved}<span> / {dashboard.questions.total}</span></p>
                <p className={styles.supporting}>{dashboard.questions.total ? "Correctly answered on the current question sets." : "No questions are available yet."}</p>
              </> : <p role="status">Your question results are unavailable just now.</p>}
              {dashboard.activity.status === "ready" && <p className={styles.supporting}>{dashboard.activity.questionCorrect} correct across {dashboard.activity.questionAttempts} saved bank attempts, including retries.</p>}
              <Link className={styles.inlineLink} href="/questions">Practise questions<ArrowRight size={16} aria-hidden="true" /></Link>
            </section>
            <section className={styles.metric} aria-labelledby="checkpoints-title">
              <h3 id="checkpoints-title"><Target size={21} aria-hidden="true" />Quiz performance</h3>
              {dashboard.checkpoints.status === "ready" ? <>
                <p className={styles.metricValue}>{dashboard.checkpoints.percentage === null ? "—" : `${dashboard.checkpoints.percentage}%`}</p>
                <p className={styles.supporting}>{dashboard.checkpoints.percentage === null ? "No quiz results." : `${dashboard.checkpoints.score} of ${dashboard.checkpoints.total} correct, using your latest result for each current set.`}</p>
                <p className={styles.supporting}>{dashboard.checkpoints.attempted} of {dashboard.checkpoints.available} quizzes taken.</p>
              </> : <p role="status">Quiz results are unavailable.</p>}
              {dashboard.activity.status === "ready" && <p className={styles.supporting}>{dashboard.activity.checkpointAttempts} quiz attempts.</p>}
              <Link className={styles.inlineLink} href="/#checkpoint-performance">View quiz performance<ArrowRight size={16} aria-hidden="true" /></Link>
            </section>
          </div>
          <p className={styles.scope}>Quiz scores do not affect lesson completion or access to other topics.</p>
        </section>}
      </article>
      <SiteFooter />
    </main>
  );
}
