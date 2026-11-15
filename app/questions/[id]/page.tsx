import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, LockKeyhole } from "lucide-react";
import { AuthNavigation } from "@/components/auth-navigation";
import { SiteFooter } from "@/components/site-footer";
import { QuestionAttempt } from "@/components/question-attempt";
import { getPracticeQuestion, getQuestionAttempts } from "@/lib/questions";
import styles from "@/components/questions.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practice question", robots: { index: false, follow: false } };

export default async function QuestionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const { page: requestedPage } = await searchParams;
  const page = requestedPage && /^[1-9][0-9]{0,5}$/.test(requestedPage) && Number(requestedPage) <= 100000 ? Number(requestedPage) : 1;
  const result = await getPracticeQuestion(id);
  if (result.status === "missing") notFound();
  const history = result.status === "ready" ? await getQuestionAttempts(id, page) : null;
  const listing = result.status === "ready" || result.status === "locked" ? result.listing : null;
  return <main className="detail-page">
    <header className="detail-header">
      <Link href="/" className="detail-brand"><BookOpen size={24} aria-hidden="true" /><strong>APM PFQ <span>Study Hub</span></strong></Link>
      <Link href="/questions" className="detail-back"><ArrowLeft size={16} aria-hidden="true" />Back to Questions</Link>
      <AuthNavigation next={`/questions/${id}`} />
    </header>
    <article className={`detail-content ${styles.detail}`}>
      {listing ? <>
        <p className={styles.questionId}>{listing.id}</p>
        <h1>{listing.title}</h1>
        <p className={styles.metadata}>{listing.topic} · {listing.difficulty} · Syllabus {listing.syllabus_refs.join(", ")}</p>
        {result.status === "locked" ? <section className={styles.notice} aria-labelledby="locked-title">
          <h2 id="locked-title"><LockKeyhole size={22} aria-hidden="true" />Question locked</h2>
          <p>Complete every lesson below to unlock this question. Quiz scores do not affect access.</p>
          <ul className={styles.requiredLessons}>{listing.required_lessons.map(lesson => <li key={lesson.id}><Link href={`/modules/${lesson.slug}`}>Go to lesson: {lesson.title}<ArrowRight size={16} aria-hidden="true" /></Link></li>)}</ul>
          {!result.signedIn && <p><Link href={`/sign-in?next=${encodeURIComponent(`/questions/${id}`)}`}>Sign in to use your saved lesson progress</Link>.</p>}
        </section> : result.status === "ready" && <>
          <QuestionAttempt previousStatus={listing.status === "Attempted" || listing.status === "Solved" ? listing.status : undefined} question={result.question} initialAttemptId={crypto.randomUUID()} />
          <p><Link href={`/modules/${listing.module_slug}`}>Revisit {listing.topic}<ArrowRight size={16} aria-hidden="true" /></Link></p>
          <section className={styles.history} id="attempt-history" aria-labelledby="history-title">
            <h2 id="history-title">Your attempt history</h2>
            {history?.status === "error" && <p role="status">We couldn’t load your past attempts. You can still practise.</p>}
            {history?.status === "ready" && <>
              <p>{history.total ? `${history.total} saved ${history.total === 1 ? "attempt" : "attempts"}. Showing up to 10 per page, newest first.` : "No saved attempts yet. Submit an answer to start your history."}</p>
              {history.attempts.length > 0 && <ol className={styles.historyList}>{history.attempts.map(attempt => <li key={attempt.id}>
                <strong className={attempt.correct ? styles.correct : styles.review}>{attempt.correct ? "Correct" : "Review"}</strong>
                <span>Choice {attempt.selected_option_id} · Set version {attempt.content_version}</span>
                <time dateTime={attempt.created_at}>{new Date(attempt.created_at).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC</time>
              </li>)}</ol>}
              {!history.attempts.length && history.total > 0 && <p>No attempts on this page. Return to the latest attempts.</p>}
              {(page > 1 || page * 10 < history.total) && <nav className={styles.historyNavigation} aria-label="Attempt history pages">
                {page > 1 && <Link href={`/questions/${id}?page=${page - 1}#attempt-history`}><ArrowLeft size={16} aria-hidden="true" />Newer attempts</Link>}
                {page * 10 < history.total && <Link href={`/questions/${id}?page=${page + 1}#attempt-history`}>Older attempts<ArrowRight size={16} aria-hidden="true" /></Link>}
              </nav>}
            </>}
          </section>
        </>}
      </> : <div className={styles.notice} role="status">
        <h1>{result.status === "not-configured" ? "Questions are being set up" : "This question is temporarily unavailable"}</h1>
        <p>{result.status === "not-configured" ? "You can keep studying on the roadmap while the question bank is prepared." : "Please try again later. Your saved progress has not changed."}</p>
      </div>}
      <Link className="detail-action" href="/questions"><ArrowLeft size={17} aria-hidden="true" />Back to Questions</Link>
    </article>
    <SiteFooter />
  </main>;
}
