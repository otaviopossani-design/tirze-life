const fs=require('node:fs');const path=require('node:path');const {pathToFileURL}=require('node:url');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(path.join(process.env.LOCALAPPDATA,'Temp','tirze-life-runtime','apps','mobile','node_modules','playwright')));}
(async()=>{
 const root=path.resolve(__dirname,'..'),assets=path.join(root,'src','assets');fs.mkdirSync(assets,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('tirzelife-visual-theme','clean');localStorage.setItem('tirzelife-clinic-theme','clean');});
 const page=await context.newPage(),dimensions={};
 async function shot(selector,name){
  const loc=page.locator(selector);await loc.waitFor();const box=await loc.boundingBox();
  await loc.screenshot({path:path.join(assets,name),type:'jpeg',quality:83,animations:'disabled'});
  dimensions[name]={width:Math.round(box.width),height:Math.round(box.height)};
 }
 try{
  await page.goto('http://localhost:8081',{waitUntil:'networkidle'});
  await shot('.nt-plan','nutrition.jpg');
  await page.goto('http://localhost:8081/?view=activity',{waitUntil:'networkidle'});
  await shot('.care-activity-grid','movement.jpg');
  await page.goto('http://localhost:8081/clinica',{waitUntil:'networkidle'});
  await page.locator('.cl-kpis').waitFor();
  await page.screenshot({path:path.join(assets,'clinic.jpg'),type:'jpeg',quality:83,clip:{x:260,y:90,width:1150,height:780},animations:'disabled'});
  dimensions['clinic.jpg']={width:1150,height:780};
  await page.setViewportSize({width:1200,height:630});
  await page.goto(pathToFileURL(path.join(root,'src','social-card.html')).href);
  await page.screenshot({path:path.join(assets,'social-card.png'),animations:'disabled'});
  dimensions['social-card.png']={width:1200,height:630};
  fs.writeFileSync(path.join(assets,'dimensions.json'),JSON.stringify(dimensions,null,2));
  console.log(JSON.stringify(dimensions));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
