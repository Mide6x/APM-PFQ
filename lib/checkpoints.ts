import "server-only";
import questions from "../content/checkpoints.json";
import type { CheckpointQuestion } from "./checkpoint-types";

export function getCheckpointQuestions(lessonId: string): CheckpointQuestion[] {
  return questions
    .filter((question) => question.lessonId === lessonId)
    .map(({ id, stem, choices }) => ({ id, stem, choices }));
}
