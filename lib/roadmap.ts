import type { StudyModule } from "./supabase";

export const studyGroups = [
  { id: "introducing-projects", title: "Introducing projects", guideSection: "2.1", firstStop: 1, topicCount: 6 },
  { id: "planning-for-success", title: "Planning for success", guideSection: "2.2", firstStop: 7, topicCount: 5 },
  { id: "achieving-results", title: "Achieving results", guideSection: "2.3", firstStop: 12, topicCount: 4 },
] as const;

export const legacyGroups: Record<string, string> = {
  "planning-for-success": "planning-for-success",
  "working-with-people": "achieving-results",
};

export function getStopNumber(guideSection: string | null) {
  const group = studyGroups.find((group) => guideSection?.startsWith(`${group.guideSection}.`));
  if (!group || !guideSection) return null;
  const topic = guideSection.slice(group.guideSection.length + 1);
  const number = Number(topic);
  if (!/^[1-6]$/.test(topic) || number > group.topicCount) return null;
  return group.firstStop + number - 1;
}

export function getStopNavigation(modules: StudyModule[], slug: string) {
  const index = modules.findIndex((module) => module.slug === slug);
  return {
    previous: index > 0 ? modules[index - 1] : undefined,
    next: index >= 0 ? modules[index + 1] : undefined,
  };
}

export function filterStudyModules(modules: StudyModule[], query: string) {
  const term = query.trim().toLowerCase();
  return modules.filter((module) =>
    `${module.guide_section ?? ""} ${module.title} ${module.category} ${module.summary}`.toLowerCase().includes(term),
  );
}
