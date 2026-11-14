import Link from "next/link";
import { getCheckpointPerformance } from "@/lib/progress";
import { summariseCheckpoints } from "@/lib/checkpoint-performance";
import type { StudyModule } from "@/lib/supabase";
import styles from "./checkpoint-performance.module.css";

export async function CheckpointPerformance({ modules, versions }: { modules: StudyModule[]; versions: Record<string, number> }) {
  const result = await getCheckpointPerformance();
  const summary = result.status === "ready" ? summariseCheckpoints(versions, result.attempts) : null;
  return <section id="checkpoint-performance" className={styles.panel} aria-labelledby="performance-title">
    <h3 id="performance-title">Checkpoint performance</h3>
    <p>Practise freely and move on at any score. Completion is separate. These checkpoints do not predict exam readiness.</p>
    {result.status === "guest" && <p><Link className="text-link" href="/sign-in?next=%2F%23checkpoint-performance">Sign in to see your saved checkpoint results</Link>. Guest attempts are not saved.</p>}
    {result.status === "error" && <p role="status">Saved checkpoint results are unavailable just now. Please try again later.</p>}
    {summary && <>
      <p><strong>{summary.percentage === null ? "No current-set results yet" : `${summary.score} / ${summary.total} · ${summary.percentage}% overall`}</strong><br />
        Coverage: {summary.attempted} of {summary.available} available checkpoints · {summary.total} of {summary.available * 5} questions attempted.
      </p>
      <p>Scores use your latest attempt on each current five-question set, rather than your best score. Retries count as attempts, not extra coverage. Attempt counts include earlier sets; earlier scores stay separate.</p>
      <ol className={styles.list} aria-label="Results by study stop">
        {summary.rows.map(row => {
          const topic = modules.find(topic => topic.guide_section === row.lesson.guideSection);
          return <li key={row.lesson.id}>
            <div>{topic ? <Link href={`/modules/${topic.slug}#checkpoint`}>{row.stop} · {row.lesson.title}</Link> : <strong>{row.stop} · {row.lesson.title}</strong>}
              <p>{!row.available ? "Checkpoint update pending" : row.latest ? "Attempted" : "Not attempted on current set"}</p>
              {!row.latest && row.previous && <p>Earlier set: {row.previous.score} / {row.previous.total} · {new Date(row.previous.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>}
            </div>
            <div><span>Latest score</span><strong>{row.latest ? `${row.latest.score} / ${row.latest.total} · ${Math.round(row.latest.score / row.latest.total * 100)}%` : "—"}</strong>
              {row.latest && <span>{new Date(row.latest.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>}
            </div>
            <div><span>Saved attempts</span><strong>{row.attempts}</strong></div>
          </li>;
        })}
      </ol>
    </>}
  </section>;
}
