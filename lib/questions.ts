import "server-only";

import { cache } from "react";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { createSupabase } from "@/lib/supabase";
import { getLearningProgress } from "@/lib/progress";
import type { PracticeQuestion, QuestionListing, QuestionAttempt } from "@/lib/question-types";

export const getQuestionCatalogue = cache(async (): Promise<
  { status: "ready"; questions: QuestionListing[]; signedIn: boolean } | { status: "not-configured" | "error" }
> => {
  const viewer = await getViewer();
  const client = viewer ? await createAuthClient() : createSupabase();
  if (!client) return { status: "not-configured" };
  try {
    const { data, error } = await client.rpc("get_question_catalogue");
    if (error || !Array.isArray(data)) return { status: "error" };
    return { status: "ready", questions: data as QuestionListing[], signedIn: !!viewer };
  } catch { return { status: "error" }; }
});

export const getPracticeQuestion = cache(async (id: string): Promise<
  | { status: "ready"; listing: QuestionListing; question: PracticeQuestion }
  | { status: "locked"; listing: QuestionListing; signedIn: boolean }
  | { status: "missing" | "error" | "not-configured" }
> => {
  if (!/^PFQ-[0-9]{4,6}$/.test(id)) return { status: "missing" };
  const catalogue = await getQuestionCatalogue();
  if (catalogue.status !== "ready") return { status: catalogue.status };
  const listing = catalogue.questions.find(question => question.id === id);
  if (!listing) return { status: "missing" };
  const progress = await getLearningProgress();
  if (progress.status === "error") return { status: "error" };
  if (!catalogue.signedIn || progress.status !== "ready" || listing.status === "Locked" ||
    !listing.required_lessons.length || !listing.required_lessons.every(lesson =>
      progress.publishedLessonIds.includes(lesson.id) && progress.completedLessonIds.includes(lesson.id))) {
    return { status: "locked", listing, signedIn: catalogue.signedIn };
  }
  const client = await createAuthClient();
  if (!client) return { status: "error" };
  try {
    const { data, error } = await client.rpc("get_practice_question", { p_question_id: id });
    return error || !data ? { status: "error" } : { status: "ready", listing, question: data as PracticeQuestion };
  } catch { return { status: "error" }; }
});

export async function getQuestionAttempts(id: string, page: number): Promise<
  { status: "ready"; attempts: QuestionAttempt[]; total: number } | { status: "error" }
> {
  const viewer = await getViewer();
  const client = viewer ? await createAuthClient() : null;
  if (!client || !viewer || !Number.isSafeInteger(page) || page < 1 || page > 100000) return { status: "error" };
  try {
    const { data, count, error } = await client.from("question_attempts")
      .select("id,content_version,selected_option_id,correct,created_at", { count: "exact" })
      .eq("user_id", viewer.id).eq("question_id", id)
      .order("created_at", { ascending: false }).order("id", { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);
    return error ? { status: "error" } : { status: "ready", attempts: data ?? [], total: count ?? 0 };
  } catch { return { status: "error" }; }
}
