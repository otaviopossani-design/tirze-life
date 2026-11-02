import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { getClinicRecordSummary, clinicRecordReport } from '../src/components/clinic-record-summary';
import { demoCareRecord, localDate } from '../src/domain/care';
import { readRecord, recordKey, saveRecord } from '../src/store/nutrition-store';
import { saveProfile } from '../src/store/care-store';
import { addJournalEntry, readCoordination, saveInstruction, createReviewRequest } from '../src/store/coordination-store';

describe('clinic summaries derived from shared records', () => {
 beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 22, 12));
  const memory = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => memory.get(key) ?? null,
   setItem: (key: string, value: string) => memory.set(key, value), key: (index: number) => [...memory.keys()][index] ?? null,
   get length() { return memory.size; } });
  vi.stubGlobal('window', new EventTarget());
 });
 afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
 it('reports missing information as null and uses recorded water with the published target', () => {
  const summary = getClinicRecordSummary('TL-001');
  expect(summary.water).toBe(75); expect(summary.protein).toBeNull(); expect(summary.checkins).toBeNull();
  expect(summary.status).toBe('Retorno solicitado');
  expect(getClinicRecordSummary('TL-002').water).toBeNull();
 });
 it('counts meals only from today and the current published revision', () => {
  const record = readRecord('TL-002')!;
  const day = (new Date().getDay() + 6) % 7;
  const first = record.published!.days[day]![0]!;
  const logs = {
   [localDate() + ':' + record.revision + ':' + first.id]: { food: 'Registro atual', portion: 'Porção informada', profile: 'routine', recordedAt: new Date().toISOString() },
   [localDate() + ':' + (record.revision + 10) + ':lunch']: { food: 'Outra revisão', portion: 'Porção', profile: 'routine', recordedAt: new Date().toISOString() },
   ['2026-10-21:' + record.revision + ':dinner']: { food: 'Ontem', portion: 'Porção', profile: 'routine', recordedAt: new Date(2026, 9, 21, 20).toISOString() },
  };
  localStorage.setItem(recordKey('') + 'logs:' + encodeURIComponent('TL-002'), JSON.stringify(logs));
  expect(getClinicRecordSummary('TL-002').protein).toBe(25);
  const plan = structuredClone(record.published!); plan.waterTarget = null;
  saveRecord(plan, true, record.savedAt);
  expect(getClinicRecordSummary('TL-002').protein).toBeNull();
 });
 it('counts distinct check-in days and selects the latest note by actual time across offsets', () => {
  addJournalEntry('TL-002', { id: 'c1', category: 'checkin', originalText: 'Hoje', occurredAt: new Date().toISOString() });
  addJournalEntry('TL-002', { id: 'c2', category: 'checkin', originalText: 'Mais um hoje', occurredAt: new Date().toISOString() });
  addJournalEntry('TL-002', { id: 'c3', category: 'checkin', originalText: 'Ontem', occurredAt: new Date(2026, 9, 21, 12).toISOString() });
  addJournalEntry('TL-002', { id: 'old', category: 'checkin', originalText: 'Anterior ao período', occurredAt: new Date(2026, 9, 15, 12).toISOString() });
  addJournalEntry('TL-002', { id: 'later', category: 'note', originalText: 'Último relato original', occurredAt: '2026-10-20T08:00:00-03:00' });
  addJournalEntry('TL-002', { id: 'earlier', category: 'symptom', originalText: 'Relato anterior', occurredAt: '2026-10-20T10:00:00Z' });
  const summary = getClinicRecordSummary('TL-002');
  expect(summary.checkins).toBe(2); expect(summary.status).toBe('Em dia');
  expect(summary.note).toBe('Último relato original');
 });
 it('exports original corrections, instruction versions and the request snapshot', () => {
  let record = readCoordination('TL-002')!;
  record = saveInstruction('TL-002', { id: 'custom', title: 'Versão antiga', body: 'Texto original da equipe.', category: 'routine', professional: 'Equipe demo' }, record.savedAt);
  record = createReviewRequest('TL-002', { id: 'question', instructionId: 'custom', originalText: 'Minha dúvida original.', reason: 'understanding', expectedRevision: 1 });
  saveInstruction('TL-002', { id: 'custom', title: 'Versão nova', body: 'Texto atualizado.', category: 'routine', professional: 'Equipe demo' }, record.savedAt);
  addJournalEntry('TL-002', { id: 'original', category: 'note', originalText: 'Relato a preservar.', occurredAt: new Date().toISOString() });
  addJournalEntry('TL-002', { id: 'corrected', category: 'note', originalText: 'Correção acrescentada.', occurredAt: new Date().toISOString(), supersedesEntryId: 'original' });
  const report = clinicRecordReport('TL-002');
  for (const original of ['Texto original da equipe.', 'Texto atualizado.', 'Minha dúvida original.', 'Relato a preservar.', 'Correção acrescentada.', 'Correção do registro: original'])
   expect(report).toContain(original);
 });
 it('refuses unlinked individual profiles and surfaces corrupted nutrition logs', () => {
  saveProfile({ ...demoCareRecord('TL-001')!.profile, id: 'B2C', channel: 'individual' }, null);
  expect(() => getClinicRecordSummary('B2C')).toThrow('vínculo');
  expect(() => clinicRecordReport('B2C')).toThrow('vínculo');
  localStorage.setItem(recordKey('') + 'logs:' + encodeURIComponent('TL-002'), '{');
  expect(() => getClinicRecordSummary('TL-002')).toThrow();
  expect(() => clinicRecordReport('TL-002')).toThrow();
 });
});
