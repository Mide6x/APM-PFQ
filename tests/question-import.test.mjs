import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateQuestionBatches, generateQuestionSeed } from '../scripts/import-questions.mjs';
const batch=JSON.parse(readFileSync(new URL('../content/questions/phase5-v1.json',import.meta.url),'utf8'));
const lessons=JSON.parse(readFileSync(new URL('../content/lessons.json',import.meta.url),'utf8'));
test('versioned question batch validates all 15 topics, four levels and repeatable seed',()=>{
 const questions=validateQuestionBatches([batch],lessons);
 assert.equal(questions.length,30);assert.equal(new Set(questions.map(q=>q.lessonId)).size,15);
 assert.equal(new Set(questions.map(q=>q.difficulty)).size,4);
 execFileSync(process.execPath,['scripts/import-questions.mjs','--check']);
 const changed=structuredClone(questions);changed[0].stem="A learner's question?";
 assert.ok(generateQuestionSeed(changed,lessons).includes("A learner''s question?"));
});
test('import rejects duplicates, unknown topics/prerequisites/references and incomplete grading content',()=>{
 for(const change of [
  b=>b.questions.push(structuredClone(b.questions[0])),
  b=>b.questions[1].stem=b.questions[0].stem.toUpperCase()+'!!!',
  b=>b.questions[0].lessonId='missing',
  b=>b.questions[0].requiredLessonIds.push('missing'),
  b=>b.questions[0].requiredLessonIds=[],
  b=>b.questions[0].requiredLessonIds.push(b.questions[0].lessonId),
  b=>b.questions[0].syllabusRefs=['99.1'],
  b=>b.questions[0].explanation=' ',
  b=>b.questions[0].correctOptionId='missing',
  b=>b.questions[0].choices.pop(),
  b=>b.questions[0].choices[1].id=b.questions[0].choices[0].id,
  b=>b.questions[0].choices[1].text=b.questions[0].choices[0].text+'!',
  b=>b.questions[0].version=0,
  b=>delete b.questions[0].published,
  b=>b.questions[0].difficulty='Expert',
 ]){const invalid=structuredClone(batch);change(invalid);assert.throws(()=>validateQuestionBatches([invalid],lessons));}
 assert.throws(()=>validateQuestionBatches([batch,batch],lessons));
});
