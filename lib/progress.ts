import "server-only";

import { cache } from "react";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { createSupabase, type StudyModule } from "@/lib/supabase";
import { getLessonById } from "@/lib/lessons";

export const getSavedPlace = cache(
  async (): Promise<
    | { status: "guest" | "empty" | "error" }
    | { status: "ready"; module: StudyModule }
  > => {
    const user = await getViewer();
    if (!user) return { status: "guest" };
    const client = await createAuthClient();
    if (!client) return { status: "error" };
    try {
      const { data, error } = await client
        .from("learner_progress")
        .select("module_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) return { status: "error" };
      if (!data) return { status: "empty" };
      const result = await client
        .from("study_modules")
        .select(
          "id,slug,title,category,summary,duration_minutes,lesson_count,sort_order,guide_section,guide_page",
        )
        .eq("id", data.module_id)
        .eq("published", true)
        .maybeSingle();
      if (result.error) return { status: "error" };
      return result.data
        ? { status: "ready", module: result.data as StudyModule }
        : { status: "empty" };
    } catch {
      return { status: "error" };
    }
  },
);

export const getLearningProgress = cache(
  async (): Promise<{
    status: "guest" | "ready" | "error";
    publishedLessonIds: string[];
    completedLessonIds: string[];
    checkpointVersions: Record<string, number>;
  }> => {
    const unavailable = {
      status: "error" as const,
      publishedLessonIds: [],
      completedLessonIds: [],
      checkpointVersions: {},
    };
    const publicClient = createSupabase();
    if (!publicClient) return unavailable;
    try {
      const catalogue = await publicClient
        .from("study_lessons")
        .select("id,content_version");
      if (catalogue.error) return unavailable;
      const publishedLessonIds = (catalogue.data ?? [])
        .filter((row) => getLessonById(row.id))
        .map((row) => row.id as string);
      const checkpointVersions = Object.fromEntries((catalogue.data ?? []).map(row => [row.id, row.content_version]));
      const user = await getViewer();
      if (!user)
        return { status: "guest", publishedLessonIds, completedLessonIds: [], checkpointVersions };
      const client = await createAuthClient();
      if (!client) return { ...unavailable, publishedLessonIds, checkpointVersions };
      const result = await client
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", user.id);
      if (result.error) return { ...unavailable, publishedLessonIds, checkpointVersions };
      return {
        status: "ready",
        checkpointVersions,
        publishedLessonIds,
        completedLessonIds: (result.data ?? []).map(
          (row) => row.lesson_id as string,
        ),
      };
    } catch {
      return unavailable;
    }
  },
);

export const getLatestCheckpoint = cache(
  async (
    lessonId: string,
  ): Promise<
    | { status: "guest" | "empty" | "error" }
    | { status: "ready"; score: number; total: number; version: number; createdAt: string }
  > => {
    const user = await getViewer();
    if (!user) return { status: "guest" };
    const client = await createAuthClient();
    if (!client) return { status: "error" };
    try {
      const { data, error } = await client
        .from("checkpoint_attempts")
        .select("score,total,content_version,created_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return { status: "error" };
      return data
        ? {
            status: "ready",
            score: data.score,
            total: data.total,
            version: data.content_version,
            createdAt: data.created_at,
          }
        : { status: "empty" };
    } catch {
      return { status: "error" };
    }
  },
);

export const getCheckpointPerformance = cache(async (): Promise<
  { status: "guest" | "error" } | { status: "ready"; attempts: import("./checkpoint-performance").CheckpointSummary[] }
> => {
  if (!await getViewer()) return { status: "guest" };
  const client = await createAuthClient();
  if (!client) return { status: "error" };
  try {
    const { data, error } = await client.rpc("get_checkpoint_performance");
    return error ? { status: "error" } : { status: "ready", attempts: data ?? [] };
  } catch { return { status: "error" }; }
});
