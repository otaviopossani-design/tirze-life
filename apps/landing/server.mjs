import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {root} from './build.mjs';
const dist=path.join(root,'dist'),port=Number(process.env.LANDING_PORT??8082);
const types={'.woff2':'font/woff2','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, follow');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
 const target=path.resolve(dist,'.'+pathname);
 if(!target.startsWith(dist+path.sep)&&target!==dist){res.writeHead(403);res.end();return;}
 let file=target;
 try{
  if(fs.statSync(file).isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(308,{'Location':pathname+'/'+new URL(req.url,'http://localhost').search});res.end();return;}
   file=path.join(file,'index.html');
  }
  const body=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{
  const body=fs.readFileSync(path.join(dist,'404.html'));
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:body);
 }
});
server.listen(port,'127.0.0.1',()=>console.log('Tirzelife landing: http://localhost:'+port));
