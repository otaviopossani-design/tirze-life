const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(path.join(process.env.LOCALAPPDATA,'Temp','tirze-life-runtime/apps/mobile/node_modules/playwright')));}
const root=path.resolve(__dirname,'..'),out=path.join(root,'.local/previews');
function lum(color){const a=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[];const results=[];
 try{
 const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const [route,name] of [['/','patient'],['/clinica','clinic']]){
  await p.goto('http://localhost:8081'+route,{waitUntil:'networkidle',timeout:120000});await p.locator('.tl-app').waitFor();
  await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(()=>document.fonts.load('16px Inter'));
  assert.ok(await p.evaluate(()=>[...document.fonts].some(f=>f.family==='Inter'&&f.status==='loaded')),'Inter loaded in '+name);
  for(const [label,id] of [['Claro','clean'],['Escuro','dark'],['Suave','warm']]){
   await p.getByRole('button',{name:label,exact:true}).click();
   assert.equal(await p.locator('.tl-app').getAttribute('data-theme'),id);
   const colors=await p.locator('.tl-app').evaluate(e=>{const s=getComputedStyle(e);const probe=document.createElement('span');probe.style.color=s.getPropertyValue('--accent');e.append(probe);const accent=getComputedStyle(probe).color;probe.style.color=s.getPropertyValue('--muted');const muted=getComputedStyle(probe).color;probe.remove();return{bg:s.backgroundColor,text:s.color,accent,muted};});
   for(const key of ['text','accent','muted'])assert.ok(contrast(colors.bg,colors[key])>=4.5,name+' '+id+' '+key+' contrast');
   results.push({surface:name,theme:id,textContrast:contrast(colors.bg,colors.text),mutedContrast:contrast(colors.bg,colors.muted),accentContrast:contrast(colors.bg,colors.accent)});
   for(const width of [390,320]){
    await p.setViewportSize({width,height:844});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' '+id+' overflow '+width);
    const nav=p.locator('.tl-mobile-nav');
    const sizes=await nav.locator('button').evaluateAll(list=>list.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})));
    assert.ok(sizes.every(b=>b.w>=44&&b.h>=44),name+' touch targets '+width);
    if(id==='clean'&&width===390)await p.screenshot({path:path.join(out,name+'-brand-mobile.png')});
   }
   await p.setViewportSize({width:1440,height:1000});
  }
  await p.getByRole('button',{name:'Claro',exact:true}).click();
  await p.screenshot({path:path.join(out,name+'-brand-desktop.png')});
  await p.keyboard.press('Control+Home');await p.locator('.tl-skip').focus();await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'conteudo-principal');
  await p.setViewportSize({width:390,height:844});
  const nav=p.locator('.tl-mobile-nav');
  await nav.getByRole('button',{name:name==='patient'?'Plano alimentar':'Pacientes',exact:true}).click();
  assert.ok(p.url().includes('view='));await p.setViewportSize({width:1440,height:1000});
 }
 // Fresh demo context only: no user session or personal records.
 const shots=[['/?view=nutrition','nutrition.jpg',230],['/?view=activity','movement.jpg',230],['/clinica','clinic.jpg',238]];
 const dimensions={};
 for(const [route,file,x] of shots){
  await p.goto('http://localhost:8081'+route,{waitUntil:'networkidle'});await p.locator('.tl-app').waitFor();await p.evaluate(()=>document.fonts.ready);
  await p.getByRole('button',{name:'Claro',exact:true}).click();await p.screenshot({path:path.join(root,'apps/landing/src/assets',file),type:'jpeg',quality:86,clip:{x,y:64,width:1440-x,height:800}});
  dimensions[file]={width:1440-x,height:800};
 }
 for(const name of ['modelo-feed','modelo-vertical','modelo-compartilhamento']){
  await p.goto(pathToFileURL(path.join(root,'docs/brand',name+'.html')).href);await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>document.fonts.load('600 90px Inter'));
  const frame=p.locator('.frame');await frame.screenshot({path:path.join(root,'docs/brand',name+'.png')});
 }
 fs.copyFileSync(path.join(root,'docs/brand/modelo-compartilhamento.png'),path.join(root,'apps/landing/src/assets/social-card.png'));
 const dimensionsPath=path.join(root,'apps/landing/src/assets/dimensions.json');
 const old=JSON.parse(fs.readFileSync(dimensionsPath,'utf8'));fs.writeFileSync(dimensionsPath,JSON.stringify({...old,...dimensions},null,2)+'\n');
 await p.goto(pathToFileURL(path.join(root,'docs/brand/index.html')).href);await p.evaluate(()=>document.fonts.ready);
 for(const width of [1440,390,320]){
  await p.setViewportSize({width,height:1000});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===1440)await p.screenshot({path:path.join(out,'brand-guide.png')});
 }
 await p.getByRole('button',{name:'Escuro',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Escuro',exact:true}).getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(root,'docs/brand/validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'Selected contrast pairs, local font, themes, mobile navigation, skip links, guide and template exports; not a complete accessibility audit.',results,errors},null,2)+'\n');
 console.log('PASS: Inter locally loaded; 3 themes; patient/clinic 320 and 390 px; mobile targets 44 px; selected contrasts; skip links; refreshed screenshots; 3 social PNGs; brand guide.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
