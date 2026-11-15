"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { getPracticeQuestion } from "@/lib/questions";
import type { QuestionState } from "@/lib/question-types";

export async function submitQuestion(_previous: QuestionState, form: FormData): Promise<QuestionState> {
  const unavailable: QuestionState = { status: "error", message: "We couldn’t save this answer. Check that you’re signed in and have completed the required lessons, then reload and try again." };
  const id = form.get("questionId"), attemptId = form.get("attemptId"), option = form.getAll("optionId");
  if (typeof id !== "string" || !/^PFQ-[0-9]{4,6}$/.test(id) || typeof attemptId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId) ||
    option.length !== 1 || typeof option[0] !== "string" || option[0].length > 40) return unavailable;
  if (!await getViewer()) return unavailable;
  const result = await getPracticeQuestion(id);
  if (result.status !== "ready" || String(result.question.version) !== form.get("version") ||
    !result.question.choices.some(choice => choice.id === option[0])) return unavailable;
  const client = await createAuthClient();
  if (!client) return unavailable;
  try {
    const { data, error } = await client.rpc("submit_practice_question", {
      p_question_id: id, p_version: result.question.version, p_attempt_id: attemptId, p_option_id: option[0],
    });
    if (error || !data) return unavailable;
    revalidatePath("/questions");
  revalidatePath("/account");
    revalidatePath(`/questions/${id}`);
    return { ...data, status: "graded", message: "Answer saved." };
  } catch { return unavailable; }
}
