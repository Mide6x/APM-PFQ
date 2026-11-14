import { Activity, ArrowRight, BookOpen, Check, Clock3, Compass, Layers3, Search, Sparkles } from "lucide-react";
import { ModuleLibrary } from "@/components/module-library";
import { getStudyModules } from "@/lib/supabase";
import Link from "next/link";

const navItems = [
  { label: "Overview", href: "#overview", icon: Compass, active: true },
  { label: "Study modules", href: "#modules", icon: Layers3, active: false },
  { label: "Resources", href: "#resources", icon: BookOpen, active: false },
];

export default async function Home() {
  const result = await getStudyModules();

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#overview" aria-label="APM PFQ home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>APM<span>PFQ</span></strong>
            <small>PROJECT FUNDAMENTALS</small>
          </span>
        </a>

        <div className="side-label">YOUR STUDY SPACE</div>
        <nav className="primary-nav">
          {navItems.map(({ label, href, icon: Icon, active }) => (
            <a key={label} href={href} className={`nav-link${active ? " is-active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {active && <span className="active-dot" aria-hidden="true" />}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="side-quote">
            <span className="quote-rule" />
            <p>Good projects don’t happen by accident.</p>
            <span className="quote-attribution">Start with the fundamentals.</span>
          </div>
          <div className="sidebar-foot">
            <span className="status-dot" />
            APM PFQ STUDY HUB
            <span className="foot-version">v1.0</span>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>LEARNING PATH</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-right">
            <span className="edition">FOUNDATION LEVEL</span>
            <span className="topbar-avatar" aria-label="Guest learner">G</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome" id="overview">
            <div className="welcome-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> A CLEARER WAY TO GET STARTED</div>
              <h1>Project management,<br /><span>from the ground up.</span></h1>
              <p>A focused home for your APM Project Fundamentals Qualification. Find your footing, build confidence, and take each concept one step at a time.</p>
              <a className="primary-action" href="#modules">
                Explore study modules <ArrowRight size={17} strokeWidth={2} />
              </a>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-grid" />
              <div className="path-line path-one" />
              <div className="path-line path-two" />
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="milestone milestone-one"><span>01</span></div>
              <div className="milestone milestone-two"><span>02</span></div>
              <div className="milestone milestone-three"><span>03</span></div>
              <div className="art-note"><span className="note-kicker">YOUR NEXT STEP</span><strong>Start with the<br />project lifecycle</strong><ArrowRight size={17} /></div>
              <span className="art-coordinate">A / 01</span>
            </div>
          </section>

          <section className="journey-row" aria-label="Study status">
            <div className="journey-card">
              <div className="journey-icon"><Activity size={19} strokeWidth={1.8} /></div>
              <div className="journey-copy">
                <span className="card-kicker">YOUR LEARNING JOURNEY</span>
                <strong>Ready when you are</strong>
                <span className="journey-hint">Study progress will appear here once tracking is available.</span>
              </div>
              <div className="journey-progress" aria-label="No study progress recorded">
                <div className="progress-ring"><span>—</span></div>
                <span>NOT STARTED</span>
              </div>
            </div>
            <div className="next-card">
              <div className="next-overline"><span className="amber-pin" /> A GOOD PLACE TO BEGIN</div>
              <div className="next-main">
                <span className="next-number">01</span>
                <div><strong>Understanding projects</strong><span>What makes a project—and what doesn’t.</span></div>
                <a href="#modules" aria-label="Go to study modules"><ArrowRight size={18} /></a>
              </div>
            </div>
          </section>

          <section className="modules-section" id="modules">
            <div className="section-heading">
              <div>
                <div className="eyebrow section-eyebrow"><span className="eyebrow-line" /> BUILD YOUR FOUNDATION</div>
                <h2>Study modules<span className="title-period">.</span></h2>
                <p>Core ideas, clearly organised. Choose a topic to begin.</p>
              </div>
              {result.status === "ready" && (
                <div className="library-count"><span>{String(result.modules.length).padStart(2, "0")}</span> MODULES</div>
              )}
            </div>

            {result.status === "not-configured" && (
              <div className="library-state setup-state">
                <div className="state-icon"><Layers3 size={20} /></div>
                <div><strong>Your study library is being set up</strong><p>Connect Supabase and add published study modules to see the full learning path here.</p></div>
                <span className="state-tag">SETUP NEEDED</span>
              </div>
            )}
            {result.status === "error" && (
              <div className="library-state error-state" role="status">
                <div className="state-icon"><Search size={20} /></div>
                <div><strong>The library is taking a short break</strong><p>{result.message}</p></div>
                <Link href="/#modules">Try again <ArrowRight size={15} /></Link>
              </div>
            )}
            {result.status === "empty" && (
              <div className="library-state">
                <div className="state-icon"><BookOpen size={20} /></div>
                <div><strong>No modules have been published yet</strong><p>Your study library will appear here as soon as the first module is ready.</p></div>
                <span className="state-tag">COMING SOON</span>
              </div>
            )}
            {result.status === "ready" && <ModuleLibrary modules={result.modules} />}
          </section>

          <section className="resource-strip" id="resources">
            <div className="resource-symbol"><Sparkles size={18} /></div>
            <div className="resource-copy"><span>YOUR TOOLKIT</span><strong>Learn the language of projects.</strong><p>Study resources are coming soon.</p></div>
            <span className="resource-decoration" aria-hidden="true"><Check size={18} /></span>
          </section>
          <footer className="page-footer"><span>APM PROJECT FUNDAMENTALS QUALIFICATION</span><span><Clock3 size={13} /> A little progress adds up.</span></footer>
        </div>
      </div>
    </main>
  );
}
