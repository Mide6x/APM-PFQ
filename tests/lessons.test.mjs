import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { lessons, getLesson, getStudyPosition } from "../lib/lessons.ts";

const questions=JSON.parse(readFileSync(new URL('../content/checkpoints.json',import.meta.url),'utf8'));
test("all 15 guide stops have original lessons and repeatable, validated checkpoint seeds",()=>{
 assert.equal(lessons.length,15);
 assert.equal(questions.length,75);
 execFileSync(process.execPath,['scripts/generate-phase4-seed.mjs','--check'],{cwd:new URL('..',import.meta.url),stdio:'pipe'});
 assert.equal(getLesson('2.1.1').guidePages,'8–9');
 assert.ok(getLesson('2.1.1').syllabusRefs.includes('1.6'));
 assert.equal(getLesson(null),undefined);
});
test("recommendations follow the published guide order and require explicit completion",()=>{
 const modules=lessons.map(l=>({id:l.id,slug:l.id,title:l.title,guide_section:l.guideSection}));
 const published=lessons.map(l=>l.id);
 assert.equal(getStudyPosition(modules,published,[]).next.id,lessons[0].id);
 const afterFirst=getStudyPosition(modules,published,[lessons[0].id]);
 assert.deepEqual(afterFirst.completedSections,['2.1.1']);
 assert.equal(afterFirst.next.id,lessons[1].id);
 const filtered=getStudyPosition(modules,published.slice(1),[lessons[0].id]);
 assert.equal(filtered.completedSections.length,0);
 assert.equal(filtered.next.id,lessons[1].id);
 assert.equal(getStudyPosition(modules,published,published).next,undefined);
 assert.equal(getStudyPosition(modules,[],published).total,0);
});
test("pre-submit questions contain only stable IDs, stems and choices",()=>{
 const code=ts.transpileModule(readFileSync(new URL('../lib/checkpoints.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const exports={};
 new Function('require','exports',code)((name)=>name==='server-only'?{}:{default:questions},exports);
 const data=exports.getCheckpointQuestions('project-environment');
 assert.equal(data.length,5);
 for(const q of data){assert.deepEqual(Object.keys(q).sort(),['choices','id','stem']);assert.equal(q.choices.length,4);for(const c of q.choices)assert.deepEqual(Object.keys(c).sort(),['id','text']);}
 assert.equal(JSON.stringify(data).includes(questions[0].explanation),false);
 assert.equal(exports.getCheckpointQuestions('not-published').length,0);
});
