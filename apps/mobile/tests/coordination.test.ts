import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { demoCareRecord, type CareProfile } from '../src/domain/care';
import { saveProfile } from '../src/store/care-store';
import {
 activeJournalEntries, coordinationRecordSchema, emptyCoordination, missingExpectedEntries,
 journalEntrySchema, expectationSchema, type JournalEntry, type Expectation,
} from '../src/domain/coordination';
import {
 readCoordination, coordinationKey, coordinationEvent, addJournalEntry, saveInstruction,
 createReviewRequest, assignReviewRequest, respondToReview, confirmReviewResponse, saveExpectation,
} from '../src/store/coordination-store';

describe('shared coordination and negotiated care plan', () => {
 beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 22, 12));
  const memory = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => memory.get(key) ?? null,
   setItem: (key: string, value: string) => memory.set(key, value), key: (index: number) => [...memory.keys()][index] ?? null,
   get length() { return memory.size; } });
  vi.stubGlobal('window', new EventTarget());
 });
 afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
 const profile = (id: string, channel: CareProfile['channel'] = 'clinic') => ({ ...demoCareRecord('TL-001')!.profile, id, channel });
 const journal = (id: string, patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id, category: 'note', originalText: '  Ontem não tive enjoo. Quero tirar uma dúvida.  ',
  occurredAt: new Date(2026, 9, 21, 9).toISOString(), recordedAt: new Date().toISOString(), ...patch,
 });
 const instruction = { id: 'orientation', title: 'Organização da rotina', body: 'Conte sobre sua rotina para a equipe.', category: 'routine' as const, professional: 'Equipe (demonstração)' };
 const expectation: Expectation = { id: 'daily', category: 'checkin', frequency: 'daily', startDate: '2026-10-19', enabled: true };
 function createPlan(id = 'CUSTOM') {
  saveProfile(profile(id), null);
  const first = readCoordination(id)!;
  return saveInstruction(id, instruction, first.savedAt);
 }
 function createRequest() {
  createPlan();
  return createReviewRequest('CUSTOM', { id: 'help', instructionId: instruction.id, reason: 'schedule', originalText: 'Trabalho em plantão.' });
 }
 it('seeds only the eight demonstration patients and starts new registrations empty', () => {
  expect(readCoordination('TL-001')!.requests).toHaveLength(1);
  expect(readCoordination('TL-008')!.instructions).toHaveLength(1);
  expect(readCoordination('TL-009')).toBeNull();
  saveProfile(profile('CUSTOM'), null);
  expect(readCoordination('CUSTOM')!.instructions).toEqual([]);
  expect(readCoordination('CUSTOM')!.journal).toEqual([]);
 });
 it('preserves original wording, occurred time and assigns actual recording time', () => {
  saveProfile(profile('INDIVIDUAL', 'individual'), null);
  const entry = journal('report', { recordedAt: '2000-01-01T00:00:00Z' });
  const record = addJournalEntry('INDIVIDUAL', entry);
  expect(record.journal[0]!.originalText).toBe(entry.originalText);
  expect(record.journal[0]!.occurredAt).toBe(entry.occurredAt);
  expect(record.journal[0]!.recordedAt).toBe(new Date().toISOString());
  expect(record.journal[0]!.explicitNotDone).toBeUndefined();
 });
 it('isolates individual diaries from all team mutations', () => {
  saveProfile(profile('INDIVIDUAL', 'individual'), null);
  const record = addJournalEntry('INDIVIDUAL', journal('entry'));
  expect(() => saveInstruction('INDIVIDUAL', instruction, record.savedAt)).toThrow('vínculo');
  expect(() => createReviewRequest('INDIVIDUAL', { id: 'help', instructionId: 'x', reason: 'other', originalText: 'Dúvida' })).toThrow('vínculo');
  expect(() => saveExpectation('INDIVIDUAL', expectation, record.savedAt)).toThrow('vínculo');
  expect(() => assignReviewRequest('INDIVIDUAL', 'x', 'Equipe', '', record.savedAt)).toThrow('vínculo');
  expect(() => respondToReview('INDIVIDUAL', 'x', { id: 'r', author: 'Equipe', text: 'Resposta' }, record.savedAt)).toThrow('vínculo');
  expect(readCoordination('INDIVIDUAL')!.instructions).toEqual([]);
 });
 it('rejects impossible dates, future events and incompatible quantities', () => {
  expect(expectationSchema.safeParse({ ...expectation, startDate: '2026-02-30' }).success).toBe(false);
  expect(journalEntrySchema.safeParse(journal('x', { occurredAt: '2026-02-30T12:00:00Z' })).success).toBe(false);
  expect(journalEntrySchema.safeParse(journal('x', { category: 'water', amountMl: 250, explicitNotDone: true })).success).toBe(false);
  expect(journalEntrySchema.safeParse(journal('x', { amountMl: 250 })).success).toBe(false);
  expect(() => addJournalEntry('TL-001', journal('future', { occurredAt: new Date(2026, 9, 23).toISOString() }))).toThrow('passado');
 });
 it('makes retry IDs idempotent and rejects reuse for different data', () => {
  const first = addJournalEntry('TL-001', journal('new'));
  const retry = addJournalEntry('TL-001', journal('new'));
  expect(retry.savedAt).toBe(first.savedAt);
  expect(() => addJournalEntry('TL-001', journal('new', { originalText: 'Outra coisa' }))).toThrow('identificador');
  expect(retry.journal.filter(item => item.id === 'new')).toHaveLength(1);
 });
 it('appends corrections without deleting originals or allowing divergent correction branches', () => {
  addJournalEntry('TL-001', journal('original'));
  const record = addJournalEntry('TL-001', journal('correction', { supersedesEntryId: 'original', originalText: 'Correção: foi anteontem.', occurredAt: new Date(2026, 9, 20, 9).toISOString() }));
  expect(record.journal.find(item => item.id === 'original')!.originalText).toBe(journal('original').originalText);
  expect(activeJournalEntries(record).map(item => item.id)).not.toContain('original');
  expect(() => addJournalEntry('TL-001', journal('second', { supersedesEntryId: 'original' }))).toThrow('já foi corrigido');
  expect(() => addJournalEntry('TL-001', journal('missing', { supersedesEntryId: 'unknown' }))).toThrow('não encontrado');
 });
 it('retains instruction snapshots and rejects stale changes', () => {
  const withRequest = createRequest();
  const snapshot = withRequest.requests[0]!.instructionSnapshot;
  const updated = saveInstruction('CUSTOM', { ...instruction, body: 'Orientação revisada pela equipe.' }, withRequest.savedAt);
  expect(updated.instructions[0]!.versions).toHaveLength(2);
  expect(updated.requests[0]!.instructionSnapshot).toEqual(snapshot);
  expect(() => saveInstruction('CUSTOM', instruction, withRequest.savedAt)).toThrow('outra aba');
  expect(coordinationRecordSchema.safeParse(updated).success).toBe(true);
 });
 it('does not attach a patient request to an unseen updated instruction', () => {
  const initial = createPlan();
  const updated = saveInstruction('CUSTOM', { ...instruction, body: 'Versão nova.' }, initial.savedAt);
  expect(() => createReviewRequest('CUSTOM', { id: 'stale', instructionId: instruction.id, reason: 'other', originalText: 'Dúvida.', expectedRevision: 1 })).toThrow('orientação mudou');
  const request = createReviewRequest('CUSTOM', { id: 'fresh', instructionId: instruction.id, reason: 'other', originalText: 'Dúvida.', expectedRevision: updated.instructions[0]!.revision });
  expect(request.requests[0]!.instructionSnapshot.revision).toBe(2);
 });
 it('supports responsibility, response, patient reopening and final confirmation', () => {
  let record = createRequest();
  record = assignReviewRequest('CUSTOM', 'help', 'Nutrição (demonstração)', '2026-10-23', record.savedAt);
  expect(record.requests[0]!.status).toBe('in_review');
  const beforeReply = record.savedAt;
  const response = { id: 'reply-1', author: 'Equipe (demonstração)', text: 'Vamos alinhar os horários na consulta.' };
  record = respondToReview('CUSTOM', 'help', response, record.savedAt);
  expect(record.requests[0]!.status).toBe('awaiting_patient');
  expect(respondToReview('CUSTOM', 'help', response, beforeReply).savedAt).toBe(record.savedAt);
  expect(() => confirmReviewResponse('CUSTOM', 'help', { id: 'patient-stale', text: 'Entendi.', outcome: 'resolved' }, beforeReply)).toThrow('outra aba');
  record = confirmReviewResponse('CUSTOM', 'help', { id: 'patient-1', text: 'Ainda tenho dificuldade.', outcome: 'still_difficult' }, record.savedAt);
  expect(record.requests[0]!.status).toBe('open');
  record = respondToReview('CUSTOM', 'help', { ...response, id: 'reply-2', text: 'Revisão combinada com você.' }, record.savedAt);
  record = confirmReviewResponse('CUSTOM', 'help', { id: 'patient-2', text: 'Agora entendi.', outcome: 'resolved' }, record.savedAt);
  expect(record.requests[0]!.status).toBe('resolved');
  expect(record.requests[0]!.responses).toHaveLength(4);
  expect(() => respondToReview('CUSTOM', 'help', { ...response, id: 'reply-3' }, record.savedAt)).toThrow('concluída');
 });
 it('keeps patient confirmation available when reassigned after a team reply', () => {
  let record = createRequest();
  record = respondToReview('CUSTOM', 'help', { id: 'reply', author: 'Equipe', text: 'Vamos combinar a revisão.' }, record.savedAt);
  record = assignReviewRequest('CUSTOM', 'help', 'Outra pessoa da equipe', '2026-10-23', record.savedAt);
  expect(record.requests[0]!.status).toBe('awaiting_patient');
  record = confirmReviewResponse('CUSTOM', 'help', { id: 'confirmation', text: 'Entendi.', outcome: 'resolved' }, record.savedAt);
  expect(record.requests[0]!.status).toBe('resolved');
 });
 it('does not allow patient confirmation before a team response or past deadlines', () => {
  const record = createRequest();
  expect(() => confirmReviewResponse('CUSTOM', 'help', { id: 'p', text: 'Ok', outcome: 'resolved' }, record.savedAt)).toThrow('Aguarde');
  expect(() => assignReviewRequest('CUSTOM', 'help', 'Equipe', '2026-10-21', record.savedAt)).toThrow('futura');
 });
 it('reports only completed expected periods, never today or disabled expectations', () => {
  const record = emptyCoordination('CUSTOM'); record.expectations = [{ ...expectation }];
  const missing = missingExpectedEntries(record, '2026-10-22');
  expect(missing.map(item => item.periodStart)).toEqual(['2026-10-21', '2026-10-20', '2026-10-19']);
  expect(missing.every(item => item.label === 'Sem registro')).toBe(true);
  record.expectations[0]!.enabled = false;
  expect(missingExpectedEntries(record, '2026-10-22')).toEqual([]);
 });
 it('resumes paused expectations with a new period instead of creating gaps during the pause', () => {
  let record = createPlan();
  record = saveExpectation('CUSTOM', expectation, record.savedAt);
  record = saveExpectation('CUSTOM', { ...expectation, enabled: false }, record.savedAt);
  vi.setSystemTime(new Date(2026, 9, 25, 12));
  expect(() => saveExpectation('CUSTOM', expectation, record.savedAt)).toThrow('Ao retomar');
  expect(readCoordination('CUSTOM')!.expectations[0]!.enabled).toBe(false);
  record = saveExpectation('CUSTOM', { ...expectation, startDate: '2026-10-25' }, record.savedAt);
  expect(missingExpectedEntries(record, '2026-10-25')).toEqual([]);
  expect(missingExpectedEntries(record, '2026-10-26').map(item => item.periodStart)).toEqual(['2026-10-25']);
 });
 it('treats explicit non-completion as information and applies retroactive corrections to gaps', () => {
  const record = emptyCoordination('CUSTOM'); record.expectations = [{ ...expectation }];
  record.journal = [journal('not-done', { category: 'checkin', explicitNotDone: true })];
  expect(missingExpectedEntries(record, '2026-10-22').map(item => item.periodStart)).not.toContain('2026-10-21');
  record.journal.push(journal('corrected', { category: 'checkin', supersedesEntryId: 'not-done', occurredAt: new Date(2026, 9, 20, 9).toISOString() }));
  expect(missingExpectedEntries(record, '2026-10-22').map(item => item.periodStart)).toEqual(['2026-10-21', '2026-10-19']);
 });
 it('evaluates weekly windows from startDate and limits history to fourteen days', () => {
  const record = emptyCoordination('CUSTOM');
  record.expectations = [{ ...expectation, frequency: 'weekly', startDate: '2026-10-10' }];
  expect(missingExpectedEntries(record, '2026-10-22')).toEqual([{ expectationId: 'daily', category: 'checkin', periodStart: '2026-10-10', periodEnd: '2026-10-16', label: 'Sem registro' }]);
  record.expectations = [{ ...expectation, startDate: '2020-01-01' }];
  expect(missingExpectedEntries(record, '2026-10-22', 999)).toHaveLength(14);
 });
 it('rejects corrupt or mismatched data without overwriting it', () => {
  const record = createRequest();
  localStorage.setItem(coordinationKey('TL-001'), JSON.stringify(record));
  expect(() => readCoordination('TL-001')).toThrow('outra pessoa');
  localStorage.setItem(coordinationKey('CUSTOM'), '{');
  expect(() => addJournalEntry('CUSTOM', journal('unsafe'))).toThrow();
  expect(localStorage.getItem(coordinationKey('CUSTOM'))).toBe('{');
 });
 it('notifies same-tab listeners only after a successful save and reports storage errors', () => {
  const listener = vi.fn(); window.addEventListener(coordinationEvent, listener);
  addJournalEntry('TL-001', journal('ok')); expect(listener).toHaveBeenCalledTimes(1);
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  expect(() => addJournalEntry('TL-001', journal('failed'))).toThrow('Não foi possível salvar');
  expect(listener).toHaveBeenCalledTimes(1);
  expect(readCoordination('TL-001')!.journal.some(item => item.id === 'failed')).toBe(false);
 });
});
