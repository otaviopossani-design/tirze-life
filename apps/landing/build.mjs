import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPages } from './src/content.mjs';
export const root=path.dirname(fileURLToPath(import.meta.url));
export const escapeHtml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function httpsOrigin(value,name) {
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!url.hostname.includes('.')||/^(localhost|127\.)/.test(url.hostname))throw Error(name+' deve ser uma origem HTTPS pública, sem caminho ou parâmetros.');
 return url.origin;
}
export function validateConfig(config){
 if(!config.brand||typeof config.indexable!=='boolean')throw Error('Configuração de marca e indexação obrigatória.');
 const app=new URL(config.appBaseUrl);
 if(!['http:','https:'].includes(app.protocol)||app.username||app.password||app.search||app.hash||app.pathname!=='/')throw Error('appBaseUrl deve conter apenas uma origem HTTP/HTTPS.');
 if(config.publicOrigin)httpsOrigin(config.publicOrigin,'publicOrigin');
 if(config.contactEmail&&!/^[^\s<>@"']+@[^\s<>@"']+\.[^\s<>@"']+$/.test(config.contactEmail))throw Error('E-mail comercial inválido.');
 if(config.whatsapp&&!/^\d{10,15}$/.test(config.whatsapp))throw Error('WhatsApp deve conter país, DDD e número, apenas dígitos.');
 if(config.instagramUrl&&!/^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/.test(config.instagramUrl))throw Error('URL do Instagram inválida.');
 for(const [key,pattern] of [['facebookUrl',/^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/],['tiktokUrl',/^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/]]){
  if(config[key]&&!pattern.test(config[key]))throw Error('URL social invalida: '+key);
 }
 if(config.googleSiteVerification&&!/^[a-zA-Z0-9_-]+$/.test(config.googleSiteVerification))throw Error('Código de verificação inválido.');
 if(config.indexable){
  if(!config.publicOrigin||!config.launchReady)throw Error('Indexação exige domínio confirmado e launchReady após revisão de lançamento.');
  if(!config.contactEmail&&!config.whatsapp)throw Error('Indexação exige contato comercial real.');
  httpsOrigin(config.appBaseUrl,'appBaseUrl');
 }
 return {...config,publicOrigin:config.publicOrigin?new URL(config.publicOrigin).origin:'',appBaseUrl:app.origin};
}
export function build(options={}){
 const configPath=options.configPath??path.join(root,'site.config.json');
 const out=path.resolve(options.outDir??path.join(root,'dist'));
 const config=validateConfig(JSON.parse(fs.readFileSync(configPath,'utf8')));
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});
 for(const file of fs.readdirSync(path.join(root,'src/assets')))fs.copyFileSync(path.join(root,'src/assets',file),path.join(out,'assets',file));
 fs.copyFileSync(path.join(root,'src/site.css'),path.join(out,'assets/site.css'));
 fs.copyFileSync(path.join(root,'src/site.js'),path.join(out,'assets/site.js'));
 const contactHref=config.whatsapp?'https://wa.me/'+config.whatsapp:config.contactEmail?'mailto:'+config.contactEmail:'';
 const pages=getPages({appBaseUrl:escapeHtml(config.appBaseUrl),contactHref:escapeHtml(contactHref)});
 const dimensions=JSON.parse(fs.readFileSync(path.join(root,'src/assets/dimensions.json'),'utf8'));
 for(const page of pages)page.body=page.body.replace(/src="\/assets\/([^"]+)" width="\d+" height="\d+"/g,(full,file)=>{
  const d=dimensions[file];return d?'src="/assets/'+file+'" width="'+d.width+'" height="'+d.height+'"':full;
 });
 const absolute=p=>config.publicOrigin?config.publicOrigin+p:p;
 const nav=[['/clinicas/','Para clínicas'],['/pacientes/','Para você'],['/#plataforma','A plataforma'],['/conteudos/','Conteúdos']];
 const brand='<a class="brand" href="/" aria-label="Tirzelife, início"><img src="/assets/brand.svg" width="38" height="38" alt=""><span>tirze<em>life</em></span></a>';
 function render(page,notFound=false){
  const title=escapeHtml(page.title),description=escapeHtml(page.description);
  const trail=page.path==='/'||notFound?'': '<nav class="wrap breadcrumb" aria-label="Caminho da página"><a href="/">Início</a><span aria-hidden="true">/</span>'+(page.article?'<a href="/conteudos/">Guias</a><span aria-hidden="true">/</span>':'')+'<span>'+escapeHtml(page.article?'Guia':page.path==='/clinicas/'?'Para clínicas':page.path==='/pacientes/'?'Para você':page.path==='/conteudos/'?'Guias':page.path==='/sobre/'?'Sobre':'Privacidade')+'</span></nav>';
  const schemaBase=config.publicOrigin||'http://localhost:8082';
  const graph=[
   {'@type':'Organization','@id':schemaBase+'/#organization',name:'Tirzelife',url:schemaBase+'/',logo:schemaBase+'/assets/brand.svg',...([config.instagramUrl,config.facebookUrl,config.tiktokUrl].some(Boolean)?{sameAs:[config.instagramUrl,config.facebookUrl,config.tiktokUrl].filter(Boolean)}:{})},
   {'@type':'WebSite','@id':schemaBase+'/#website',name:'Tirzelife',url:schemaBase+'/',inLanguage:'pt-BR',publisher:{'@id':schemaBase+'/#organization'}},
   {'@type':page.article?'Article':'WebPage','@id':schemaBase+page.path+'#page',url:schemaBase+page.path,name:page.title,description:page.description,inLanguage:'pt-BR',isPartOf:{'@id':schemaBase+'/#website'},...(page.article?{headline:page.title.replace(' | Tirzelife',''),datePublished:config.updatedAt+'T09:00:00-03:00',dateModified:config.updatedAt+'T09:00:00-03:00',author:{'@type':'Organization',name:'Tirzelife',url:schemaBase+'/sobre/'},publisher:{'@id':schemaBase+'/#organization'},image:schemaBase+'/assets/social-card.png'}:{})}
  ];
  if(page.path!=='/'&&!notFound){
   const items=[{name:'Início',item:schemaBase+'/'}];
   if(page.article)items.push({name:'Guias',item:schemaBase+'/conteudos/'});
   items.push({name:page.title.split(' | ')[0],item:schemaBase+page.path});
   graph.push({'@type':'BreadcrumbList',itemListElement:items.map((v,i)=>({'@type':'ListItem',position:i+1,...v}))});
  }
  const robots=config.indexable&&!notFound?'index,follow,max-image-preview:large':'noindex,follow';
  const navHtml=nav.map(([href,label])=>'<a href="'+href+'"'+(page.path===href?' aria-current="page"':'')+'>'+label+'</a>').join('');
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="'+description+'"><meta name="robots" content="'+robots+'"><meta name="theme-color" content="#0369a1">'+
  (config.publicOrigin&&!notFound?'<link rel="canonical" href="'+escapeHtml(absolute(page.path))+'">':'')+
  (config.googleSiteVerification?'<meta name="google-site-verification" content="'+escapeHtml(config.googleSiteVerification)+'">':'')+
  '<meta property="og:locale" content="pt_BR"><meta property="og:type" content="'+(page.article?'article':'website')+'"><meta property="og:site_name" content="Tirzelife"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+description+'">'+
  (config.publicOrigin?'<meta property="og:url" content="'+escapeHtml(absolute(page.path))+'">':'')+
  '<meta property="og:image" content="'+escapeHtml(absolute('/assets/social-card.png'))+'"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Tirzelife: mais cuidado dentro da vida real."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+title+'"><meta name="twitter:description" content="'+description+'"><meta name="twitter:image" content="'+escapeHtml(absolute('/assets/social-card.png'))+'"><link rel="icon" href="/assets/brand.svg" type="image/svg+xml"><link rel="preload" href="/assets/InterVariable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/brand.css"><link rel="stylesheet" href="/assets/site.css"><script defer src="/assets/site.js"></script>'+
  (notFound?'':'<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>')+
  '</head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a><header class="site-header"><div class="wrap header-inner">'+brand+'<nav class="desktop-nav" aria-label="Navegação principal">'+navHtml+'<a class="button small" href="/#experimentar" data-event="header_demo">Conhecer a demo <span aria-hidden="true">↗</span></a></nav><button class="mobile-toggle" aria-expanded="false" aria-controls="mobile-menu">Menu <span aria-hidden="true">☰</span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Navegação móvel" hidden>'+navHtml+'<a href="/#experimentar">Conhecer a demonstração</a></nav></header><main id="conteudo" tabindex="-1">'+trail+page.body.replace('<section class="cta-section">','<section class="cta-section" id="experimentar">')+'</main><footer class="site-footer"><div class="wrap"><div class="footer-top"><div>'+brand+'<p>Alimentação, movimento e cuidado.<br>Dentro da vida real.</p><p>Plataforma em demonstração.<br>As imagens exibem dados fictícios.</p></div><nav class="footer-links" aria-label="Jornadas"><strong>Encontre o seu caminho</strong><a href="/clinicas/">Para clínicas</a><a href="/pacientes/">Para você</a><a href="/conteudos/">Guias da plataforma</a></nav><nav class="footer-links" aria-label="Institucional"><strong>Com clareza</strong><a href="/sobre/">Sobre a Tirzelife</a><a href="/privacidade/">Privacidade na demonstração</a>'+(config.instagramUrl?'<a href="'+escapeHtml(config.instagramUrl)+'">Instagram</a>':'')+(config.facebookUrl?'<a href="'+escapeHtml(config.facebookUrl)+'">Facebook</a>':'')+(config.tiktokUrl?'<a href="'+escapeHtml(config.tiktokUrl)+'">TikTok</a>':'')+(contactHref?'<a href="'+escapeHtml(contactHref)+'" data-event="contact_click">Contato comercial</a>':'')+'</nav></div><div class="footer-bottom"><span>© 2026 Tirzelife · Projeto em desenvolvimento.</span><span>Conteúdo educativo. Não substitui acompanhamento profissional.</span></div></div></footer></body></html>';
 }
 for(const page of pages){const dir=path.join(out,page.path);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),render(page));}
 fs.writeFileSync(path.join(out,'404.html'),render({path:'/404/',title:'Página não encontrada | Tirzelife',description:'Encontre o conteúdo que procura na página inicial da Tirzelife.',body:'<section class="notfound"><span class="eyebrow">ERRO 404</span><h1>Este caminho mudou.</h1><p>A página solicitada não foi encontrada. Você pode continuar pela página inicial ou explorar nossos guias.</p><a class="button" href="/">Voltar ao início ↗</a></section>'},true));
 const urls=pages.map(p=>absolute(p.path));
 const sitemap=path.join(out,'sitemap.xml');
 if(config.indexable)fs.writeFileSync(sitemap,'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+escapeHtml(url)+'</loc><lastmod>'+config.updatedAt+'</lastmod></url>').join('')+'</urlset>\n');
 else if(fs.existsSync(sitemap))fs.unlinkSync(sitemap);
 fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\n'+(config.indexable?'Sitemap: '+config.publicOrigin+'/sitemap.xml\n':'# Demonstracao: paginas usam noindex; nenhum sitemap publico ainda.\n'));
 fs.writeFileSync(path.join(out,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n'+(!config.indexable?'  X-Robots-Tag: noindex, follow\n':''));
 fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({brand:'Tirzelife',indexable:config.indexable,pages:pages.map(p=>p.path),publicOrigin:config.publicOrigin,updatedAt:config.updatedAt},null,2));
 return {out,pages:pages.length,indexable:config.indexable};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const option=name=>{const at=process.argv.indexOf(name);return at>=0?process.argv[at+1]:undefined;};
 try{console.log(JSON.stringify(build({configPath:option('--config'),outDir:option('--out')})));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
