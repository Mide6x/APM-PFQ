import { publicPageMetadata } from "@/lib/site";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AuthNavigation } from "@/components/auth-navigation";
import { SiteFooter } from "@/components/site-footer";
import { QuestionLibrary } from "@/components/question-library";
import { getQuestionCatalogue } from "@/lib/questions";
import { getStudyModules } from "@/lib/supabase";
import styles from "@/components/questions.module.css";

export const dynamic = "force-dynamic";
export const metadata = publicPageMetadata("Practice questions", "Browse original APM PFQ practice questions by topic, difficulty and status. Complete the required lessons to unlock questions and save your practice history.", "/questions");

export default async function QuestionsPage() {
  const [catalogue, modules] = await Promise.all([getQuestionCatalogue(), getStudyModules()]);
  return <main className="app-shell">
    <a className="skip-link" href="#questions">Skip to questions</a>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="APM PFQ Study Hub home"><BookOpen size={24} strokeWidth={1.6} aria-hidden="true" /><span><strong>APM PFQ</strong><span>Study Hub</span></span></Link>
      <nav className="primary-nav" aria-label="Study navigation"><Link className="nav-link" href="/#modules">Roadmap</Link><Link className="nav-link is-active" href="/questions" aria-current="page">Questions</Link><AuthNavigation next="/questions" /></nav>
    </header>
    <div className={styles.page} id="questions" tabIndex={-1}>
      <h1>Questions</h1>
      <p className={styles.intro}>Search and filter practice questions.</p>
      <p>Complete the required lessons to unlock their questions. Quiz scores do not affect access. Difficulty is a practice label.</p>
      {catalogue.status === "ready" && !catalogue.signedIn && <p className={styles.guestNotice}><Link href="/sign-in?next=%2Fquestions">Sign in</Link> to unlock questions with your saved lesson completion and keep your attempts across devices. You can browse the list first.</p>}
      {catalogue.status === "ready" ? <QuestionLibrary questions={catalogue.questions} modules={modules.status === "ready" ? modules.modules : []} /> : <div className={styles.notice} role="status">
        <h2>{catalogue.status === "not-configured" ? "Questions are being set up" : "We couldn’t load the question bank"}</h2>
        <p>{catalogue.status === "not-configured" ? "Keep studying on the roadmap while practice questions are prepared." : "Please try again later. Your saved progress has not changed."}</p>
        <Link href={catalogue.status === "not-configured" ? "/#modules" : "/questions"}>{catalogue.status === "not-configured" ? "Back to roadmap" : "Try again"}</Link>
      </div>}
      <SiteFooter />
    </div>
  </main>;
}
