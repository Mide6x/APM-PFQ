import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file,extra){const exports={};const code=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','exports',code)(name=>name.endsWith('.css')?{default:{}}:Object.hasOwn(extra,name)?extra[name]:require(name),exports);return exports;}
test('a returning quiz shows its saved zero score and Retake action, not an unanswered form',()=>{
 const {Checkpoint}=load('../components/checkpoint.tsx',{'@/app/modules/[slug]/actions':{submitCheckpoint:async()=>{throw Error('No submission during render')}}});
 const html=renderToStaticMarkup(React.createElement(Checkpoint,{questions:[],lessonId:'project-environment',version:2,slug:'understanding-projects',initialAttemptId:'80000000-0000-4000-8000-000000000001',previousResult:{score:0,total:5}}));
 assert.match(html,/Quiz completed/);assert.match(html,/0 \/ 5/);assert.match(html,/Retake quiz/);assert.ok(!html.includes('<form'));
});
test('a solved bank question remains visibly solved on return with an explicit retry',()=>{
 const {QuestionAttempt}=load('../components/question-attempt.tsx',{'@/app/questions/[id]/actions':{submitQuestion:async()=>{throw Error('No submission during render')}}});
 const html=renderToStaticMarkup(React.createElement(QuestionAttempt,{question:{id:'PFQ-0001',version:1,stem:'Question',choices:[]},initialAttemptId:'80000000-0000-4000-8000-000000000001',previousStatus:'Solved'}));
 assert.match(html,/Question solved/);assert.match(html,/Retry question/);assert.ok(!html.includes('<form'));
});
