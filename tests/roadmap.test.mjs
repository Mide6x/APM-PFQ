import assert from "node:assert/strict";
import test from "node:test";
import { filterStudyModules, getStopNavigation, getStopNumber, legacyGroups, studyGroups } from "../lib/roadmap.ts";

const modules = [
  { slug: "understanding-projects", guide_section: "2.1.1", title: "Project environment", category: "Introducing projects", summary: "External factors" },
  { slug: "project-roles", guide_section: "2.1.3", title: "Project roles", category: "Introducing projects", summary: "Responsibilities" },
  { slug: "scope-management", guide_section: "2.2.5", title: "Scope management", category: "Planning for success", summary: "Deliverables" },
];

test("search retains original guide numbers, row identity and relative order", () => {
  assert.deepEqual(filterStudyModules(modules, " PROJECT "), modules.slice(0, 2));
  assert.deepEqual(filterStudyModules(modules, "2.2.5"), [modules[2]]);
  assert.deepEqual(filterStudyModules(modules, "external"), [modules[0]]);
  assert.deepEqual(filterStudyModules(modules, ""), modules);
  assert.deepEqual(filterStudyModules(modules, "no match"), []);
});

test("legacy broad URLs target real group anchors", () => {
  assert.deepEqual(Object.keys(legacyGroups), ["planning-for-success", "working-with-people"]);
  for (const target of Object.values(legacyGroups)) {
    assert.ok(studyGroups.some((group) => group.id === target));
  }
});

test("all 15 guide sections have stable stop numbers, including after filtering", () => {
  const sections = studyGroups.flatMap((group) =>
    Array.from({ length: group.topicCount }, (_, index) => `${group.guideSection}.${index + 1}`),
  );
  assert.deepEqual(sections.map(getStopNumber), Array.from({ length: 15 }, (_, index) => index + 1));
  assert.deepEqual(filterStudyModules(modules, "2.2.5").map((module) => getStopNumber(module.guide_section)), [11]);
  for (const section of [null, "", "1.6", "2.1.0", "2.1.7", "2.2.6", "2.3.5", "2.4.1", "2.1.01", "2.1.1.1"]) {
    assert.equal(getStopNumber(section), null, section ?? "null");
  }
});

test("previous and next follow the published catalogue, including its boundaries", () => {
  assert.deepEqual(getStopNavigation(modules, modules[0].slug), { previous: undefined, next: modules[1] });
  assert.deepEqual(getStopNavigation(modules, modules[1].slug), { previous: modules[0], next: modules[2] });
  assert.deepEqual(getStopNavigation(modules, modules[2].slug), { previous: modules[1], next: undefined });
  assert.deepEqual(getStopNavigation(modules, "unpublished-or-missing"), { previous: undefined, next: undefined });
  assert.deepEqual(getStopNavigation([], modules[0].slug), { previous: undefined, next: undefined });
});
