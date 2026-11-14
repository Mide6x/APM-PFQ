import type { Lesson as LessonContent } from "@/lib/lessons";
import { handbookUrl } from "@/lib/lessons";
import styles from "./lesson.module.css";

export function Lesson({ lesson }: { lesson: LessonContent }) {
  return <div className={styles.lesson}>
    <p className={styles.references}>Guide section {lesson.guideSection} · p. {lesson.guidePages} · Syllabus {lesson.syllabusRefs.join(", ")}. Guide numbers and syllabus IDs are separate references.</p>
    <section aria-labelledby="lesson-goals"><h2 id="lesson-goals">What you will learn</h2><ul>{lesson.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></section>
    {lesson.sections.map((section) => <section key={section.title}>
      <h2>{section.title}</h2>
      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.points.length > 0 && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
    </section>)}
    <section className={styles.example} aria-labelledby="worked-example-title">
      <h2 id="worked-example-title">An example to work through</h2>
      <p>{lesson.example.scenario}</p>
      <dl>{lesson.example.steps.map((step) => <div key={step.label}><dt>{step.label}</dt><dd>{step.detail}</dd></div>)}</dl>
      {lesson.example.diagram && <figure><pre>{lesson.example.diagram}</pre><figcaption>Original study illustration; use the steps above to interpret it.</figcaption></figure>}
      <p><strong>Takeaway:</strong> {lesson.example.takeaway}</p>
    </section>
    <section className={styles.recall} aria-labelledby="recall-title">
      <h2 id="recall-title">Pause and recall</h2><p>{lesson.recall.prompt}</p>
      <details><summary>Reveal a suggested answer</summary><p>{lesson.recall.answer}</p></details>
    </section>
    <p className={styles.references}>Original study material for an independent companion. Check assessable terminology against the <a href={handbookUrl}>official APM PFQ handbook</a>. This is not an APM exam question set.</p>
  </div>;
}
