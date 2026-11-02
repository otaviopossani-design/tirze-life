import { useEffect, useState } from 'react';
import { useCoordination, addJournalEntry } from '../store/coordination-store';
import type { JournalEntry } from '../domain/coordination';
import { localDate } from '../domain/care';

export function useQuickJournal(patientId: string) {
  const {record,error}=useCoordination(patientId);
  const [writeError,setWriteError]=useState('');
  useEffect(()=>setWriteError(''),[patientId]);
  const superseded=new Set((record?.journal??[]).map(e=>e.supersedesEntryId).filter(Boolean));
  const journal=(record?.journal??[]).filter(e=>!superseded.has(e.id)).sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt)||Date.parse(b.recordedAt)-Date.parse(a.recordedAt));
  const today=journal.filter(e=>localDate(new Date(e.occurredAt))===localDate());
  const water=today.filter(e=>e.category==='water'&&!e.explicitNotDone).reduce((sum,e)=>sum+(e.amountMl??0),0);
  function save(category:JournalEntry['category'],originalText:string,extras:Partial<JournalEntry>={}):boolean {
    try {
      addJournalEntry(patientId,{...extras,id:crypto.randomUUID(),category,originalText,occurredAt:extras.occurredAt??new Date().toISOString()});
      setWriteError('');return true;
    } catch(e) {setWriteError(e instanceof Error?e.message:'Não foi possível salvar o registro.');return false;}
  }
  return {record,journal,water,error:error||writeError,save,
    mood:today.find(e=>e.category==='checkin')?.originalText??'',
    entries:journal.filter(e=>e.category==='note'),
    moments:journal.filter(e=>e.category==='moment'),
    applications:journal.filter(e=>e.category==='medication'&&!e.explicitNotDone)};
}
export function localDateTime(date=new Date()) {
 const shifted=new Date(date.getTime()-date.getTimezoneOffset()*60000);return shifted.toISOString().slice(0,16);
}
