import { useEffect, useState } from 'react';
import {
 coordinationRecordSchema, journalEntrySchema, instructionInputSchema, reviewRequestInputSchema,
 reviewResponseSchema, expectationSchema, coordinationDateSchema, demoCoordination, emptyCoordination,
 type CoordinationRecord, type JournalEntry, type InstructionInput, type Expectation, type ReviewRequest,
} from '../domain/coordination';
import { readCare, careEvent, careKey } from './care-store';
import { localDate } from '../domain/care';

export const coordinationPrefix = 'tirzelife-coordination-demo-v1:';
export const coordinationEvent = 'tirzelife-coordination-updated';
export function coordinationKey(id: string) { return coordinationPrefix + encodeURIComponent(id); }
export function readCoordination(id: string): CoordinationRecord | null {
 if (typeof window === 'undefined' || !id) return null;
 const care = readCare(id);
 if (!care) return null;
 const raw = localStorage.getItem(coordinationKey(id));
 const record = raw ? coordinationRecordSchema.parse(JSON.parse(raw))
  : care.profile.channel === 'clinic' ? demoCoordination(id) : emptyCoordination(id);
 if (record.patientId !== id) throw new Error('Este histórico pertence a outra pessoa.');
 if (care.profile.channel !== 'clinic' && (record.instructions.length || record.requests.length || record.expectations.length))
  throw new Error('O cadastro individual não possui equipe vinculada nesta demonstração.');
 return record;
}
function currentRecord(id: string, clinicOnly = false) {
 const care = readCare(id);
 if (!care) throw new Error('Complete o cadastro antes de registrar seu acompanhamento.');
 if (clinicOnly && care.profile.channel !== 'clinic') throw new Error('Este paciente não possui vínculo com a clínica.');
 const current = readCoordination(id);
 if (!current) throw new Error('Histórico não encontrado.');
 return current;
}
function checkVersion(current: CoordinationRecord, expectedSavedAt: string) {
 if (current.savedAt !== expectedSavedAt) throw new Error('O acompanhamento mudou em outra aba. Reabra a edição para carregar as informações atuais.');
}
function write(record: CoordinationRecord): CoordinationRecord {
 const next = coordinationRecordSchema.parse({ ...record, savedAt: new Date().toISOString() + ':' + crypto.randomUUID() });
 try { localStorage.setItem(coordinationKey(next.patientId), JSON.stringify(next)); }
 catch { throw new Error('Não foi possível salvar. Verifique o espaço e a permissão de armazenamento deste navegador.'); }
 window.dispatchEvent(new CustomEvent(coordinationEvent, { detail: { patientId: next.patientId } }));
 return next;
}
export function addJournalEntry(id: string, input: Omit<JournalEntry, 'recordedAt'> & { recordedAt?: string }): CoordinationRecord {
 const current = currentRecord(id);
 const entry = journalEntrySchema.parse({ ...input, recordedAt: new Date().toISOString() });
 if (Date.parse(entry.occurredAt) > Date.now()) throw new Error('O acontecimento deve ter ocorrido agora ou no passado.');
 const existing = current.journal.find(item => item.id === entry.id);
 if (existing) {
  const { recordedAt: previousTime, ...previous } = existing;
  const { recordedAt: nextTime, ...next } = entry;
  if (JSON.stringify(previous) !== JSON.stringify(next)) throw new Error('Este identificador já foi utilizado por outro registro.');
  return current;
 }
 if (entry.supersedesEntryId) {
  if (!current.journal.some(item => item.id === entry.supersedesEntryId)) throw new Error('Registro original não encontrado.');
  if (current.journal.some(item => item.supersedesEntryId === entry.supersedesEntryId)) throw new Error('Este registro já foi corrigido. Abra a versão mais recente.');
 }
 return write({ ...current, journal: [...current.journal, entry] });
}
export function saveInstruction(id: string, input: InstructionInput, expectedSavedAt: string): CoordinationRecord {
 const current = currentRecord(id, true); checkVersion(current, expectedSavedAt);
 const checked = instructionInputSchema.parse(input);
 const previous = current.instructions.find(item => item.id === checked.id);
 if (previous && previous.title === checked.title && previous.body === checked.body && previous.category === checked.category && previous.professional === checked.professional) return current;
 const revision = (previous?.revision ?? 0) + 1;
 const { id: instructionId, ...fields } = checked;
 const version = { ...fields, revision, updatedAt: new Date().toISOString() };
 const instruction = { ...checked, revision, versions: [...(previous?.versions ?? []), version] };
 return write({ ...current, instructions: previous
  ? current.instructions.map(item => item.id === instructionId ? instruction : item)
  : [...current.instructions, instruction] });
}
export function createReviewRequest(id: string, input: { id: string; instructionId: string; reason: ReviewRequest['reason']; originalText: string; expectedRevision?: number }): CoordinationRecord {
 const current = currentRecord(id, true);
 const checked = reviewRequestInputSchema.parse(input);
 const existing = current.requests.find(item => item.id === checked.id);
 if (existing) {
  if (existing.instructionId !== checked.instructionId || existing.reason !== checked.reason || existing.originalText !== checked.originalText)
   throw new Error('Este identificador já foi utilizado por outra solicitação.');
  return current;
 }
 const instruction = current.instructions.find(item => item.id === checked.instructionId);
 if (!instruction) throw new Error('Orientação não encontrada. Atualize a tela.');
 if (input.expectedRevision !== undefined && input.expectedRevision !== instruction.revision) throw new Error('Esta orientação mudou. Reabra a solicitação para ler a versão atual.');
 const now = new Date().toISOString();
 const request: ReviewRequest = {
  ...checked, instructionSnapshot: { ...instruction.versions[instruction.versions.length - 1]! },
  createdAt: now, updatedAt: now, status: 'open', assignedTo: '', dueDate: '', responses: [],
 };
 return write({ ...current, requests: [...current.requests, request] });
}
function requestById(record: CoordinationRecord, requestId: string) {
 const request = record.requests.find(item => item.id === requestId);
 if (!request) throw new Error('Solicitação não encontrada.');
 return request;
}
function replaceRequest(record: CoordinationRecord, request: ReviewRequest) {
 return write({ ...record, requests: record.requests.map(item => item.id === request.id ? request : item) });
}
export function assignReviewRequest(id: string, requestId: string, assignedTo: string, dueDate: string, expectedSavedAt: string): CoordinationRecord {
 const current = currentRecord(id, true); checkVersion(current, expectedSavedAt);
 const request = requestById(current, requestId);
 const author = assignedTo.trim();
 if (!author || author.length > 120) throw new Error('Informe o responsável pela revisão.');
 if (dueDate) {
  coordinationDateSchema.parse(dueDate);
  const today = new Date(); const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  if (dueDate < date) throw new Error('Defina o retorno para hoje ou uma data futura.');
 }
 if (request.status === 'resolved') throw new Error('Esta solicitação já foi concluída.');
 return replaceRequest(current, { ...request, assignedTo: author, dueDate, status: request.status === 'awaiting_patient' ? 'awaiting_patient' : 'in_review', updatedAt: new Date().toISOString() });
}
export const startReview = assignReviewRequest;
export function respondToReview(id: string, requestId: string, input: { id: string; author: string; text: string }, expectedSavedAt: string): CoordinationRecord {
 const current = currentRecord(id, true);
 const request = requestById(current, requestId);
 const existing = request.responses.find(item => item.id === input.id);
 if (existing) {
  if (existing.authorRole !== 'team' || existing.author !== input.author || existing.text !== input.text) throw new Error('Este identificador já foi utilizado por outra resposta.');
  return current;
 }
 checkVersion(current, expectedSavedAt);
 if (request.status === 'resolved') throw new Error('Esta solicitação já foi concluída.');
 const now = new Date().toISOString();
 const response = reviewResponseSchema.parse({ ...input, authorRole: 'team', createdAt: now });
 return replaceRequest(current, { ...request, assignedTo: request.assignedTo || response.author,
  status: 'awaiting_patient', responses: [...request.responses, response], updatedAt: now });
}
export function confirmReviewResponse(id: string, requestId: string, input: { id: string; text: string; outcome: 'resolved' | 'still_difficult' }, expectedSavedAt: string): CoordinationRecord {
 const current = currentRecord(id, true);
 const request = requestById(current, requestId);
 const existing = request.responses.find(item => item.id === input.id);
 if (existing) {
  if (existing.authorRole !== 'patient' || existing.text !== input.text || existing.outcome !== input.outcome) throw new Error('Este identificador já foi utilizado por outra resposta.');
  return current;
 }
 checkVersion(current, expectedSavedAt);
 if (request.status !== 'awaiting_patient') throw new Error('Aguarde a resposta da equipe antes de confirmar.');
 const now = new Date().toISOString();
 const response = reviewResponseSchema.parse({ ...input, authorRole: 'patient', author: 'Paciente (demonstração)', createdAt: now });
 return replaceRequest(current, { ...request, status: input.outcome === 'resolved' ? 'resolved' : 'open',
  responses: [...request.responses, response], updatedAt: now });
}
export function saveExpectation(id: string, input: Expectation, expectedSavedAt: string): CoordinationRecord {
 const current = currentRecord(id, true); checkVersion(current, expectedSavedAt);
 const checked = expectationSchema.parse(input);
 const previous = current.expectations.find(item => item.id === checked.id);
 // A new monitoring period starts on resume; paused dates must not become missing records.
 if (previous && !previous.enabled && checked.enabled && checked.startDate < localDate())
  throw new Error('Ao retomar, defina o início para hoje ou uma data futura. Os dias pausados não serão cobrados.');
 return write({ ...current, expectations: current.expectations.some(item => item.id === checked.id)
  ? current.expectations.map(item => item.id === checked.id ? checked : item) : [...current.expectations, checked] });
}
export function useCoordination(id: string) {
 const [record, setRecord] = useState<CoordinationRecord | null>(null), [error, setError] = useState('');
 useEffect(() => {
  const refresh = () => { try { setRecord(readCoordination(id)); setError(''); }
   catch { setRecord(null); setError('Não foi possível ler o acompanhamento local. Os dados existentes foram preservados.'); } };
  const storage = (event: StorageEvent) => { if (!event.key || event.key === coordinationKey(id) || event.key === careKey(id)) refresh(); };
  const changed = (event: Event) => { const patientId = (event as CustomEvent<{ patientId?: string }>).detail?.patientId; if (!patientId || patientId === id) refresh(); };
  refresh(); window.addEventListener(coordinationEvent, changed); window.addEventListener(careEvent, refresh); window.addEventListener('storage', storage);
  return () => { window.removeEventListener(coordinationEvent, changed); window.removeEventListener(careEvent, refresh); window.removeEventListener('storage', storage); };
 }, [id]);
 return { record: record?.patientId === id ? record : null, error };
}
