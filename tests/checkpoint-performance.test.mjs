import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { lessons } from '../lib/lessons.ts';
const compiled=ts.transpileModule(readFileSync(new URL('../lib/checkpoint-performance.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};
new Function('require','exports',compiled)(()=>({lessons}),exports);
const {summariseCheckpoints}=exports;
const versions=Object.fromEntries(lessons.map(l=>[l.id,l.version]));
const attempt=(index,score,total=5,version=2)=>({lesson_id:lessons[index].id,content_version:version,score,total,created_at:'2026-11-14T12:00:00Z',attempt_count:3});
test('latest current results aggregate across attempted stops, never treating unattempted as zero',()=>{
 const result=summariseCheckpoints(versions,[attempt(0,0),attempt(1,4)]);
 assert.equal(result.score,4);assert.equal(result.total,10);assert.equal(result.percentage,40);
 assert.equal(result.attempted,2);assert.equal(result.available,15);
 assert.equal(result.rows[0].latest.score,0);assert.equal(result.rows[2].latest,undefined);
 assert.deepEqual(result.rows.map(r=>r.stop),Array.from({length:15},(_,i)=>i+1));
});
test('earlier three-question sets retain history but never inflate current scores or coverage',()=>{
 const result=summariseCheckpoints(versions,[attempt(0,3,3,1),attempt(1,1)]);
 assert.equal(result.total,5);assert.equal(result.percentage,20);assert.equal(result.attempted,1);
 assert.equal(result.rows[0].previous.total,3);assert.equal(result.rows[0].attempts,3);
 assert.equal(summariseCheckpoints(versions,[]).percentage,null);
 assert.equal(summariseCheckpoints({...versions,[lessons[1].id]:1},[attempt(1,5)]).total,0);
});
