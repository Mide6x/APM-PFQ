import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { getLessonById } from "../lib/lessons.ts";
const bank = JSON.parse(
  readFileSync(new URL("../content/checkpoints.json", import.meta.url), "utf8"),
);
const compiled = ts.transpileModule(
  readFileSync(
    new URL("../app/modules/[slug]/actions.ts", import.meta.url),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
function actions(signedIn = true, fail = false) {
  const writes = [],
    rpcs = [],
    redirects = [];
  const client = {
    from: () => ({
      upsert: async (value, options) => {
        writes.push({ value, options });
        return { error: fail ? {} : null };
      },
    }),
    rpc: async (name, args) => {
      rpcs.push({ name, args });
      return {
        data: { score: 2, total: 5, feedback: [], saved: signedIn },
        error: fail ? {} : null,
      };
    },
  };
  const dependencies = {
    "next/navigation": {
      redirect: (url) => {
        redirects.push(url);
        throw new Error("redirect");
      },
    },
    "next/cache": { revalidatePath: () => {} },
    "@/lib/auth/server": {
      getViewer: async () => (signedIn ? { id: "verified-user" } : null),
      createAuthClient: async () => client,
    },
    "@/lib/supabase": {
      createSupabase: () => client,
      getStudyModule: async () => ({
        status: "ready",
        module: { id: "module", guide_section: "2.1.1" },
      }),
    },
    "@/lib/lessons": { getLessonById },
    "@/lib/checkpoints": {
      getCheckpointQuestions: (lessonId) =>
        bank
          .filter((q) => q.lessonId === lessonId)
          .map(({ id, stem, choices }) => ({ id, stem, choices })),
    },
  };
  const exports = {};
  new Function("require", "exports", compiled)(
    (name) => dependencies[name],
    exports,
  );
  return { ...exports, writes, rpcs, redirects };
}
function form() {
  const f = new FormData();
  for (const [k, v] of Object.entries({
    slug: "understanding-projects",
    lessonId: "project-environment",
    version: "2",
    attemptId: "60000000-0000-4000-8000-000000000001",
    score: "99",
    user_id: "forged-user",
  }))
    f.set(k, v);
  for (const q of bank.filter((q) => q.lessonId === "project-environment"))
    f.set(q.id, q.choices[0].id);
  return f;
}
test("completion derives ownership from the verified viewer and repeats safely", async () => {
  const h = actions();
  for (let n = 0; n < 2; n++)
    await assert.rejects(h.markLessonComplete(form()), /redirect/);
  assert.equal(h.writes.length, 2);
  for (const write of h.writes) {
    assert.deepEqual(write.value, {
      user_id: "verified-user",
      lesson_id: "project-environment",
    });
    assert.equal(write.options.ignoreDuplicates, true);
    assert.equal(write.options.onConflict, "user_id,lesson_id");
  }
  const guest = actions(false);
  await assert.rejects(guest.markLessonComplete(form()), /redirect/);
  assert.equal(guest.writes.length, 0);
  assert.match(
    decodeURIComponent(guest.redirects[0]),
    /next=\/modules\/understanding-projects#lesson-completion/,
  );
  const fail = actions(true, true);
  await assert.rejects(fail.markLessonComplete(form()), /redirect/);
  assert.match(fail.redirects[0], /completion=error/);
});
test("grading sends stable choices to the trusted function, never a supplied score or owner", async () => {
  for (const signedIn of [false, true]) {
    const h = actions(signedIn);
    const result = await h.submitCheckpoint({}, form());
    assert.equal(result.status, "graded");
    assert.equal(result.score, 2);
    assert.equal(result.saved, signedIn);
    assert.equal(h.rpcs.length, 1);
    assert.deepEqual(Object.keys(h.rpcs[0].args).sort(), [
      "p_answers",
      "p_attempt_id",
      "p_lesson_id",
      "p_version",
    ]);
    assert.equal(h.rpcs[0].name, "submit_lesson_checkpoint");
  }
});
test("invalid, duplicate and mismatched choices never reach grading", async () => {
  for (const mutate of [
    (f) => f.delete(bank[0].id),
    (f) => f.append(bank[0].id, "b"),
    (f) => f.set(bank[0].id, "not-an-option"),
    (f) => f.set("lessonId", "business-case"),
    (f) => f.set("version", "9"),
    (f) => f.set("attemptId", "unsafe"),
  ]) {
    const h = actions();
    const f = form();
    mutate(f);
    assert.equal((await h.submitCheckpoint({}, f)).status, "error");
    assert.equal(h.rpcs.length, 0);
  }
  const h = actions(true, true);
  assert.equal((await h.submitCheckpoint({}, form())).status, "error");
});


test("automatic study position is owner-scoped, validates the topic and skips guests", async () => {
 const h=actions();
 assert.equal(await h.saveStudyPlace('understanding-projects'),true);
 assert.equal(h.writes[0].value.user_id,'verified-user');
 assert.equal(h.writes[0].value.module_id,'module');
 assert.equal(h.writes[0].options.onConflict,'user_id');
 const guest=actions(false);assert.equal(await guest.saveStudyPlace('understanding-projects'),false);assert.equal(guest.writes.length,0);
 assert.equal(await h.saveStudyPlace('../invalid'),false);assert.equal(h.writes.length,1);
 assert.equal(await actions(true,true).saveStudyPlace('understanding-projects'),false);
});
