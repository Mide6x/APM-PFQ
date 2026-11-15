import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compile=file=>ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const listing={id:'PFQ-0002',status:'Ready',required_lessons:[{id:'project-environment'},{id:'business-case'}]};
const question={id:'PFQ-0002',version:1,stem:'Private stem',choices:[{id:'a',text:'Choice'}]};
function reads({signedIn=true,configured=true,complete=['project-environment','business-case'],status='ready'}={}) {
 const rpcs=[],queries=[];
 const client={rpc:async(name,args)=>{rpcs.push({name,args});return {data:name==='get_question_catalogue'?[listing]:question};},from:()=>{
  const query={select:(...args)=>{queries.push(['select',...args]);return query},eq:(...args)=>{queries.push(['eq',...args]);return query},order:()=>query,range:async(...args)=>{queries.push(['range',...args]);return {data:[],count:0}}};return query;
 }};
 const exports={};new Function('require','exports',compile('../lib/questions.ts'))(name=>({
  'server-only':{},react:{cache:fn=>fn},'@/lib/auth/server':{getViewer:async()=>signedIn?{id:'verified-owner'}:null,createAuthClient:async()=>client},
  '@/lib/supabase':{createSupabase:()=>configured?client:null},'@/lib/progress':{getLearningProgress:async()=>({status:signedIn?status:'guest',publishedLessonIds:['project-environment','business-case'],completedLessonIds:complete})},
 }[name]),exports);return {...exports,rpcs,queries};
}
test('server reads deny guests, partial prerequisites and failed progress before fetching a stem',async()=>{
 for(const options of [{signedIn:false},{complete:['project-environment']},{status:'error'}]){
  const h=reads(options);assert.notEqual((await h.getPracticeQuestion('PFQ-0002')).status,'ready');
  assert.deepEqual(h.rpcs.map(x=>x.name),['get_question_catalogue']);
 }
 const h=reads();assert.equal((await h.getPracticeQuestion('../unsafe')).status,'missing');assert.equal(h.rpcs.length,0);
});
test('server reads use authenticated projection and owner-scoped, paginated history',async()=>{
 const h=reads();assert.equal((await h.getPracticeQuestion('PFQ-0002')).status,'ready');
 assert.equal(h.rpcs[1].name,'get_practice_question');
 await h.getQuestionAttempts('PFQ-0002',2);
 assert.ok(h.queries.some(x=>x[0]==='eq'&&x[1]==='user_id'&&x[2]==='verified-owner'));
 assert.deepEqual(h.queries.find(x=>x[0]==='range'),['range',10,19]);
 assert.ok(!h.queries.find(x=>x[0]==='select')[1].includes('feedback'));
});
function action({signedIn=true,unlocked=true,fail=false}={}) {
 const calls=[];const client={rpc:async(name,args)=>{calls.push({name,args});return {error:fail?{}:null,data:{correct:false,selectedOptionId:'a',correctOptionId:'b',explanation:'After submission'}}}};
 const exports={};new Function('require','exports',compile('../app/questions/[id]/actions.ts'))(name=>({
  'next/cache':{revalidatePath:()=>{}},'@/lib/auth/server':{getViewer:async()=>signedIn?{id:'verified-owner'}:null,createAuthClient:async()=>client},
  '@/lib/questions':{getPracticeQuestion:async()=>unlocked?{status:'ready',question}:{status:'locked'}},
 }[name]),exports);return {...exports,calls};
}
function form(){const f=new FormData();for(const [k,v] of Object.entries({questionId:'PFQ-0002',version:'1',attemptId:'80000000-0000-4000-8000-000000000001',optionId:'a',score:'100',user_id:'forged'}))f.set(k,v);return f;}
test('question submission derives identity/access and never accepts a supplied result',async()=>{
 const h=action();assert.equal((await h.submitQuestion({},form())).status,'graded');
 assert.deepEqual(h.calls[0],{name:'submit_practice_question',args:{p_question_id:'PFQ-0002',p_version:1,p_attempt_id:'80000000-0000-4000-8000-000000000001',p_option_id:'a'}});
 for(const options of [{signedIn:false},{unlocked:false},{fail:true}])assert.equal((await action(options).submitQuestion({},form())).status,'error');
 for(const mutate of [f=>f.append('optionId','b'),f=>f.set('optionId','unknown'),f=>f.set('version','9'),f=>f.set('attemptId','bad'),f=>f.set('questionId','../bad')]){
  const h=action(),f=form();mutate(f);assert.equal((await h.submitQuestion({},f)).status,'error');assert.equal(h.calls.length,0);
 }
});

test('question setup state works without credentials and protected routes receive cache controls',async()=>{
 const h=reads({signedIn:false,configured:false});
 assert.equal((await h.getQuestionCatalogue()).status,'not-configured');
 assert.equal((await h.getPracticeQuestion('PFQ-0001')).status,'not-configured');
 assert.equal(h.rpcs.length,0);
 const middleware=readFileSync(new URL('../middleware.ts',import.meta.url),'utf8');
 assert.ok(middleware.includes('"/questions/:path*"'));
 assert.ok(middleware.includes('private, no-store, max-age=0'));
});
