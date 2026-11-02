import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs/marketing');
const source=JSON.parse(fs.readFileSync(path.join(root,'calendario-instagram-30-dias.json'),'utf8'));
let guide=0;
const topics=['Revisar: o que acontece entre consultas','Preparar: histórico para conversar com a equipe','Revisar: diário alimentar com menos cobrança','Revisar: registro de medidas e movimento'];
const days=source.days.map(d=>{
 const channels=[{channel:'Instagram',format:d.format,time:d.time,adaptation:'Seguir roteiro e legenda do calendário original.',sourceDay:d.day}];
 if(d.format==='Reel')channels.push({channel:'TikTok',format:'Vídeo vertical',time:d.time,adaptation:'Abrir com uma dúvida ou tarefa. Usar narração própria, legendas e arquivo limpo. Revisar corte e chamada disponível na conta.'});
 if(d.weekday==='segunda-feira'&&d.format==='Reel')channels.push({channel:'Facebook',format:'Vídeo original',time:d.time,adaptation:'Acrescentar explicação autossuficiente na descrição; link para a página adequada somente após publicação do domínio.'});
 if(d.weekday==='terça-feira')channels.push({channel:'Facebook',format:'Sequência de imagens',time:d.time,adaptation:'Adaptar o carrossel com contexto e pergunta específica, sem induzir relatos de saúde em comentários públicos.'});
 if(d.weekday==='sexta-feira')channels.push({channel:'Facebook',format:'Foto e texto',time:d.time,adaptation:'Usar imagem própria e texto explicativo. Sem depoimento inventado.'});
 if(d.weekday==='quinta-feira')channels.push({channel:'Google / site',format:'Revisão editorial',time:null,adaptation:topics[guide++]??topics[3]});
 return {day:d.day,date:d.date,weekday:d.weekday,title:d.title,audience:d.audience,status:'rascunho',channels};
});
const data={brand:'Tirzelife',reviewedAt:'2026-10-22',timezone:'America/Sao_Paulo',status:'rascunho_sem_agendamento',note:'Horários experimentais. Preparar peças; adiar divulgação com links até existir domínio público. Etapas internas não são posts.',days};
fs.writeFileSync(path.join(root,'calendario-multicanal-30-dias.json'),JSON.stringify(data,null,2)+'\n');
let md='# Calendário multicanal — 30 dias\n\nRascunho de 26/10 a 24/11/2026. Fuso America/Sao_Paulo. Nenhum agendamento realizado. Horários são hipóteses de teste. Roteiros completos e legendas-base estão no [calendário de Instagram](calendario-instagram-30-dias.md).\n\n| Data | Tema | Canais e formatos |\n|---|---|---|\n';
for(const d of days)md+='| '+d.date.split('-').reverse().join('/')+' | '+d.title+' | '+d.channels.map(c=>c.channel+': '+c.format+(c.time?' às '+c.time:'')).join('; ')+' |\n';
md+='\n## Adaptações por dia\n\n';
for(const d of days){md+='### '+d.date+' — '+d.title+'\n\n';for(const c of d.channels)md+='- **'+c.channel+':** '+c.adaptation+'\n';md+='\n';}
md+='## Verificação antes de publicar\n\nConferir domínio, destino do contato, disponibilidade das funções mostradas, direitos das imagens/áudio, legendas, cortes e links. Conteúdo clínico requer revisão apropriada. Não publicar dados reais de pacientes. Ver [plano e fontes](plano-google-instagram-facebook-tiktok.md).\n';
fs.writeFileSync(path.join(root,'calendario-multicanal-30-dias.md'),md);
console.log('30 days prepared for Instagram, Facebook, TikTok and site editorial work.');
