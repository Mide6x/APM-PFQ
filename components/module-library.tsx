"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import type { StudyModule } from "@/lib/supabase";

const categoryStyles: Record<string, string> = {
  "Starting out": "sage",
  "Planning": "blue",
  "People & leadership": "rose",
  "Delivery": "amber",
};

export function ModuleLibrary({ modules }: { modules: StudyModule[] }) {
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? modules.filter((module) => `${module.title} ${module.category} ${module.summary}`.toLowerCase().includes(term))
      : modules;
  }, [modules, query]);

  return (
    <>
      <div className="module-toolbar">
        <span><BookOpen size={15} /> THE LEARNING PATH</span>
        <label className="module-search">
          <span className="sr-only">Search modules</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic" />
          <ArrowUpRight size={15} aria-hidden="true" />
        </label>
      </div>
      {filtered.length ? (
        <div className="module-grid">
          {filtered.map((module, index) => {
            const categoryClass = categoryStyles[module.category] ?? "blue";
            return (
              <motion.article
                key={module.id}
                className="module-card"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.055 }}
              >
                <div className={`module-marker ${categoryClass}`}><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className="module-body">
                  <div className="module-meta"><span className={`category-tag ${categoryClass}`}>{module.category}</span><span className="module-duration"><Clock3 size={13} /> {module.duration_minutes} MIN</span></div>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <div className="module-bottom"><span>{module.lesson_count} bite-sized lessons</span><a href={`/modules/${module.slug}`} aria-label={`Open ${module.title}`}><ArrowUpRight size={16} /></a></div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="no-results" role="status">No modules match “{query}”. Try another topic.</div>
      )}
    </>
  );
}
