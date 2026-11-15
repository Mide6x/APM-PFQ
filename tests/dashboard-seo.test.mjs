import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { siteUrl, publicPageMetadata } from '../lib/site.ts';
import { checkpointPanelOpen, CHECKPOINT_PANEL_MAX_AGE } from '../lib/ui-preferences.ts';
const require=createRequire(import.meta.url);
function compiled(file,deps={}){const code=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;const exports={};new Function('require','exports',code)(name=>Object.hasOwn(deps,name)?deps[name]:require(name),exports);return exports;}
test('panel state accepts only the stored open value and has bounded retention',()=>{
 assert.equal(checkpointPanelOpen('open'),true);
 for(const value of ['closed','true','<script>',undefined])assert.equal(checkpointPanelOpen(value),false);
 assert.equal(CHECKPOINT_PANEL_MAX_AGE,90*24*60*60);
});
test('public metadata uses canonical production URLs and never invents a search verification key',()=>{
 const meta=publicPageMetadata('Project environment','Original lesson','/modules/understanding-projects');
 assert.equal(siteUrl,'https://apmprep.netlify.app');assert.equal(meta.alternates.canonical,'/modules/understanding-projects');
 assert.equal(meta.openGraph.type,'website');assert.match(meta.twitter.title,/Project environment/);
 assert.equal(meta.verification,undefined);
});
test('sitemap includes only public catalogue destinations and excludes personal/gated routes',async()=>{
 let result={status:'ready',modules:[{slug:'understanding-projects'}]};
 const sitemap=compiled('../app/sitemap.ts',{'@/lib/site':{siteUrl},'@/lib/supabase':{getStudyModules:async()=>result}}).default;
 assert.deepEqual((await sitemap()).map(x=>x.url),[siteUrl+'/',siteUrl+'/questions',siteUrl+'/privacy',siteUrl+'/modules/understanding-projects']);
 result={status:'error'};assert.equal((await sitemap()).length,3);
 const robots=compiled('../app/robots.ts',{'@/lib/site':{siteUrl}}).default();
 assert.ok(robots.rules.disallow.includes('/auth/'));assert.equal(robots.sitemap,siteUrl+'/sitemap.xml');
});
test('structured data safely encodes edited catalogue text instead of breaking out of its script',()=>{
 const {StructuredData}=compiled('../components/structured-data.tsx');
 const html=renderToStaticMarkup(React.createElement(StructuredData,{data:{name:'</script><script>alert(1)</script>'}}));
 assert.equal((html.match(/<script/g)||[]).length,1);assert.ok(html.includes('\\u003c/script>'));
});
test('dashboard data fails closed on missing progress and obtains aggregate metrics only for verified users',async()=>{
 let signedIn=false,calls=0;
 const {getAccountDashboard}=compiled('../lib/account-dashboard.ts',{
  'server-only':{},'@/lib/auth/server':{getViewer:async()=>signedIn?{id:'verified-owner'}:null,createAuthClient:async()=>({rpc:async(name)=>{calls++;assert.equal(name,'get_account_activity');return{data:{streak:1,serverNow:'2026-11-15T01:00:00Z'}}}})},
  '@/lib/progress':{getLearningProgress:async()=>({status:'error'}),getCheckpointPerformance:async()=>({status:'error'})},
  '@/lib/supabase':{getStudyModules:async()=>({status:'error'})},'@/lib/lessons':{getStudyPosition:()=>{throw Error('Should not derive progress from unavailable data')}},
  '@/lib/checkpoint-performance':{summariseCheckpoints:()=>{throw Error('No invented result')}},'@/lib/questions':{getQuestionCatalogue:async()=>({status:'error'})},
 });
 let result=await getAccountDashboard();assert.equal(calls,0);assert.equal(result.study.status,'error');assert.equal(result.activity.status,'error');
 signedIn=true;result=await getAccountDashboard();assert.equal(calls,1);assert.equal(result.activity.streak,1);assert.equal(result.checkpoints.status,'error');
});
