import { siteUrl, siteName, siteDescription } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";
import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
import Link from "next/link";
import { CheckpointPerformance } from "@/components/checkpoint-performance";
import { ModuleLibrary } from "@/components/module-library";
import { SiteFooter } from "@/components/site-footer";
import { studyGroups } from "@/lib/roadmap";
import { getStudyModules } from "@/lib/supabase";
import { getStudyPosition } from "@/lib/lessons";
import { getLearningProgress } from "@/lib/progress";
import { AuthNavigation } from "@/components/auth-navigation";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", type: "website", locale: "en_GB", siteName, title: siteName, description: siteDescription } };

export default async function Home() {
  const [result, progress] = await Promise.all([
    getStudyModules(),
    getLearningProgress(),
  ]);
  const position = getStudyPosition(
    result.status === "ready" ? result.modules : [],
    progress.publishedLessonIds,
    progress.status === "ready" ? progress.completedLessonIds : [],
  );

  return (
    <main className="app-shell" id="overview">
      <StructuredData data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: siteName, description: siteDescription, inLanguage: "en-GB", publisher: { "@type": "Organization", name: "APM Study", url: siteUrl } }} />
      <a className="skip-link" href="#modules">
        Skip to study roadmap
      </a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="APM PFQ Study Hub home">
          <BookOpen size={24} strokeWidth={1.6} aria-hidden="true" />
          <span>
            <strong>APM PFQ</strong>
            <span>Study Hub</span>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Study navigation">
          <a className="nav-link is-active" href="#modules" aria-current="page">
            Roadmap
          </a>
          <Link className="nav-link" href="/questions">Questions</Link>
          <a className="nav-link" href="#self-assessment">
            Self-assessment
          </a>
          <AuthNavigation />
        </nav>
      </header>

      <div className="page-content">
        <section
          className="modules-section"
          id="modules"
          aria-labelledby="roadmap-title"
        >
          <div className="section-heading">
            <h1 id="roadmap-title">Study roadmap</h1>
            <p>
              An independent companion to your APM PFQ guide. Follow the green
              thread, or open any published topic.
            </p>
          </div>
          {progress.status === "ready" && position.total > 0 && (
            <p role="status">
              {Math.round(position.completedSections.length / position.total * 100)}% completed.{" "}
              {position.total > 0 &&
                !position.next &&
                "You’ve completed every available topic. Revisit any lesson or checkpoint below."}
            </p>
          )}
          {progress.status === "ready" && position.next && (
            <p className="saved-place">
              <Link
                className="text-link"
                href={`/modules/${position.next.slug}`}
              >
                Continue studying: {position.next.title}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
          )}
          {progress.status === "error" && (
            <p role="status">
              Saved lesson progress is unavailable just now. Published topics
              remain open to browse.
            </p>
          )}
          <section
            className="study-planning"
            id="study-planning"
            aria-labelledby="planning-title"
          >
            <h2 id="planning-title">Study planning</h2>
            <p>
              Read a section, explain the key idea in your own words, then move
              to the next stop. References below are your guide’s sections and
              printed pages, separate from exam syllabus IDs.
            </p>
          </section>

          {result.status === "not-configured" && (
            <div className="library-state setup-state" role="status">
              <Layers3 size={22} aria-hidden="true" />
              <div>
                <strong>Your study library is being set up</strong>
                <p>
                  Connect Supabase and publish the study catalogue to see the
                  topics here.
                </p>
              </div>
            </div>
          )}
          {result.status === "error" && (
            <div className="library-state error-state" role="status">
              <BookOpen size={22} aria-hidden="true" />
              <div>
                <strong>The library is taking a short break</strong>
                <p>{result.message}</p>
                <Link className="text-link" href="/#modules">
                  Try again <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
          {result.status === "empty" && (
            <div className="library-state" role="status">
              <BookOpen size={22} aria-hidden="true" />
              <div>
                <strong>No topics have been published yet</strong>
                <p>
                  The roadmap will appear as soon as the study catalogue is
                  ready.
                </p>
              </div>
            </div>
          )}
          {result.status === "ready" ? (
            <ModuleLibrary
              modules={result.modules}
              completedSections={position.completedSections}
              nextSection={
                progress.status === "error"
                  ? null
                  : (position.next?.guide_section ?? null)
              }
              signedIn={progress.status === "ready"}
            />
          ) : (
            <div className="roadmap roadmap-pending">
              {studyGroups.map((group) => (
                <section
                  className="roadmap-group"
                  id={group.id}
                  key={group.id}
                  aria-labelledby={`${group.id}-title`}
                >
                  <h3 id={`${group.id}-title`}>{group.title}</h3>
                  <p>Topics will appear here when published.</p>
                </section>
              ))}
            </div>
          )}
        </section>

        <section
          className="self-assessment"
          id="self-assessment"
          aria-labelledby="assessment-title"
        >
          <h2 id="assessment-title">Self-assessment</h2>
          <p>
            After the study areas, revisit what you have learned with your
            guide’s self-assessment sections.
          </p>
          {result.status === "ready" && <CheckpointPerformance modules={result.modules} versions={progress.checkpointVersions} />}
          <ol className="assessment-list">
            <li>
              <h3>
                3.1 Test questions <span>p. 87</span>
              </h3>
              <p>
                Each published lesson has an end-of-stop checkpoint. Open a
                topic to practise and review its explanations. <Link href="/questions">Browse the Questions bank</Link> for more practice unlocked by lesson completion.
              </p>
            </li>
            <li>
              <h3>
                3.2 Examination practice <span>p. 129</span>
              </h3>
              <p>
                Prepare for a full practice paper. Timed mocks are not yet
                available.
              </p>
            </li>
          </ol>
        </section>
        <section
          className="resources"
          id="resources"
          aria-labelledby="resources-title"
        >
          <h2 id="resources-title">Official resources</h2>
          <ul>
            <li>
              <a href="https://www.apm.org.uk/qualifications-and-training/project-management-fundamentals/">
                APM Project Fundamentals Qualification{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://www.apm.org.uk/media/kcjbezhz/apm-project-fundamentals-qualification-handbook.pdf">
                APM PFQ handbook <ArrowRight size={15} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}
