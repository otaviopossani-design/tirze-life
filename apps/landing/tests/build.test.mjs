import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build,validateConfig,root} from '../build.mjs';
const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const testRoot=path.join(root,'.test-output');
fs.mkdirSync(testRoot,{recursive:true});
test('preview has nine readable pages and no canonical or public sitemap',()=>{
 const result=build({outDir:path.join(testRoot,'preview')});assert.equal(result.pages,9);assert.equal(result.indexable,false);
 const html=fs.readFileSync(path.join(result.out,'index.html'),'utf8');
 assert.match(html,/<html lang="pt-BR">/);assert.match(html,/<meta name="robots" content="noindex,follow"/);
 assert.doesNotMatch(html,/rel="canonical"/);assert.equal(fs.existsSync(path.join(result.out,'sitemap.xml')),false);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.ok(graph['@graph'].some(n=>n['@type']==='Organization'));assert.doesNotMatch(html,/AggregateRating|FAQPage|<meta name="keywords"/);
});
test('indexing requires confirmed public settings, real contact and explicit readiness',()=>{
 for(const patch of [{indexable:true},{indexable:true,publicOrigin:'https://tirzelife.example',launchReady:true},{indexable:true,publicOrigin:'https://tirzelife.example',launchReady:true,contactEmail:'team@tirzelife.example'}]){
  assert.throws(()=>validateConfig({...config,...patch}));
 }
 assert.throws(()=>validateConfig({...config,publicOrigin:'http://example.com'}));
 assert.throws(()=>validateConfig({...config,appBaseUrl:'javascript:alert(1)'}));
});
test('production build emits canonical URLs, sitemap and consistent structured data',()=>{
 const file=path.join(testRoot,'public-config.json');
 fs.writeFileSync(file,JSON.stringify({...config,indexable:true,launchReady:true,publicOrigin:'https://tirzelife.example',appBaseUrl:'https://app.tirzelife.example',contactEmail:'team@tirzelife.example'}));
 const result=build({configPath:file,outDir:path.join(testRoot,'public')});
 const map=fs.readFileSync(path.join(result.out,'sitemap.xml'),'utf8');
 assert.equal((map.match(/<loc>/g)||[]).length,9);assert.doesNotMatch(map,/localhost|404/);
 const html=fs.readFileSync(path.join(result.out,'clinicas/index.html'),'utf8');
 assert.match(html,/rel="canonical" href="https:\/\/tirzelife.example\/clinicas\/"/);
 assert.match(html,/index,follow,max-image-preview:large/);assert.match(html,/https:\/\/app.tirzelife.example\/clinica/);
 assert.match(html,/mailto:team@tirzelife.example/);
 const article=fs.readFileSync(path.join(result.out,'conteudos/registro-de-peso-e-movimento/index.html'),'utf8');
 const graph=JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.ok(graph.some(n=>n['@type']==='Article'));assert.ok(graph.some(n=>n['@type']==='BreadcrumbList'));
});
test('switching a build back to preview removes stale public sitemap',()=>{
 const out=path.join(testRoot,'reset');const file=path.join(testRoot,'reset-config.json');
 fs.writeFileSync(file,JSON.stringify({...config,indexable:true,launchReady:true,publicOrigin:'https://tirzelife.example',appBaseUrl:'https://app.tirzelife.example',contactEmail:'team@tirzelife.example'}));
 build({configPath:file,outDir:out});assert.equal(fs.existsSync(path.join(out,'sitemap.xml')),true);
 build({outDir:out});assert.equal(fs.existsSync(path.join(out,'sitemap.xml')),false);
});

test('configured social profiles are linked, escaped and included in sameAs',()=>{
 const profiles={instagramUrl:'https://www.instagram.com/tirzelife.demo/',facebookUrl:'https://www.facebook.com/tirzelife.demo/',tiktokUrl:'https://www.tiktok.com/@tirzelife.demo'};
 const file=path.join(testRoot,'social-config.json');
 fs.writeFileSync(file,JSON.stringify({...config,...profiles}));
 const result=build({configPath:file,outDir:path.join(testRoot,'social')});
 const html=fs.readFileSync(path.join(result.out,'index.html'),'utf8');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.deepEqual(graph.find(n=>n['@type']==='Organization').sameAs,Object.values(profiles));
 for(const url of Object.values(profiles))assert.ok(html.includes('href="'+url+'"'));
 for(const key of ['facebookUrl','tiktokUrl'])assert.throws(()=>validateConfig({...config,[key]:'https://example.com/'}));
});
