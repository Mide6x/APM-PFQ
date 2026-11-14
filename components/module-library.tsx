"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { filterStudyModules, getStopNumber, studyGroups } from "@/lib/roadmap";
import type { StudyModule } from "@/lib/supabase";

export function ModuleLibrary({ modules }: { modules: StudyModule[] }) {
  const [query, setQuery] = useState("");
  const filtered = filterStudyModules(modules, query);

  return (
    <>
      <div className="module-toolbar">
        <label className="module-search">
          <span>Find a topic</span>
          <span className="search-field"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Topic or guide section" /></span>
        </label>
        <p className="search-count" role="status">{query.trim() ? `${filtered.length} of ${modules.length} topics` : `${modules.length} topics in guide order`}</p>
      </div>
      {filtered.length ? (
        <div className="roadmap">
          {studyGroups.map((group) => {
            const topics = filtered.filter((module) => module.guide_section?.startsWith(`${group.guideSection}.`));
            if (!topics.length && query.trim()) return null;
            return (
              <section className="roadmap-group" id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
                <h3 id={`${group.id}-title`}>{group.title}</h3>
                {topics.length ? (
                  <ol className="milestone-list" start={group.firstStop}>
                    {topics.map((module) => {
                      const stop = getStopNumber(module.guide_section);
                      return (
                        <li key={module.id} id={`stop-${stop}`} value={stop ?? undefined} tabIndex={-1} className={`study-milestone${stop === 1 ? " first-milestone" : ""}`}>
                          <Link className="milestone-link" href={`/modules/${module.slug}`} aria-label={`Open stop ${stop}: ${module.title}`}>
                            <span className="stop-number" aria-hidden="true">{stop}</span>
                            <span className="milestone-reference"><span>Guide {module.guide_section}</span>{module.guide_page && <span>p. {module.guide_page}</span>}{stop === 1 && <span className="start-here">Start here</span>}</span>
                            <h4>{module.title}</h4>
                            <ArrowRight className="milestone-arrow" size={19} aria-hidden="true" />
                            <p>{module.summary}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : <p className="group-empty">Topics will appear here when published.</p>}
              </section>
            );
          })}
        </div>
      ) : <p className="no-results" role="status">No topics match “{query}”. Try another topic or guide section.</p>}
    </>
  );
}
