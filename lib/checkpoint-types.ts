export type CheckpointQuestion = { id: string; stem: string; choices: { id: string; text: string }[] };
export type CheckpointFeedback = { questionId: string; stem: string; choices: CheckpointQuestion["choices"]; selectedOptionId: string; correctOptionId: string; explanation: string };
export type CheckpointResult = { score: number; total: number; feedback: CheckpointFeedback[]; saved: boolean };
export type CheckpointState = { status: "idle" | "error"; message: string } | (CheckpointResult & { status: "graded"; message: string });
