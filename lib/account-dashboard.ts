import "server-only";

import { getViewer, createAuthClient } from "@/lib/auth/server";
import { getSavedPlace, getLearningProgress, getCheckpointPerformance } from "@/lib/progress";
import { getStudyModules } from "@/lib/supabase";
import { getStudyPosition } from "@/lib/lessons";
import { summariseCheckpoints } from "@/lib/checkpoint-performance";
import { getQuestionCatalogue } from "@/lib/questions";

export type AccountActivity = {
  streak: number;
  serverNow: string;
  lastActivity: string | null;
  expiresAt: string | null;
  questionAttempts: number;
  questionCorrect: number;
  checkpointAttempts: number;
};

export async function getAccountDashboard() {
  const [progress, modules, checkpoints, questions, activity, saved] = await Promise.all([
    getLearningProgress(), getStudyModules(), getCheckpointPerformance(), getQuestionCatalogue(), getAccountActivity(), getSavedPlace(),
  ]);
  const position = modules.status === "ready" && progress.status === "ready"
    ? getStudyPosition(modules.modules, progress.publishedLessonIds, progress.completedLessonIds) : null;
  const checkpointSummary = checkpoints.status === "ready" && progress.status === "ready"
    ? summariseCheckpoints(progress.checkpointVersions, checkpoints.attempts) : null;
  const resume = saved.status === "ready" ? saved.module : position?.next;
  return {
    study: position && position.total > 0 ? { status: "ready" as const,
      percent: Math.round(position.completedSections.length / position.total * 100),
      next: resume ? { title: resume.title, slug: resume.slug } : null,
      completed: position.completedSections.length, total: position.total,
    } : { status: "error" as const },
    checkpoints: checkpointSummary ? { status: "ready" as const, score: checkpointSummary.score, total: checkpointSummary.total,
      percentage: checkpointSummary.percentage, attempted: checkpointSummary.attempted, available: checkpointSummary.available,
    } : { status: "error" as const },
    questions: questions.status === "ready" && questions.signedIn ? { status: "ready" as const,
      solved: questions.questions.filter(question => question.status === "Solved").length, total: questions.questions.length,
    } : { status: "error" as const },
    activity,
  };
}

async function getAccountActivity(): Promise<({ status: "ready" } & AccountActivity) | { status: "error" }> {
  if (!await getViewer()) return { status: "error" };
  const client = await createAuthClient();
  if (!client) return { status: "error" };
  try {
    const { data, error } = await client.rpc("get_account_activity");
    return error || !data ? { status: "error" } : { ...data as AccountActivity, status: "ready" };
  } catch { return { status: "error" }; }
}
