import { useEffect, useState } from 'react';
import { activitySchema,careRecordSchema,profileSchema,demoCareRecord,localDate,daysAgo,type CareProfile,type CareRecord,type ActivityLog } from '../domain/care';
export const carePrefix='tirzelife-care-demo-v1:';
export const careEvent='tirzelife-care-updated';
export function careKey(id:string) { return carePrefix+encodeURIComponent(id); }
export function readCare(id:string):CareRecord|null {
 if(typeof window==='undefined'||!id)return null;
 const raw=localStorage.getItem(careKey(id));
 const record=raw?careRecordSchema.parse(JSON.parse(raw)):demoCareRecord(id);
 if(record&&record.profile.id!==id)throw new Error('Este cadastro pertence a outra pessoa.');
 return record;
}
export function listClinicCare():CareRecord[] {
 if(typeof window==='undefined')return [];
 const ids=new Set(Array.from({length:8},(_,i)=>'TL-'+String(i+1).padStart(3,'0')));
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(carePrefix))ids.add(decodeURIComponent(k.slice(carePrefix.length)));}
 const records:CareRecord[]=[];
 for(const id of ids){const record=readCare(id);if(record?.profile.channel==='clinic')records.push(record);}
 return records;
}
function write(record:CareRecord) {
 const next=careRecordSchema.parse({...record,savedAt:new Date().toISOString()+':'+crypto.randomUUID()});
 try{localStorage.setItem(careKey(next.profile.id),JSON.stringify(next));}
 catch{throw new Error('Não foi possível salvar. Verifique o espaço e a permissão de armazenamento deste navegador.');}
 window.dispatchEvent(new CustomEvent(careEvent));
 return next;
}
export function saveProfile(profile:CareProfile,expected:string|null) {
 const checked=profileSchema.safeParse(profile);
 if(!checked.success)throw new Error(checked.error.issues[0]?.message??'Revise o cadastro.');
 const current=readCare(profile.id);
 if((current?.savedAt??null)!==expected)throw new Error('O cadastro mudou em outra aba. Cancele a edição e abra novamente para carregar os dados atuais.');
 if(current&&current.profile.channel!==profile.channel)throw new Error('O vínculo do cadastro não pode ser alterado por este formulário.');
 const weights=[...(current?.weights??[])];
 // The current measurement is one entry per date; unchanged weight does not create an artificial measurement.
 if(!current||current.profile.weightKg!==profile.weightKg) {
  const index=weights.findIndex(w=>w.date===localDate());
  const item={date:localDate(),kg:profile.weightKg};
  if(index<0)weights.push(item);else weights[index]=item;
 }
 return write({version:1,savedAt:'',profile:checked.data,weights,logs:current?.logs??[]});
}
export function addActivity(id:string,log:ActivityLog) {
 const current=readCare(id);if(!current)throw new Error('Complete seu cadastro antes de registrar atividades.');
 const checked=activitySchema.safeParse(log);
 if(!checked.success)throw new Error(checked.error.issues[0]?.message??'Revise o registro.');
 if(log.date>localDate()||log.date<daysAgo(365))throw new Error('Registre uma data passada ou de hoje, nos últimos 12 meses.');
 if(current.logs.some(l=>l.id===log.id))return current;
 return write({...current,logs:[...current.logs,checked.data]});
}
export function removeActivity(id:string,logId:string) {
 const current=readCare(id);if(!current)throw new Error('Cadastro não encontrado.');
 return write({...current,logs:current.logs.filter(l=>l.id!==logId)});
}
export function useCare(id:string) {
 const [record,setRecord]=useState<CareRecord|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  const refresh=()=>{try{setRecord(readCare(id));setError('');}catch{setRecord(null);setError('Não foi possível ler o cadastro local. Os dados existentes foram preservados.');}};
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===careKey(id))refresh();};
  refresh();window.addEventListener(careEvent,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(careEvent,refresh);window.removeEventListener('storage',storage);};
 },[id]);
 return {record:record?.profile.id===id?record:null,error};
}
