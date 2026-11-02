import { z } from 'zod';
import { demoNutritionRecord } from './nutrition-demo';

export function localDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}
export function daysAgo(days:number, now=new Date()) { const d=new Date(now); d.setDate(d.getDate()-days); return localDate(d); }
export function weekStart(now=new Date()) { return daysAgo((now.getDay()+6)%7,now); }
export function ageAt(birth:string, today=localDate()) {
  let age=Number(today.slice(0,4))-Number(birth.slice(0,4));
  if(today.slice(5)<birth.slice(5)) age--;
  return age;
}
const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{
  const d=new Date(v+'T12:00:00'); return !Number.isNaN(d.getTime())&&localDate(d)===v;
},'Informe uma data válida.');
export const profileSchema=z.object({
  id:z.string().min(1).max(100), channel:z.enum(['clinic','individual']),
  name:z.string().trim().min(3,'Informe o nome completo.').max(100),
  birthDate:dateSchema.refine(v=>ageAt(v)>=18&&ageAt(v)<=120,'Esta versão atende adultos a partir de 18 anos. Revise o nascimento.'),
  email:z.union([z.literal(''),z.email('Revise o e-mail.')]),
  phone:z.string().max(30),
  heightCm:z.number().min(80,'Informe a altura em centímetros, por exemplo 165.').max(250,'Revise a altura em centímetros.'),
  weightKg:z.number().min(20,'Revise o peso em quilos.').max(500,'Revise o peso em quilos.'),
  goal:z.enum(['Saúde e disposição','Perda de peso acompanhada','Manutenção do peso']),
  level:z.enum(['Começando agora','Às vezes','Regularmente']),
  medication:z.enum(['Não informado','Não utilizo','Tirzepatida','Retatrutida','CagriSema','Glow / GHK-Cu','Semaglutida','Liraglutida','Outro']),
  limitations:z.string().max(1500), conditions:z.string().max(1500),
});
export type CareProfile=z.infer<typeof profileSchema>;
export const activityKinds=['walk','chair','wall','mobility'] as const;
export const activities={
 walk:{title:'Caminhada no seu ritmo',kind:'Caminhada',icon:'leaf',intro:'Um percurso plano, perto de casa ou em um espaço seguro.',steps:['Comece com poucos minutos, em ritmo confortável.','Mantenha um ritmo que permita conversar e faça pausas quando precisar.','Aumente o tempo gradualmente, conforme sua tolerância.']},
 chair:{title:'Sentar e levantar',kind:'Força',icon:'activity',intro:'Um movimento do dia a dia para trabalhar as pernas.',steps:['Use uma cadeira firme, sem rodinhas, encostada na parede.','Com os pés apoiados, levante e sente devagar. Use os braços para apoio se necessário.','Faça apenas repetições confortáveis, respirando normalmente. Descanse entre as tentativas.']},
 wall:{title:'Apoio na parede',kind:'Força',icon:'activity',intro:'Uma opção simples de força para braços e peito.',steps:['Fique de frente para uma parede firme, com as mãos na altura do peito.','Dobre os cotovelos devagar, aproximando o corpo da parede, e empurre para voltar.','Mantenha os pés firmes e o corpo alinhado. Ajuste a distância para ficar confortável, sem dor.']},
 mobility:{title:'Pausa de mobilidade',kind:'Mobilidade',icon:'sun',intro:'Uma pausa curta para movimentar o corpo com conforto.',steps:['Sente em uma cadeira firme, com os pés apoiados.','Movimente os tornozelos e faça círculos suaves com os ombros.','Use movimentos lentos e dentro de uma amplitude confortável. Não force articulações doloridas.']},
} as const;
export const activitySchema=z.object({
 id:z.string().min(1), activity:z.enum(activityKinds),
 date:dateSchema,
 minutes:z.number().int().min(1,'Informe pelo menos 1 minuto.').max(180,'Registre até 180 minutos por atividade.'),
 effort:z.enum(['Leve','Moderado','Intenso']), note:z.string().max(500),
});
export type ActivityLog=z.infer<typeof activitySchema>;
export const careRecordSchema=z.object({
 version:z.literal(1),savedAt:z.string(),profile:profileSchema,
 weights:z.array(z.object({date:dateSchema,kg:z.number().min(20).max(500)})).max(1000),
 logs:z.array(activitySchema).max(5000),
});
export type CareRecord=z.infer<typeof careRecordSchema>;
export function demoCareRecord(id:string):CareRecord|null {
 const plan=demoNutritionRecord(id)?.published;
 if(!plan)return null;
 const index=Number(id.slice(-3))-1;
 const heights=[165,178,162,175,168,180,160,173],weights=[82.4,96.2,78.6,92,85.1,101.3,73.8,89.5];
 const kg=weights[index]!,today=localDate();
 const logs:ActivityLog[]=[];
 if(index<4) {
  logs.push({id:'demo-walk',activity:'walk',date:weekStart(),minutes:15,effort:'Leve',note:'Registro fictício para apresentação.'});
  const date=daysAgo(Math.max(0,(new Date().getDay()+6)%7-2));
  if(date>=weekStart())logs.push({id:'demo-chair',activity:'chair',date,minutes:5,effort:'Leve',note:'Exemplo de sessão curta, sem dor.'});
 }
 return {version:1,savedAt:'demo-care-v1:'+id,profile:{
 id,channel:'clinic',name:plan.patientName,birthDate:(1986-index)+'-05-12',email:'',phone:'',
 heightCm:heights[index]!,weightKg:kg,goal:'Saúde e disposição',level:'Começando agora',
 medication:plan.medication as CareProfile['medication'],limitations:'',conditions:'',
 },weights:[{date:daysAgo(35),kg:kg+3.6},{date:daysAgo(21),kg:kg+2},{date:today,kg}],logs};
}
export function weeklyStats(logs:ActivityLog[],today=localDate(),start=weekStart()) {
 const week=logs.filter(l=>l.date>=start&&l.date<=today);
 return {minutes:week.reduce((s,l)=>s+l.minutes,0),days:new Set(week.map(l=>l.date)).size,
 strengthDays:new Set(week.filter(l=>l.activity==='chair'||l.activity==='wall').map(l=>l.date)).size};
}
