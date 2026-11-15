export const difficulties = ["Easy", "Medium", "Hard", "Very hard"] as const;
export const questionStatuses = ["Locked", "Ready", "Attempted", "Solved"] as const;
export type QuestionStatus = (typeof questionStatuses)[number];
export type QuestionListing = {
  id: string;
  title: string;
  topic: string;
  guide_section: string;
  module_slug: string;
  difficulty: (typeof difficulties)[number];
  syllabus_refs: string[];
  content_version: number;
  status: QuestionStatus;
  required_lessons: { id: string; title: string; slug: string }[];
};
export type PracticeQuestion = {
  id: string;
  version: number;
  stem: string;
  choices: { id: string; text: string }[];
};
export type QuestionAttempt = {
  id: string;
  content_version: number;
  selected_option_id: string;
  correct: boolean;
  created_at: string;
};
export type QuestionState =
  | { status: "idle" | "error"; message: string }
  | { status: "graded"; correct: boolean; selectedOptionId: string; correctOptionId: string; explanation: string; message: string };
