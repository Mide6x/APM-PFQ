import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyModule } from "@/lib/supabase";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getStudyModule(slug);

  if (result.status === "missing") notFound();

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand"><span className="detail-brand-mark">A</span><strong>APM<span>PFQ</span></strong></Link>
        <Link href="/#modules" className="detail-back"><ArrowLeft size={15} /> All study modules</Link>
      </header>
      {result.status === "ready" ? (
        <article className="detail-content">
          <div className="detail-eyebrow"><span /> {result.module.category.toUpperCase()}</div>
          <h1>{result.module.title}<span>.</span></h1>
          <p className="detail-summary">{result.module.summary}</p>
          <div className="detail-facts"><span><Clock3 size={15} /> About {result.module.duration_minutes} minutes</span><span><BookOpen size={15} /> {result.module.lesson_count} lessons</span></div>
          <div className="detail-notice">
            <div className="detail-notice-icon"><Layers3 size={19} /></div>
            <div><strong>Your module outline is being prepared</strong><p>The study material for this topic has not been published yet. Check back soon, or continue exploring the learning path.</p></div>
          </div>
          <Link className="detail-action" href="/#modules">Explore other modules <ArrowRight size={16} /></Link>
        </article>
      ) : (
        <article className="detail-content detail-unavailable">
          <div className="detail-eyebrow"><span /> STUDY LIBRARY</div>
          <h1>{result.status === "not-configured" ? "The library is getting ready." : "We can’t load this module yet."}</h1>
          <p className="detail-summary">{result.status === "not-configured" ? "Connect your Supabase project to publish the learning path and module content." : "There was a problem reaching the study library. Please try again later."}</p>
          <Link className="detail-action" href="/#modules">Back to overview <ArrowRight size={16} /></Link>
        </article>
      )}
    </main>
  );
}
