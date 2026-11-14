import { ArrowLeft, ArrowRight, BookOpen, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStopNavigation, getStopNumber, legacyGroups } from "@/lib/roadmap";
import { getStudyModule, getStudyModules } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { AuthNavigation } from "@/components/auth-navigation";
import { Lesson } from "@/components/lesson";
import { Checkpoint } from "@/components/checkpoint";
import { getLesson } from "@/lib/lessons";
import { getCheckpointQuestions } from "@/lib/checkpoints";
import { getLearningProgress, getLatestCheckpoint } from "@/lib/progress";
import styles from "@/components/lesson.module.css";
import { getSavedPlace } from "@/lib/progress";
import { savePlace, markLessonComplete } from "./actions";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ place?: string; completion?: string }>;
}) {
  const { slug } = await params;
  if (Object.hasOwn(legacyGroups, slug)) redirect(`/#${legacyGroups[slug]}`);

  const result = await getStudyModule(slug);
  if (result.status === "missing") notFound();
  const stop =
    result.status === "ready"
      ? getStopNumber(result.module.guide_section)
      : null;
  const backHref = stop ? `/#stop-${stop}` : "/#modules";
  const catalogue = stop ? await getStudyModules() : null;
  const { previous, next } = getStopNavigation(
    catalogue?.status === "ready" ? catalogue.modules : [],
    slug,
  );
  const saved = result.status === "ready" ? await getSavedPlace() : null;
  const { place, completion } = await searchParams;
  const lesson =
    result.status === "ready"
      ? getLesson(result.module.guide_section)
      : undefined;
  const progress = lesson ? await getLearningProgress() : null;
  const published = lesson && progress?.publishedLessonIds.includes(lesson.id);
  const latest = published ? await getLatestCheckpoint(lesson.id) : null;
  const complete =
    lesson &&
    progress?.status === "ready" &&
    progress.completedLessonIds.includes(lesson.id);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand">
          <BookOpen size={24} aria-hidden="true" />
          <strong>
            APM PFQ <span>Study Hub</span>
          </strong>
        </Link>
        <a href={backHref} className="detail-back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to roadmap
        </a>
        <AuthNavigation next={`/modules/${slug}`} />
      </header>
      {result.status === "ready" ? (
        <article className="detail-content">
          <h1>
            {stop && `${stop} · `}
            {result.module.title}
          </h1>
          <p className="detail-summary">{result.module.summary}</p>
          {result.module.guide_section && !published && (
            <p className="detail-facts">
              Physical guide · Section {result.module.guide_section}
              {result.module.guide_page && ` · p. ${result.module.guide_page}`}
            </p>
          )}
          {published ? (
            <>
              <p>
                <a className="text-link" href="#checkpoint">
                  Go to the checkpoint{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </p>
              <Lesson lesson={lesson} />
              <section
                id="lesson-completion"
                className={styles.completion}
                aria-labelledby="completion-title"
              >
                <h2 id="completion-title">Your lesson completion</h2>
                {complete ? (
                  <p role="status">
                    <strong>Lesson complete.</strong> Your next topic is ready when you are.
                  </p>
                ) : (
                  <>
                    <p>
                      When you have studied and recalled the key ideas, mark
                      this lesson complete. The checkpoint score is separate and
                      is not a completion requirement.
                    </p>
                    <form action={markLessonComplete}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <button className={styles.button} type="submit">
                        Mark lesson complete
                      </button>
                    </form>
                    {saved?.status === "guest" && (
                      <p>
                        Sign in to save completion. You will return to this
                        lesson; choose Mark lesson complete again when ready.
                      </p>
                    )}
                  </>
                )}
                {progress?.status === "error" && (
                  <p role="status">
                    We couldn’t load completion. You can keep studying and try
                    saving again.
                  </p>
                )}
                {completion === "error" && (
                  <p role="alert">
                    We couldn’t save completion. Please try again later.
                  </p>
                )}
              </section>
              <section
                id="checkpoint"
                className={styles.checkpoint}
                aria-labelledby="checkpoint-title"
              >
                <h2 id="checkpoint-title">End-of-stop checkpoint</h2>
                <p>
                  Five original practice questions. Submit for explanations,
                  then try again if useful. There is no pass requirement and
                  this does not unlock or lock other lessons.
                </p>
                {saved?.status === "guest" && (
                  <p>
                    You can practise as a guest. Sign in to save attempts and
                    sync them across devices.
                  </p>
                )}
                {latest?.status === "ready" && (
                  <p>
                    Latest saved attempt{latest.version !== lesson.version ? " (earlier checkpoint set)" : ""}:{" "}
                    <strong>
                      {latest.score} / {latest.total}
                    </strong>{" "}
                    ·{" "}
                    {new Date(latest.createdAt).toLocaleDateString("en-GB", {
                      timeZone: "UTC",
                    })}
                  </p>
                )}
                {latest?.status === "error" && (
                  <p role="status">
                    We couldn’t load your previous checkpoint result.
                  </p>
                )}
                {progress?.checkpointVersions[lesson.id] === lesson.version ? <Checkpoint
                  questions={getCheckpointQuestions(lesson.id)}
                  lessonId={lesson.id}
                  version={lesson.version}
                  slug={slug}
                  initialAttemptId={crypto.randomUUID()}
                /> : <p role="status">The checkpoint is being updated. Your lesson and saved completion remain available.</p>}
                <p><Link className="text-link" href="/#checkpoint-performance">View checkpoint performance</Link></p>
              </section>
            </>
          ) : (
            <div className="detail-notice">
              <Layers3 size={24} aria-hidden="true" />
              <div>
                <h2>
                  {progress?.status === "error"
                    ? "Study material is temporarily unavailable"
                    : "Your lesson is being prepared"}
                </h2>
                <p>
                  The published lesson for this topic is not available here yet.
                  You can continue with your physical guide or explore the
                  roadmap.
                </p>
              </div>
            </div>
          )}
          {stop && (
            <section className="save-place" aria-label="Your study place">
              {saved?.status === "guest" ? (
                <Link
                  className="text-link"
                  href={`/sign-in?next=${encodeURIComponent(`/modules/${slug}`)}`}
                >
                  Sign in to save your place
                </Link>
              ) : (
                <form action={savePlace}>
                  <input type="hidden" name="slug" value={slug} />
                  <button className="detail-action" type="submit">
                    Save my place
                  </button>
                </form>
              )}
              {saved?.status === "ready" &&
                saved.module.id === result.module.id && (
                  <p role="status">
                    This is your saved place. You can continue here on another
                    signed-in device.
                  </p>
                )}
              {place === "error" && (
                <p role="alert">
                  We couldn’t save your place. Please try again later.
                </p>
              )}
            </section>
          )}
          {(previous || next) && (
            <nav className="stop-navigation" aria-label="Study stops">
              {previous && (
                <Link href={`/modules/${previous.slug}`} rel="prev">
                  <span>
                    <ArrowLeft size={16} aria-hidden="true" /> Previous stop
                  </span>
                  <strong>
                    {getStopNumber(previous.guide_section)} · {previous.title}
                  </strong>
                </Link>
              )}
              {next && (
                <Link href={`/modules/${next.slug}`} rel="next">
                  <span>
                    Next stop <ArrowRight size={16} aria-hidden="true" />
                  </span>
                  <strong>
                    {getStopNumber(next.guide_section)} · {next.title}
                  </strong>
                </Link>
              )}
            </nav>
          )}
          <a className="detail-action" href={backHref}>
            <ArrowLeft size={17} aria-hidden="true" /> Back to roadmap
          </a>
        </article>
      ) : (
        <article className="detail-content detail-unavailable">
          <h1>
            {result.status === "not-configured"
              ? "The library is getting ready."
              : "We can’t load this module yet."}
          </h1>
          <p className="detail-summary">
            {result.status === "not-configured"
              ? "Connect your Supabase project to publish the learning path and module content."
              : "There was a problem reaching the study library. Please try again later."}
          </p>
          <a className="detail-action" href={backHref}>
            <ArrowLeft size={17} aria-hidden="true" /> Back to roadmap
          </a>
        </article>
      )}
      <SiteFooter />
    </main>
  );
}
