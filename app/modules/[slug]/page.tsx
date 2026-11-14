import { ArrowLeft, ArrowRight, BookOpen, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStopNavigation, getStopNumber, legacyGroups } from "@/lib/roadmap";
import { getStudyModule, getStudyModules } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { AuthNavigation } from "@/components/auth-navigation";
import { getSavedPlace } from "@/lib/progress";
import { savePlace } from "./actions";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ place?: string }> }) {
  const { slug } = await params;
  if (Object.hasOwn(legacyGroups, slug)) redirect(`/#${legacyGroups[slug]}`);

  const result = await getStudyModule(slug);
  if (result.status === "missing") notFound();
  const stop = result.status === "ready" ? getStopNumber(result.module.guide_section) : null;
  const backHref = stop ? `/#stop-${stop}` : "/#modules";
  const catalogue = stop ? await getStudyModules() : null;
  const { previous, next } = getStopNavigation(catalogue?.status === "ready" ? catalogue.modules : [], slug);
  const saved = result.status === "ready" ? await getSavedPlace() : null;
  const { place } = await searchParams;

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand"><BookOpen size={24} aria-hidden="true" /><strong>APM PFQ <span>Study Hub</span></strong></Link>
        <a href={backHref} className="detail-back"><ArrowLeft size={16} aria-hidden="true" /> Back to roadmap</a>
        <AuthNavigation next={`/modules/${slug}`} />
      </header>
      {result.status === "ready" ? (
        <article className="detail-content">
          <h1>{stop && `${stop} · `}{result.module.title}</h1>
          <p className="detail-summary">{result.module.summary}</p>
          {result.module.guide_section && <p className="detail-facts">Physical guide · Section {result.module.guide_section}{result.module.guide_page && ` · p. ${result.module.guide_page}`}</p>}
          <div className="detail-notice">
            <Layers3 size={24} aria-hidden="true" />
            <div><h2>Your lesson is being prepared</h2><p>The study material for this topic has not been published yet. Continue with the corresponding section in your physical guide, or explore the roadmap.</p></div>
          </div>
          {stop && <section className="save-place" aria-label="Your study place">
            {saved?.status === "guest" ? <Link className="text-link" href={`/sign-in?next=${encodeURIComponent(`/modules/${slug}`)}`}>Sign in to save your place</Link> : (
              <form action={savePlace}><input type="hidden" name="slug" value={slug} /><button className="detail-action" type="submit">Save my place</button></form>
            )}
            {saved?.status === "ready" && saved.module.id === result.module.id && <p role="status">This is your saved place. You can continue here on another signed-in device.</p>}
            {place === "error" && <p role="alert">We couldn’t save your place. Please try again later.</p>}
          </section>}
          {(previous || next) && (
            <nav className="stop-navigation" aria-label="Study stops">
              {previous && <Link href={`/modules/${previous.slug}`} rel="prev"><span><ArrowLeft size={16} aria-hidden="true" /> Previous stop</span><strong>{getStopNumber(previous.guide_section)} · {previous.title}</strong></Link>}
              {next && <Link href={`/modules/${next.slug}`} rel="next"><span>Next stop <ArrowRight size={16} aria-hidden="true" /></span><strong>{getStopNumber(next.guide_section)} · {next.title}</strong></Link>}
            </nav>
          )}
          <a className="detail-action" href={backHref}><ArrowLeft size={17} aria-hidden="true" /> Back to roadmap</a>
        </article>
      ) : (
        <article className="detail-content detail-unavailable">
          <h1>{result.status === "not-configured" ? "The library is getting ready." : "We can’t load this module yet."}</h1>
          <p className="detail-summary">{result.status === "not-configured" ? "Connect your Supabase project to publish the learning path and module content." : "There was a problem reaching the study library. Please try again later."}</p>
          <a className="detail-action" href={backHref}><ArrowLeft size={17} aria-hidden="true" /> Back to roadmap</a>
        </article>
      )}
      <SiteFooter />
    </main>
  );
}
