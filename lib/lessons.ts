import lessonData from "../content/lessons.json" with { type: "json" };
import type { StudyModule } from "./supabase";

export type Lesson = typeof lessonData[number];
export const lessons = lessonData;
export const handbookUrl = "https://www.apm.org.uk/media/kcjbezhz/apm-project-fundamentals-qualification-handbook.pdf";
export function getLesson(guideSection: string | null) {
  return lessons.find((lesson) => lesson.guideSection === guideSection);
}
export function getLessonById(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}
export function getStudyPosition(modules: StudyModule[], publishedIds: string[], completedIds: string[]) {
  const published = new Set(publishedIds);
  const completed = new Set(completedIds);
  const available = modules.filter((module) => {
    const lesson = getLesson(module.guide_section);
    return lesson && published.has(lesson.id);
  });
  const completedSections = available.filter((module) => completed.has(getLesson(module.guide_section)!.id)).map((module) => module.guide_section!);
  const next = available.find((module) => !completed.has(getLesson(module.guide_section)!.id));
  return { completedSections, next, total: available.length };
}
