import { lessons } from "./lessons";

export type CheckpointSummary = {
  lesson_id: string;
  content_version: number;
  score: number;
  total: number;
  created_at: string;
  attempt_count: number;
};

export function summariseCheckpoints(versions: Record<string, number>, attempts: CheckpointSummary[]) {
  const rows = lessons.map((lesson, index) => {
    const history = attempts.filter(attempt => attempt.lesson_id === lesson.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const available = versions[lesson.id] === lesson.version;
    const latest = available ? history.find(attempt => attempt.content_version === lesson.version && attempt.total === 5) : undefined;
    return { lesson, stop: index + 1, available, latest, previous: history[0], attempts: history[0]?.attempt_count ?? 0 };
  });
  const attempted = rows.filter(row => row.latest);
  const score = attempted.reduce((sum, row) => sum + row.latest!.score, 0);
  const total = attempted.reduce((sum, row) => sum + row.latest!.total, 0);
  return { rows, score, total, percentage: total ? Math.round(score / total * 100) : null,
    attempted: attempted.length, available: rows.filter(row => row.available).length };
}
