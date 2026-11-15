"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { getLessonById } from "@/lib/lessons";
import { getCheckpointQuestions } from "@/lib/checkpoints";
import type { CheckpointResult, CheckpointState } from "@/lib/checkpoint-types";
import { createSupabase } from "@/lib/supabase";
import { getStudyModule } from "@/lib/supabase";

export async function savePlace(form: FormData) {
  const slug = form.get("slug");
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 200
  )
    return;
  const user = await getViewer();
  const destination = `/modules/${slug}`;
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
  const result = await getStudyModule(slug);
  if (result.status !== "ready") redirect(`${destination}?place=error`);
  const client = await createAuthClient();
  if (!client) redirect(`${destination}?place=error`);
  let failed = false;
  try {
    const { error } = await client.from("learner_progress").upsert(
      {
        user_id: user.id,
        module_id: result.module.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    failed = Boolean(error);
  } catch {
    failed = true;
  }
  if (failed) redirect(`${destination}?place=error`);
  revalidatePath("/");
  redirect(`${destination}?place=saved`);
}

export async function markLessonComplete(form: FormData) {
  const slug = form.get("slug");
  const lessonId = form.get("lessonId");
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 200 ||
    typeof lessonId !== "string"
  )
    return;
  const lesson = getLessonById(lessonId);
  if (!lesson) return;
  const destination = `/modules/${slug}`;
  const user = await getViewer();
  if (!user)
    redirect(
      `/sign-in?next=${encodeURIComponent(`${destination}#lesson-completion`)}`,
    );
  const moduleResult = await getStudyModule(slug);
  if (
    moduleResult.status !== "ready" ||
    moduleResult.module.guide_section !== lesson.guideSection
  )
    return;
  const client = await createAuthClient();
  let failed = !client;
  if (client) {
    try {
      const { error } = await client
        .from("lesson_completions")
        .upsert(
          { user_id: user.id, lesson_id: lesson.id },
          { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
        );
      failed = Boolean(error);
    } catch {
      failed = true;
    }
  }
  revalidatePath("/");
  revalidatePath(destination);
  revalidatePath("/questions");
  revalidatePath("/account");
  redirect(
    `${destination}${failed ? "?completion=error" : ""}#lesson-completion`,
  );
}

export async function submitCheckpoint(
  _previous: CheckpointState,
  form: FormData,
): Promise<CheckpointState> {
  const unavailable: CheckpointState = {
    status: "error",
    message:
      "We couldn’t grade this checkpoint. Reload and try again. Your lesson completion is unchanged.",
  };
  const lessonId = form.get("lessonId"),
    slug = form.get("slug"),
    attemptId = form.get("attemptId");
  if (
    typeof lessonId !== "string" ||
    typeof slug !== "string" ||
    slug.length > 200 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof attemptId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      attemptId,
    )
  )
    return unavailable;
  const lesson = getLessonById(lessonId);
  if (!lesson || String(lesson.version) !== form.get("version"))
    return unavailable;
  const moduleResult = await getStudyModule(slug);
  if (
    moduleResult.status !== "ready" ||
    moduleResult.module.guide_section !== lesson.guideSection
  )
    return unavailable;
  const answers: Record<string, string> = {};
  for (const question of getCheckpointQuestions(lesson.id)) {
    const selected = form.getAll(question.id);
    if (
      selected.length !== 1 ||
      typeof selected[0] !== "string" ||
      !question.choices.some((choice) => choice.id === selected[0])
    )
      return {
        status: "error",
        message: "Choose one answer for every question before submitting.",
      };
    answers[question.id] = selected[0];
  }
  const user = await getViewer();
  const client = user ? await createAuthClient() : createSupabase();
  if (!client) return unavailable;
  try {
    const { data, error } = await client.rpc("submit_lesson_checkpoint", {
      p_lesson_id: lesson.id,
      p_version: lesson.version,
      p_attempt_id: attemptId,
      p_answers: answers,
    });
    if (error || !data) return unavailable;
    revalidatePath(`/modules/${slug}`);
    revalidatePath("/account");
    revalidatePath("/");
    return {
      ...(data as CheckpointResult),
      status: "graded",
      message:
        "Checkpoint graded. Completion is a separate choice; no passing score is required.",
    };
  } catch {
    return unavailable;
  }
}
