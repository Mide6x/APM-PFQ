import Link from "next/link";
import { cookies } from "next/headers";
import { CheckpointPanel } from "./checkpoint-panel";
import { CHECKPOINT_PANEL_COOKIE, checkpointPanelOpen } from "@/lib/ui-preferences";
import { getCheckpointPerformance } from "@/lib/progress";
import { summariseCheckpoints } from "@/lib/checkpoint-performance";
import type { StudyModule } from "@/lib/supabase";
import styles from "./checkpoint-performance.module.css";

export async function CheckpointPerformance({ modules, versions }: { modules: StudyModule[]; versions: Record<string, number> }) {
  const result = await getCheckpointPerformance();
  const summary = result.status === "ready" ? summariseCheckpoints(versions, result.attempts) : null;
  const initialOpen = checkpointPanelOpen((await cookies()).get(CHECKPOINT_PANEL_COOKIE)?.value);
  return <CheckpointPanel initialOpen={initialOpen}>
    <p>Latest saved score for each topic quiz.</p>
    {result.status === "guest" && <p><Link className="text-link" href="/sign-in?next=%2F%23checkpoint-performance">Sign in to see your quiz results</Link>. Guest attempts are not saved.</p>}
    {result.status === "error" && <p role="status">Quiz results are unavailable. Try again later.</p>}
    {summary && <>
      <p><strong>{summary.percentage === null ? "No quiz results" : `${summary.score} / ${summary.total} · ${summary.percentage}% overall`}</strong><br />
        Coverage: {summary.attempted} of {summary.available} quizzes · {summary.total} of {summary.available * 5} questions attempted.
      </p>
      <p>The overall score uses your latest result for each quiz. Retakes do not increase coverage. Attempts on previous versions stay in your history.</p>
      <ol className={styles.list} aria-label="Quiz results by topic">
        {summary.rows.map(row => {
          const topic = modules.find(topic => topic.guide_section === row.lesson.guideSection);
          return <li key={row.lesson.id}>
            <div>{topic ? <Link href={`/modules/${topic.slug}#checkpoint`}>{row.stop} · {row.lesson.title}</Link> : <strong>{row.stop} · {row.lesson.title}</strong>}
              <p>{!row.available ? "Quiz unavailable" : row.latest ? "Attempted" : "Not taken"}</p>
              {!row.latest && row.previous && <p>Previous version: {row.previous.score} / {row.previous.total} · {new Date(row.previous.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>}
            </div>
            <div><span>Latest score</span><strong>{row.latest ? `${row.latest.score} / ${row.latest.total} · ${Math.round(row.latest.score / row.latest.total * 100)}%` : "—"}</strong>
              {row.latest && <span>{new Date(row.latest.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>}
            </div>
            <div><span>Attempts</span><strong>{row.attempts}</strong></div>
          </li>;
        })}
      </ol>
    </>}
  </CheckpointPanel>;
}
