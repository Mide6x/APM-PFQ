"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, CircleDot, LockKeyhole, Search } from "lucide-react";
import { difficulties, questionStatuses, type QuestionListing } from "@/lib/question-types";
import type { StudyModule } from "@/lib/supabase";
import styles from "./questions.module.css";

const statusIcons = { Locked: LockKeyhole, Ready: Circle, Attempted: CircleDot, Solved: CheckCircle2 };

export function QuestionLibrary({ questions, modules }: { questions: QuestionListing[]; modules: StudyModule[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = questions.filter(question =>
    (!term || `${question.id} ${question.title}`.toLowerCase().includes(term)) &&
    (!topic || question.guide_section === topic) &&
    (!difficulty || question.difficulty === difficulty) &&
    (!status || question.status === status),
  );
  const reset = () => { setQuery(""); setTopic(""); setDifficulty(""); setStatus(""); };

  return <>
    <div className={styles.filters}>
      <label className={styles.search}>Find a question
        <span><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title or question ID" /></span>
      </label>
      <label>Topic<select value={topic} onChange={event => setTopic(event.target.value)}>
        <option value="">All topics</option>
        {modules.filter(item => item.guide_section).map(item => <option value={item.guide_section!} key={item.id}>{item.title}</option>)}
      </select></label>
      <label>Difficulty<select value={difficulty} onChange={event => setDifficulty(event.target.value)}>
        <option value="">All difficulties</option>{difficulties.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>Status<select value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">All statuses</option>{questionStatuses.map(value => <option key={value}>{value}</option>)}
      </select></label>
    </div>
    <div className={styles.resultCount}>
      <p role="status">{filtered.length} of {questions.length} questions</p>
      {(query || topic || difficulty || status) && <button className={styles.reset} type="button" onClick={reset}>Clear filters</button>}
    </div>
    {filtered.length ? <table className={styles.table} role="table">
      <caption className="sr-only">Practice questions and the lessons needed to unlock them</caption>
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Status</th><th scope="col" role="columnheader">Question</th><th scope="col" role="columnheader">Topic</th><th scope="col" role="columnheader">Difficulty</th><th scope="col" role="columnheader">Action</th></tr></thead>
      <tbody role="rowgroup">{filtered.map(question => {
        const Icon = statusIcons[question.status];
        const locked = question.status === "Locked";
        return <tr key={question.id} role="row">
          <td role="cell" data-label="Status"><span className={`${styles.status} ${question.status === "Solved" ? styles.solved : ""}`}><Icon size={16} aria-hidden="true" />{question.status}</span></td>
          <th scope="row" role="rowheader" className={styles.questionCell}>
            <span className={styles.questionId}>{question.id}</span>
            <Link href={`/questions/${question.id}`}>{question.title}</Link>
            {locked && <p className={styles.requirement}>Complete {question.required_lessons.map(lesson => lesson.title).join(" and ")} to unlock.</p>}
          </th>
          <td role="cell" data-label="Topic">{question.topic}</td>
          <td role="cell" data-label="Difficulty">{question.difficulty}</td>
          <td role="cell" data-label="Action">{locked ? <ul className={styles.lessonLinks}>{question.required_lessons.map(lesson => <li key={lesson.id}><Link href={`/modules/${lesson.slug}`} aria-label={`Go to lesson: ${lesson.title}`}>{question.required_lessons.length > 1 ? `Go to ${lesson.title}` : "Go to lesson"} <ArrowRight size={15} aria-hidden="true" /></Link></li>)}</ul> : <Link className={styles.openLink} href={`/questions/${question.id}`} aria-label={`Open question ${question.id}`}>Open question <ArrowRight size={15} aria-hidden="true" /></Link>}</td>
        </tr>;
      })}</tbody>
    </table> : <div className={styles.notice}>
      <h2>{questions.length ? "No questions match these filters" : "Questions are on their way"}</h2>
      <p>{questions.length ? "Try another topic or clear the filters to see the full list." : "Published practice questions will appear here as they become available. You can keep studying on the roadmap."}</p>
      {questions.length ? <button type="button" className={styles.button} onClick={reset}>Clear filters</button> : <Link href="/#modules">Back to roadmap <ArrowRight size={16} aria-hidden="true" /></Link>}
    </div>}
  </>;
}
