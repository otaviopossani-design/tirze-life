const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(path.join(process.env.LOCALAPPDATA,'Temp','tirze-life-runtime','apps','mobile','node_modules','playwright')));}
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.resolve(root,'../../.local/previews');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 context.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const response=await page.goto('http://localhost:8082',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  assert.match(response.headers()['x-robots-tag'],/noindex/);
  await page.getByRole('heading',{level:1}).waitFor();
  assert.equal(await page.getByRole('heading',{level:1}).count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('[data-event="audience_clinic"]').count(),1);assert.equal(await page.locator('[data-event="audience_patient"]').count(),1);
  await page.screenshot({path:path.join(out,'landing-desktop.png'),fullPage:true});
  await page.getByRole('tab',{name:'Movimento',exact:true}).click();
  assert.equal(await page.locator('#panel-movement').isVisible(),true);
  assert.equal(await page.locator('#panel-nutrition').isVisible(),false);
  await page.getByRole('tab',{name:'Movimento',exact:true}).press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'Clínica',exact:true}).getAttribute('aria-selected'),'true');
  assert.ok((await page.locator('#panel-clinic a').getAttribute('href')).includes(':8081/clinica'));
  const faq=page.locator('.faq details').first();await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),'');
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.getByRole('button',{name:'Menu'}).click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').isVisible(),false);
   await page.screenshot({path:path.join(out,'landing-mobile-'+width+'.png'),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  const info=await (await context.request.get('http://localhost:8082/build-info.json')).json();
  const titles=new Set(),descriptions=new Set();let totalImages=0;const internal=new Set();
  for(const route of info.pages){
   const r=await page.goto('http://localhost:8082'+route,{waitUntil:'networkidle'});assert.equal(r.status(),200);
   const data=await page.evaluate(()=>({
    title:document.title,description:document.querySelector('meta[name=description]')?.content,h1:document.querySelectorAll('h1').length,
    graph:JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
    images:[...document.images].map(i=>({alt:i.hasAttribute('alt'),w:i.getAttribute('width'),h:i.getAttribute('height')})),
    links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))
   }));
   assert.ok(data.title&&data.description);assert.equal(data.h1,1);assert.equal(titles.has(data.title),false);assert.equal(descriptions.has(data.description),false);
   titles.add(data.title);descriptions.add(data.description);assert.ok(data.graph['@graph'].length>=3);
   for(const img of data.images){assert.ok(img.alt&&img.w&&img.h);totalImages++;}
   for(const href of data.links)if(href.startsWith('/'))internal.add(href);
   await page.setViewportSize({width:320,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,route+' overflows');
   await page.setViewportSize({width:1440,height:1000});
  }
  for(const href of internal){const [pathname,hash]=href.split('#');const r=await context.request.get('http://localhost:8082'+pathname);assert.equal(r.status(),200,href);
   if(hash)assert.ok((await r.text()).includes('id="'+hash+'"'),href+' missing target');
  }
  const missing=await context.request.get('http://localhost:8082/not-a-page');assert.equal(missing.status(),404);
  const redirect=await context.request.get('http://localhost:8082/clinicas',{maxRedirects:0});assert.equal(redirect.status(),308);
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();
  await staticPage.goto('http://localhost:8082/');assert.ok(await staticPage.getByRole('heading',{level:1}).isVisible());
  await staticPage.getByRole('link',{name:'Sou uma clínica',exact:true}).click();assert.ok(staticPage.url().endsWith('/clinicas/'));await nojs.close();
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(root,'validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),pages:info.pages.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,imagesChecked:totalImages,internalLinksChecked:internal.size,viewports:[1440,390,320],javascriptErrors:errors.length,status:'passed',note:'Local browser and HTML checks; not Google indexing, field Core Web Vitals or a Lighthouse score.'},null,2));
  console.log('PASS landing: 9 pages, unique SEO metadata, JSON-LD, links, images, tabs, keyboard, mobile 320/390, no-JS, redirects, 404 and no JS errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
